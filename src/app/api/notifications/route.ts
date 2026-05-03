import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const where = {
            userId: session.user.id,
            ...(unreadOnly && { isRead: false }),
        };

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: { userId: session.user.id, isRead: false },
            }),
        ]);

        return NextResponse.json({
            notifications,
            unreadCount,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/notifications - Create a notification (internal use)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins and internal users can create notifications manually
        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, type, title, message, link } = body;

        if (!userId || !type || !title || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, type, title, message' },
                { status: 400 }
            );
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link: link || null,
            },
        });

        return NextResponse.json(
            { message: 'Notification created', notification },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
