import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parallelize database queries for efficiency
        const [
            totalVendors,
            pendingKyc,
            highRiskVendors,
            openDisputes,
            recentActivity,
            recentVendors,
            activeVendors,
            inactiveVendors,
            blacklistedVendors,
            pendingApprovalVendors,
            onboardingIncompleteVendors
        ] = await Promise.all([
            // 1. Total Vendors
            prisma.vendor.count(),

            // 2. Pending KYC (submitted but not verified)
            prisma.vendor.count({
                where: { kycStatus: { in: ['SUBMITTED', 'PENDING'] } }
            }),

            // 3. High Risk Vendors
            prisma.vendor.count({
                where: { riskCategory: 'HIGH' }
            }),

            // 4. Open Disputes
            prisma.dispute.count({
                where: { status: { in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] } }
            }),

            // 5. Recent Activity (Audit Logs)
            prisma.auditLog.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            }),

            // 6. Recent Vendors (for dashboard table)
            prisma.vendor.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    businessName: true,
                    industryCategory: true,
                    riskScore: true,
                    riskCategory: true,
                    status: true,
                }
            }),

            // 7. Breakdown: Active
            prisma.vendor.count({ where: { status: 'ACTIVE' } }),

            // 8. Breakdown: Inactive
            prisma.vendor.count({ where: { status: 'INACTIVE' } }),

            // 9. Breakdown: Blacklisted
            prisma.vendor.count({ where: { status: 'BLACKLISTED' } }),

            // 10. Breakdown: Pending Approval (Submitted/Under Review)
            prisma.vendor.count({ where: { kycStatus: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),

            // 11. Breakdown: Onboarding Incomplete (Pending)
            prisma.vendor.count({ where: { kycStatus: 'PENDING' } })
        ]);

        return NextResponse.json({
            stats: {
                totalVendors,
                pendingKyc,
                highRiskVendors,
                openDisputes
            },
            breakdown: {
                active: activeVendors,
                inactive: inactiveVendors,
                blacklisted: blacklistedVendors,
                pendingApproval: pendingApprovalVendors,
                onboardingIncomplete: onboardingIncompleteVendors
            },
            recentActivity,
            recentVendors
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
