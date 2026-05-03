import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PUT /api/invoices/[id] - Update invoice status
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
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
        const { status } = body;
        const validStatuses = ['APPROVED', 'REJECTED', 'PAID'];

        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const existingInvoice = await prisma.invoice.findUnique({
            where: { id: params.id },
            include: { order: true }
        });

        if (!existingInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Update logic:
        // If Approved, maybe we should also check if Order is Delivered? (Business rule, but optional for now)
        // If Paid, maybe update purchase order status to Completed?

        const updatedInvoice = await prisma.invoice.update({
            where: { id: params.id },
            data: {
                status,
                paidDate: status === 'PAID' ? new Date() : existingInvoice.paidDate,
            }
        });

        return NextResponse.json({ message: 'Invoice updated successfully', invoice: updatedInvoice });

    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
