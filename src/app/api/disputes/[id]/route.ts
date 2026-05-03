import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/disputes/[id] - Get single dispute details (Admin/Internal)
export async function GET(
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

        const dispute = await prisma.dispute.findUnique({
            where: { id },
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
                        title: true,
                        amount: true,
                    },
                },
                raisedBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                resolvedBy: {
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
                vendor: dispute.vendor,
                order: dispute.order ? {
                    orderNumber: dispute.order.orderNumber,
                    title: dispute.order.title,
                    amount: dispute.order.amount?.toNumber(),
                } : null,
                raisedBy: dispute.raisedBy,
                vendorResponse: (dispute as unknown as { vendorResponse?: string | null }).vendorResponse || null,
                vendorRespondedAt: (dispute as unknown as { vendorRespondedAt?: Date | null }).vendorRespondedAt || null,
                resolution: dispute.resolution,
                resolvedBy: dispute.resolvedBy?.name,
                resolvedAt: dispute.resolvedAt,
                createdAt: dispute.createdAt,
            },
        });
    } catch (error) {
        console.error('Error fetching dispute:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/disputes/[id] - Admin resolves dispute
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can resolve disputes' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, resolution } = body;

        // Validate status
        const validStatuses = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be OPEN, UNDER_REVIEW, RESOLVED, or CLOSED' },
                { status: 400 }
            );
        }

        // Resolution notes required for RESOLVED or CLOSED
        if ((status === 'RESOLVED' || status === 'CLOSED') && (!resolution || resolution.trim().length === 0)) {
            return NextResponse.json(
                { error: 'Resolution notes are required when resolving or closing a dispute' },
                { status: 400 }
            );
        }

        // Find the dispute
        const dispute = await prisma.dispute.findUnique({
            where: { id },
        });

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        // Update dispute
        const updateData: {
            status: string;
            resolution?: string;
            resolvedById?: string;
            resolvedAt?: Date;
        } = {
            status,
        };

        if (resolution) {
            updateData.resolution = resolution.trim();
        }

        if (status === 'RESOLVED' || status === 'CLOSED') {
            updateData.resolvedById = session.user.id as string;
            updateData.resolvedAt = new Date();
        }

        const updatedDispute = await prisma.dispute.update({
            where: { id },
            data: updateData as { status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'; resolution?: string; resolvedById?: string; resolvedAt?: Date },
            include: {
                vendor: {
                    select: { businessName: true },
                },
            },
        });

        return NextResponse.json({
            message: `Dispute ${status === 'RESOLVED' ? 'resolved' : status === 'CLOSED' ? 'closed' : 'updated'} successfully`,
            dispute: updatedDispute,
        });
    } catch (error) {
        console.error('Error resolving dispute:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
