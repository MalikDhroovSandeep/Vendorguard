import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PUT /api/notifications/mark-all-read - Mark all notifications as read
export async function PUT() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false,
            },
            data: { isRead: true },
        });

        return NextResponse.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
