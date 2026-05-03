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

// GET /api/vendor/disputes - Get disputes for the logged-in vendor
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = await getVendorId(session);
        if (!vendorId) {
            return NextResponse.json({ disputes: [] });
        }

        const disputes = await prisma.dispute.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        title: true,
                    },
                },
                raisedBy: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            disputes: disputes.map(dispute => {
                const d = dispute as typeof dispute & { vendorResponse?: string | null; vendorRespondedAt?: Date | null };
                return {
                    id: d.id,
                    disputeNumber: d.disputeNumber,
                    subject: d.subject,
                    description: d.description,
                    category: d.category,
                    priority: d.priority,
                    status: d.status,
                    amount: d.amount?.toNumber() || null,
                    orderNumber: d.order?.orderNumber,
                    orderTitle: d.order?.title,
                    raisedBy: d.raisedBy?.name,
                    vendorResponse: d.vendorResponse || null,
                    vendorRespondedAt: d.vendorRespondedAt || null,
                    createdAt: d.createdAt,
                    resolvedAt: d.resolvedAt,
                };
            }),
        });
    } catch (error) {
        console.error('Error fetching vendor disputes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
