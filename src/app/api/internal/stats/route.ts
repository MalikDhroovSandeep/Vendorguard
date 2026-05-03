import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/internal/stats - Get dashboard stats for internal users
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const userId = session.user.id as string;

        // Get user-specific stats in parallel (each internal user sees only their own data)
        const [
            vendorCount,
            activeOrderCount,
            pendingInvoiceCount,
            openDisputeCount,
            recentActivity,
            alerts,
        ] = await Promise.all([
            // Total vendors in system (shared info)
            prisma.vendor.count(),

            // Active purchase orders created by THIS user (not completed/cancelled)
            prisma.purchaseOrder.count({
                where: {
                    createdById: userId,
                    status: {
                        notIn: ['COMPLETED', 'CANCELLED'],
                    },
                },
            }),

            // Pending invoices for orders created by THIS user
            prisma.invoice.count({
                where: {
                    status: 'PENDING',
                    order: {
                        createdById: userId,
                    },
                },
            }),

            // Open disputes raised by THIS user
            prisma.dispute.count({
                where: {
                    raisedById: userId,
                    status: 'OPEN',
                },
            }),

            // Recent activity - orders created by THIS user (last 5)
            prisma.purchaseOrder.findMany({
                where: {
                    createdById: userId,
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    vendor: {
                        select: { businessName: true },
                    },
                },
            }),

            // Alerts - vendors pending KYC, high risk, etc. (shared system info)
            Promise.all([
                prisma.vendor.count({ where: { kycStatus: 'PENDING' } }),
                prisma.vendor.count({ where: { riskCategory: 'HIGH' } }),
            ]),
        ]);

        return NextResponse.json({
            stats: {
                vendorCount,
                activeOrderCount,
                pendingInvoiceCount,
                openDisputeCount,
            },
            recentActivity: recentActivity.map(order => ({
                id: order.orderNumber,
                vendor: order.vendor.businessName,
                type: 'Purchase Order',
                amount: order.amount.toString(),
                status: order.status,
                date: order.createdAt.toISOString().split('T')[0],
            })),
            alerts: {
                pendingKYC: alerts[0],
                highRiskVendors: alerts[1],
            },
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
