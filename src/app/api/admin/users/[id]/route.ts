import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/users/[id] - Get single user
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                phone: true,
                department: true,
                preferences: true,
                createdAt: true,
                updatedAt: true,
                vendor: {
                    select: {
                        id: true,
                        businessName: true,
                        kycStatus: true,
                        riskCategory: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, role, status, phone, department } = body;

        // Check user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: params.id },
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent self-demotion from admin
        if (existingUser.id === session.user.id && role && role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Cannot change your own role' },
                { status: 400 }
            );
        }

        // Check email uniqueness if changing
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email },
            });
            if (emailExists) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            }
        }

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role.toUpperCase();
        if (status !== undefined) updateData.status = status.toUpperCase();
        if (phone !== undefined) updateData.phone = phone;
        if (department !== undefined) updateData.department = department;

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: updateData as any,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                phone: true,
                department: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Prevent self-delete
        if (params.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete user (cascades to related records)
        await prisma.user.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
