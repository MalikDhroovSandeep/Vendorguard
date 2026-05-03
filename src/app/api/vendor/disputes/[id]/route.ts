import { NextRequest, NextResponse } from 'next/server';
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

// GET /api/vendor/disputes/[id] - Get single dispute details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = await getVendorId(session);
        if (!vendorId) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const { id } = await params;

        const dispute = await prisma.dispute.findFirst({
            where: {
                id,
                vendorId,
            },
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

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        return NextResponse.json({
            dispute: {
                id: dispute.id,
                disputeNumber: dispute.disputeNumber,
                subject: dispute.subject,
                description: dispute.description,
                category: dispute.category,
                priority: dispute.priority,
                status: dispute.status,
                amount: dispute.amount?.toNumber() || null,
                orderNumber: dispute.order?.orderNumber,
                orderTitle: dispute.order?.title,
                raisedBy: dispute.raisedBy?.name,
                vendorResponse: dispute.vendorResponse,
                vendorRespondedAt: dispute.vendorRespondedAt,
                resolution: dispute.resolution,
                resolvedAt: dispute.resolvedAt,
                createdAt: dispute.createdAt,
            },
        });
    } catch (error) {
        console.error('Error fetching dispute:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/vendor/disputes/[id] - Vendor responds to dispute
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = await getVendorId(session);
        if (!vendorId) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const { id } = await params;
        const body = await request.json();
        const { response } = body;

        if (!response || response.trim().length === 0) {
            return NextResponse.json({ error: 'Response is required' }, { status: 400 });
        }

        // Find the dispute and verify it belongs to this vendor
        const dispute = await prisma.dispute.findFirst({
            where: {
                id,
                vendorId,
            },
        });

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        // Check if vendor has already responded
        if (dispute.vendorResponse) {
            return NextResponse.json(
                { error: 'You have already responded to this dispute' },
                { status: 400 }
            );
        }

        // Update dispute with vendor response
        const updatedDispute = await prisma.dispute.update({
            where: { id },
            data: {
                vendorResponse: response.trim(),
                vendorRespondedAt: new Date(),
                status: 'UNDER_REVIEW',
            },
        });

        return NextResponse.json({
            message: 'Response submitted successfully',
            dispute: updatedDispute,
        });
    } catch (error) {
        console.error('Error submitting vendor response:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
