import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface UserPreferences {
    emailAlerts?: boolean;
    highRiskVendors?: boolean;
    disputeUpdates?: boolean;
    invoiceReminders?: boolean;
    weeklyReports?: boolean;
}

// GET /api/user/settings - Get current user's settings
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find user by ID first, then fallback to email
        let user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                department: true,
                role: true,
                status: true,
                preferences: true,
                createdAt: true,
                vendor: { select: { id: true } },
            },
        });

        // Fallback: try to find by email if ID doesn't match
        if (!user && session.user.email) {
            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    department: true,
                    role: true,
                    status: true,
                    preferences: true,
                    createdAt: true,
                    vendor: { select: { id: true } },
                },
            });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Default preferences if not set
        const defaultPreferences: UserPreferences = {
            emailAlerts: true,
            highRiskVendors: true,
            disputeUpdates: true,
            invoiceReminders: false,
            weeklyReports: true,
        };

        return NextResponse.json({
            user: {
                ...user,
                preferences: user.preferences || defaultPreferences,
            },
        });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/user/settings - Update user settings
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, phone, department, preferences } = body;

        // Build update data - use Record type for Prisma compatibility
        const updateData: Record<string, unknown> = {};

        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (department !== undefined) updateData.department = department;
        if (preferences !== undefined) updateData.preferences = preferences;

        // Handle email change separately (need to check uniqueness)
        if (email !== undefined && email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            }
            updateData.email = email;
        }

        // First find the actual user (by email if ID doesn't match)
        let actualUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true },
        });
        if (!actualUser && session.user.email) {
            actualUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true },
            });
        }
        if (!actualUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: actualUser.id },
            data: updateData as Parameters<typeof prisma.user.update>[0]['data'],
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                department: true,
                role: true,
                status: true,
                preferences: true,
            },
        });

        return NextResponse.json({
            message: 'Settings updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
