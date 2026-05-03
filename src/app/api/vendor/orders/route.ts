import { NextResponse } from 'next/server';
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

// GET /api/vendor/orders - Get orders for the logged-in vendor
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = await getVendorId(session);
        if (!vendorId) {
            return NextResponse.json({ orders: [] });
        }

        const orders = await prisma.purchaseOrder.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                orderNumber: true,
                title: true,
                description: true,
                amount: true,
                currency: true,
                status: true,
                expectedDelivery: true,
                actualDelivery: true,
                deliveryStatus: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            orders: orders.map(order => ({
                ...order,
                amount: order.amount.toNumber(),
            })),
        });
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
