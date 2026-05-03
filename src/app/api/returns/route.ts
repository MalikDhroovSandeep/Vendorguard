import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createNotification } from '@/lib/notifications';

// Generate unique return number
async function generateReturnNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.return.count({
        where: {
            returnNumber: {
                startsWith: `RTN-${year}`,
            },
        },
    });
    return `RTN-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/returns - List all returns
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const vendorId = searchParams.get('vendorId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (vendorId) where.vendorId = vendorId;

        const [returns, total] = await Promise.all([
            prisma.return.findMany({
                where,
                include: {
                    vendor: {
                        select: { id: true, businessName: true },
                    },
                    order: {
                        select: { id: true, orderNumber: true, title: true },
                    },
                    createdBy: {
                        select: { id: true, name: true },
                    },
                    items: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.return.count({ where }),
        ]);

        return NextResponse.json({
            returns,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching returns:', error);
        return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
    }
}

// POST /api/returns - Create a new return
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only internal users and admins can create returns
        const user = await prisma.user.findUnique({
            where: { email: session.user.email || '' },
        });

        if (!user || user.role === 'VENDOR') {
            return NextResponse.json({ error: 'Not authorized to create returns' }, { status: 403 });
        }

        const body = await request.json();
        const { orderId, reason, description, items } = body;

        if (!orderId || !reason || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Order ID, reason, and at least one item are required' },
                { status: 400 }
            );
        }

        // Get the order to get vendor info
        const order = await prisma.purchaseOrder.findUnique({
            where: { id: orderId },
            include: { vendor: true },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Calculate totals
        let totalQuantity = 0;
        let totalAmount = 0;
        const returnItems = items.map((item: { itemName: string; quantity: number; unitPrice: number; reason: string; description?: string }) => {
            const itemTotal = item.quantity * item.unitPrice;
            totalQuantity += item.quantity;
            totalAmount += itemTotal;
            return {
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: itemTotal,
                reason: item.reason || reason,
                description: item.description,
            };
        });

        // Generate return number
        const returnNumber = await generateReturnNumber();

        // Create return with items
        const newReturn = await prisma.return.create({
            data: {
                returnNumber,
                orderId,
                vendorId: order.vendorId,
                createdById: user.id,
                reason,
                description,
                totalQuantity,
                totalAmount,
                status: 'PENDING',
                items: {
                    create: returnItems,
                },
            },
            include: {
                vendor: { select: { id: true, businessName: true, userId: true } },
                order: { select: { id: true, orderNumber: true } },
                items: true,
            },
        });

        // Create notification for vendor
        await createNotification({
            userId: newReturn.vendor.userId,
            type: 'RETURN_CREATED',
            title: 'New Return Request',
            message: `Return ${returnNumber} has been created for order ${order.orderNumber}`,
            link: '/dashboard/vendor/returns',
        });

        return NextResponse.json(newReturn, { status: 201 });
    } catch (error) {
        console.error('Error creating return:', error);
        return NextResponse.json({ error: 'Failed to create return' }, { status: 500 });
    }
}
