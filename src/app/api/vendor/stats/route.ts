import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/vendor/stats - Get dashboard stats for the logged-in vendor
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find vendor by user ID or email
        let vendor = await prisma.vendor.findFirst({
            where: { userId: session.user.id },
            select: { id: true, kycStatus: true, riskScore: true, riskCategory: true },
        });

        if (!vendor && session.user.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true },
            });
            if (user) {
                vendor = await prisma.vendor.findFirst({
                    where: { userId: user.id },
                    select: { id: true, kycStatus: true, riskScore: true, riskCategory: true },
                });
            }
        }

        if (!vendor) {
            return NextResponse.json({
                error: 'Vendor profile not found',
                stats: {
                    activeOrders: 0,
                    pendingInvoices: 0,
                    pendingInvoicesAmount: 0,
                    disputes: 0,
                    riskScore: null,
                    riskCategory: null,
                    kycStatus: 'NOT_STARTED',
                }
            }, { status: 200 });
        }

        // Get order stats
        const activeOrders = await prisma.purchaseOrder.count({
            where: {
                vendorId: vendor.id,
                status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS'] },
            },
        });

        // Get invoice stats
        const pendingInvoices = await prisma.invoice.aggregate({
            where: {
                vendorId: vendor.id,
                status: 'PENDING',
            },
            _count: true,
            _sum: { amount: true },
        });

        // Get dispute count
        const disputes = await prisma.dispute.count({
            where: {
                vendorId: vendor.id,
                status: { in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] },
            },
        });

        // Get recent activity (last 5 orders)
        const recentOrders = await prisma.purchaseOrder.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                orderNumber: true,
                title: true,
                status: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            stats: {
                activeOrders,
                pendingInvoices: pendingInvoices._count,
                pendingInvoicesAmount: pendingInvoices._sum.amount?.toNumber() || 0,
                disputes,
                riskScore: vendor.riskScore?.toNumber() || null,
                riskCategory: vendor.riskCategory,
                kycStatus: vendor.kycStatus,
            },
            recentActivity: recentOrders.map(order => ({
                id: order.id,
                type: 'order',
                title: `Purchase Order ${order.orderNumber}`,
                description: order.title,
                status: order.status,
                timestamp: order.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching vendor stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
