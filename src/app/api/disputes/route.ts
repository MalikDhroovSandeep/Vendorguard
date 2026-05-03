import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma, DisputeCategory, DisputePriority } from '@prisma/client';

// GET /api/disputes - List disputes
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

        const where: Prisma.DisputeWhereInput = {};

        // Internal users only see disputes they raised; admins see all
        if (userRole === 'internal') {
            where.raisedById = session.user.id as string;
        }

        if (status !== 'all') {
            where.status = status.toUpperCase() as any;
        }

        const [disputes, total, openCount, resolvedCount, highPriorityCount] = await Promise.all([
            prisma.dispute.findMany({
                where,
                include: {
                    vendor: {
                        select: {
                            businessName: true,
                            industryCategory: true,
                            riskCategory: true,
                            riskScore: true,
                        },
                    },
                    order: {
                        select: {
                            orderNumber: true,
                        },
                    },
                    raisedBy: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.dispute.count({ where }),
            prisma.dispute.count({ where: { status: 'OPEN' } }),
            prisma.dispute.count({ where: { status: 'RESOLVED' } }),
            prisma.dispute.count({ where: { priority: 'HIGH' } }), // Assuming 'HIGH' is the enum value
        ]);

        return NextResponse.json({
            disputes,
            stats: {
                total,
                open: openCount,
                resolved: resolvedCount,
                highPriority: highPriorityCount
            },
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching disputes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Map form values to DB enums
const categoryMap: Record<string, DisputeCategory> = {
    'late_delivery': 'DELIVERY',
    'incomplete_delivery': 'DELIVERY',
    'quality_issue': 'QUALITY',
    'damaged_goods': 'QUALITY',
    'incorrect_billing': 'PRICING',
    'payment': 'PAYMENT',
    'other': 'OTHER',
};

const priorityMap: Record<string, DisputePriority> = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH',
    'critical': 'CRITICAL',
};

// POST /api/disputes - Create dispute
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
        const { vendorId, orderId, subject, category, priority, amount, description } = body;

        // Validate required fields
        if (!vendorId || !subject || !category || !priority) {
            return NextResponse.json(
                { error: 'Missing required fields: vendorId, subject, category, priority' },
                { status: 400 }
            );
        }

        // Validate vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // Validate order if provided
        let orderUuid: string | null = null;
        if (orderId) {
            const order = await prisma.purchaseOrder.findFirst({
                where: {
                    OR: [
                        { id: orderId },
                        { orderNumber: orderId },
                    ],
                },
            });

            if (order) {
                orderUuid = order.id;
            }
        }

        // Generate dispute number
        const disputeCount = await prisma.dispute.count();
        const disputeNumber = `DSP-${new Date().getFullYear()}-${String(disputeCount + 1).padStart(4, '0')}`;

        const dispute = await prisma.dispute.create({
            data: {
                disputeNumber,
                vendorId,
                orderId: orderUuid,
                raisedById: session.user.id as string,
                subject,
                category: categoryMap[category] || 'OTHER',
                priority: priorityMap[priority] || 'MEDIUM',
                amount: amount ? new Prisma.Decimal(amount) : null,
                description,
                status: 'OPEN',
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
            { message: 'Dispute created successfully', dispute },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating dispute:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
    }
}
