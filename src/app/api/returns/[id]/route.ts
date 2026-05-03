import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createNotification } from '@/lib/notifications';

// GET /api/returns/[id] - Get return details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const returnData = await prisma.return.findUnique({
            where: { id },
            include: {
                vendor: {
                    select: { id: true, businessName: true, userId: true },
                },
                order: {
                    select: { id: true, orderNumber: true, title: true, amount: true },
                },
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                approvedBy: {
                    select: { id: true, name: true },
                },
                items: true,
                creditNote: true,
            },
        });

        if (!returnData) {
            return NextResponse.json({ error: 'Return not found' }, { status: 404 });
        }

        return NextResponse.json(returnData);
    } catch (error) {
        console.error('Error fetching return:', error);
        return NextResponse.json({ error: 'Failed to fetch return' }, { status: 500 });
    }
}

// PUT /api/returns/[id] - Update return (approve/reject/update status)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email || '' },
        });

        if (!user || user.role === 'VENDOR') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, claimType, approvedAmount, rejectionReason } = body;

        const existingReturn = await prisma.return.findUnique({
            where: { id },
            include: { vendor: { select: { userId: true } } },
        });

        if (!existingReturn) {
            return NextResponse.json({ error: 'Return not found' }, { status: 404 });
        }

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (status) {
            updateData.status = status;

            if (status === 'APPROVED') {
                updateData.approvedById = user.id;
                updateData.approvedAt = new Date();
                updateData.claimType = claimType || 'CREDIT_NOTE';
                updateData.approvedAmount = approvedAmount || existingReturn.totalAmount;

                // Notify vendor of approval
                await createNotification({
                    userId: existingReturn.vendor.userId,
                    type: 'RETURN_APPROVED',
                    title: 'Return Approved',
                    message: `Return ${existingReturn.returnNumber} has been approved`,
                    link: '/dashboard/vendor/returns',
                });
            } else if (status === 'REJECTED') {
                updateData.rejectionReason = rejectionReason;

                // Notify vendor of rejection
                await createNotification({
                    userId: existingReturn.vendor.userId,
                    type: 'RETURN_REJECTED',
                    title: 'Return Rejected',
                    message: `Return ${existingReturn.returnNumber} has been rejected`,
                    link: '/dashboard/vendor/returns',
                });
            }
        }

        const updatedReturn = await prisma.return.update({
            where: { id },
            data: updateData,
            include: {
                vendor: { select: { id: true, businessName: true } },
                order: { select: { id: true, orderNumber: true } },
                items: true,
            },
        });

        return NextResponse.json(updatedReturn);
    } catch (error) {
        console.error('Error updating return:', error);
        return NextResponse.json({ error: 'Failed to update return' }, { status: 500 });
    }
}

// DELETE /api/returns/[id] - Delete return (draft only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email || '' },
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;

        const existingReturn = await prisma.return.findUnique({
            where: { id },
        });

        if (!existingReturn) {
            return NextResponse.json({ error: 'Return not found' }, { status: 404 });
        }

        if (existingReturn.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Can only delete pending returns' },
                { status: 400 }
            );
        }

        await prisma.return.delete({ where: { id } });

        return NextResponse.json({ message: 'Return deleted successfully' });
    } catch (error) {
        console.error('Error deleting return:', error);
        return NextResponse.json({ error: 'Failed to delete return' }, { status: 500 });
    }
}
