import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { passwordResetTemplate } from '@/lib/email-templates';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return NextResponse.json({ message: 'If an account exists, you will receive a reset link.' });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Delete any existing tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new reset token
        await prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        // Build reset URL
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        // Send email
        await sendEmail({
            to: user.email,
            subject: '🔐 Reset Your Password - VendorGuard',
            html: passwordResetTemplate(user.name || 'User', resetUrl),
        });

        return NextResponse.json({ message: 'If an account exists, you will receive a reset link.' });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
