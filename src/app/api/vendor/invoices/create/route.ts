import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST /api/vendor/invoices/create - Create a new invoice
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, invoiceNumber, amount, taxAmount, dueDate } = body;

        if (!orderId || !invoiceNumber || !amount || !dueDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get vendor linked to user
        const vendor = await prisma.vendor.findFirst({
            where: { userId: session.user.id },
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
        }

        // Verify order belongs to vendor
        const order = await prisma.purchaseOrder.findUnique({
            where: { id: orderId },
        });

        if (!order || order.vendorId !== vendor.id) {
            return NextResponse.json({ error: 'Invalid order' }, { status: 403 });
        }

        // Check for duplicate invoice number for this vendor
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                vendorId: vendor.id,
                invoiceNumber: invoiceNumber,
            },
        });

        if (existingInvoice) {
            return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 });
        }

        const totalAmount = parseFloat(amount) + (parseFloat(taxAmount) || 0);

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                vendorId: vendor.id,
                orderId: orderId,
                invoiceNumber,
                amount: parseFloat(amount),
                taxAmount: parseFloat(taxAmount) || 0,
                totalAmount: totalAmount,
                dueDate: new Date(dueDate),
                status: 'PENDING',
            },
        });

        return NextResponse.json({ message: 'Invoice submitted successfully', invoice }, { status: 201 });

    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
