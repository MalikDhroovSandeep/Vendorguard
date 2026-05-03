import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/vendors/[id] - Get vendor details by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admin and internal users can view vendor details
        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
                contact: true,
                kyc: true,
                purchaseOrders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        orderNumber: true,
                        title: true,
                        amount: true,
                        status: true,
                        expectedDelivery: true,
                        actualDelivery: true,
                        createdAt: true,
                    },
                },
                disputes: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        disputeNumber: true,
                        subject: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // Calculate stats
        const totalOrders = await prisma.purchaseOrder.count({
            where: { vendorId: id },
        });

        const deliveredOrders = await prisma.purchaseOrder.count({
            where: { vendorId: id, status: 'DELIVERED' },
        });

        const activeDisputes = await prisma.dispute.count({
            where: { vendorId: id, status: { in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] } },
        });

        // Transform response
        return NextResponse.json({
            vendor: {
                id: vendor.id,
                businessName: vendor.businessName,
                businessType: vendor.businessType,
                industryCategory: vendor.industryCategory,
                businessDescription: vendor.businessDescription,
                yearEstablished: vendor.yearEstablished,
                kycStatus: vendor.kycStatus,
                riskScore: vendor.riskScore?.toNumber() || null,
                riskCategory: vendor.riskCategory,
                status: vendor.status,
                createdAt: vendor.createdAt,
                email: vendor.user?.email,
                contactName: vendor.user?.name,
            },
            contact: vendor.contact,
            kyc: vendor.kyc ? {
                gstNumber: vendor.kyc.gstNumber,
                panNumber: vendor.kyc.panNumber,
                businessDocType: vendor.kyc.businessDocType,
                businessDocNumber: vendor.kyc.businessDocNumber,
                submittedAt: vendor.kyc.submittedAt,
                reviewedAt: vendor.kyc.reviewedAt,
                rejectionReason: vendor.kyc.rejectionReason,
            } : null,
            orders: vendor.purchaseOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                title: order.title,
                amount: order.amount.toNumber(),
                status: order.status,
                expectedDelivery: order.expectedDelivery,
                actualDelivery: order.actualDelivery,
                createdAt: order.createdAt,
            })),
            disputes: vendor.disputes,
            stats: {
                totalOrders,
                deliveredOrders,
                activeDisputes,
                onTimeRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
            },
        });
    } catch (error) {
        console.error('Error fetching vendor details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/vendors/[id] - Update vendor operational details
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { businessDescription, status, riskCategory } = body;

        const updateData: Record<string, unknown> = {};
        if (businessDescription !== undefined) updateData.businessDescription = businessDescription;
        if (status !== undefined) updateData.status = status;
        if (riskCategory !== undefined) updateData.riskCategory = riskCategory;

        const updatedVendor = await prisma.vendor.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ message: 'Vendor updated', vendor: updatedVendor });
    } catch (error) {
        console.error('Error updating vendor:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
