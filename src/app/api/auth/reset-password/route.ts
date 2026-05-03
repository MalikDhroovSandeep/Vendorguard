import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken) {
            return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
        }

        if (resetToken.used || resetToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used: true },
            }),
        ]);

        return NextResponse.json({ message: 'Password reset successful!' });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}

// Verify token validity
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ valid: false });
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({ valid: true });

    } catch {
        return NextResponse.json({ valid: false });
    }
}
