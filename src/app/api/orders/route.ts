import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: Prisma.PurchaseOrderWhereInput = {};

        // Internal users only see their own orders; admins see all
        if (userRole === 'internal') {
            where.createdById = session.user.id as string;
        }

        if (status !== 'all') {
            where.status = status.toUpperCase() as any;
        }

        const [orders, total] = await Promise.all([
            prisma.purchaseOrder.findMany({
                where,
                include: {
                    vendor: {
                        select: {
                            id: true,
                            businessName: true,
                            riskCategory: true,
                        },
                    },
                    createdBy: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.purchaseOrder.count({ where }),
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { vendorId, title, amount, expectedDelivery, description } = body;

        // Validate required fields
        if (!vendorId || !title || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields: vendorId, title, amount' },
                { status: 400 }
            );
        }

        if (amount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be greater than 0' },
                { status: 400 }
            );
        }

        // Check vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // Generate order number
        const orderCount = await prisma.purchaseOrder.count();
        const orderNumber = `PO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

        const order = await prisma.purchaseOrder.create({
            data: {
                orderNumber,
                vendorId,
                createdById: session.user.id as string,
                title,
                description,
                amount: new Prisma.Decimal(amount),
                expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
                status: 'APPROVED',
            },
            include: {
                vendor: {
                    select: {
                        businessName: true,
                    },
                },
            },
        });

        return NextResponse.json(
            { message: 'Order created successfully', order },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
