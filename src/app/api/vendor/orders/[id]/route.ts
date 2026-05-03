import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Helper to get vendor ID from session
async function getVendorId(session: { user?: { id?: string; email?: string | null } }) {
    if (!session?.user?.id) return null;

    let vendor = await prisma.vendor.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
    });

    if (!vendor && session.user.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (user) {
            vendor = await prisma.vendor.findFirst({
                where: { userId: user.id },
                select: { id: true },
            });
        }
    }

    return vendor?.id || null;
}

// PUT /api/vendor/orders/[id] - Update order status
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = await getVendorId(session);
        if (!vendorId) {
            return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 });
        }

        const body = await request.json();
        const { status, deliveryDate } = body;
        const validStatuses = ['IN_PROGRESS', 'DELIVERED'];

        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Verify order belongs to vendor
        const existingOrder = await prisma.purchaseOrder.findUnique({
            where: { id: params.id },
        });

        if (!existingOrder || existingOrder.vendorId !== vendorId) {
            return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 });
        }

        // Update order
        const updateData: any = {
            status: status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'DELIVERED',
            deliveryStatus: status === 'DELIVERED' ? 'COMPLETED' : existingOrder.deliveryStatus,
        };

        if (status === 'DELIVERED') {
            updateData.actualDelivery = deliveryDate ? new Date(deliveryDate) : new Date();
        }

        const updatedOrder = await prisma.purchaseOrder.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json({ message: 'Order updated successfully', order: updatedOrder });

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
