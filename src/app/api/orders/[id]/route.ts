import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PUT /api/orders/[id] - Update order status
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        // Only internal/admin can approve, but vendor can update status (handled in vendor API)
        // Wait, vendor API is separate: /api/vendor/orders/[id]
        // This is generic admin/internal API
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { status } = body;
        const validStatuses = ['APPROVED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const order = await prisma.purchaseOrder.update({
            where: { id: params.id },
            data: { status },
        });

        return NextResponse.json({ message: 'Order updated successfully', order });

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
