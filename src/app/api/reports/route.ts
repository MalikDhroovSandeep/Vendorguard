import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/reports - Get report data
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

        // Get vendor performance data
        const vendors = await prisma.vendor.findMany({
            include: {
                purchaseOrders: {
                    select: {
                        id: true,
                        status: true,
                        amount: true,
                        deliveryStatus: true,
                    },
                },
                disputes: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });

        const vendorPerformance = vendors.map(vendor => {
            const totalOrders = vendor.purchaseOrders.length;
            const completedOrders = vendor.purchaseOrders.filter(o => o.status === 'COMPLETED').length;
            const onTimeDeliveries = vendor.purchaseOrders.filter(o => o.deliveryStatus === 'COMPLETED').length;
            const totalDisputes = vendor.disputes.length;
            const openDisputes = vendor.disputes.filter(d => d.status === 'OPEN').length;

            return {
                vendorId: vendor.id,
                vendorName: vendor.businessName,
                totalOrders,
                completedOrders,
                onTimeRate: totalOrders > 0 ? Math.round((onTimeDeliveries / totalOrders) * 100) : 0,
                disputeCount: totalDisputes,
                openDisputes,
                riskCategory: vendor.riskCategory || 'N/A',
            };
        });

        // Get order stats by status
        const orderStats = await prisma.purchaseOrder.groupBy({
            by: ['status'],
            _count: { id: true },
            _sum: { amount: true },
        });

        // Get risk distribution
        const riskDistribution = await prisma.vendor.groupBy({
            by: ['riskCategory'],
            _count: { id: true },
        });

        return NextResponse.json({
            vendorPerformance,
            orderStats: orderStats.map(s => ({
                status: s.status,
                count: s._count.id,
                totalAmount: s._sum.amount?.toString() || '0',
            })),
            riskDistribution: riskDistribution.map(r => ({
                category: r.riskCategory || 'Unassessed',
                count: r._count.id,
            })),
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
