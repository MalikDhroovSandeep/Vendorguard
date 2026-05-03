import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';

// GET /api/invoices - List invoices
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: Prisma.InvoiceWhereInput = {};

        // Internal users only see invoices for orders they created; admins see all
        if (userRole === 'internal') {
            where.order = {
                createdById: session.user.id as string,
            };
        }

        if (status !== 'all') {
            where.status = status.toUpperCase() as any;
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: {
                    vendor: {
                        select: {
                            businessName: true,
                        },
                    },
                    order: {
                        select: {
                            orderNumber: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.invoice.count({ where }),
        ]);

        return NextResponse.json({
            invoices,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/invoices - Create invoice (typically vendors create these)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { vendorId, orderId, amount, taxAmount, dueDate } = body;

        if (!vendorId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields: vendorId, amount' },
                { status: 400 }
            );
        }

        // Generate invoice number
        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

        const totalAmount = parseFloat(amount) + (parseFloat(taxAmount) || 0);

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                vendorId,
                orderId: orderId || null,
                amount: new Prisma.Decimal(amount),
                taxAmount: new Prisma.Decimal(taxAmount || 0),
                totalAmount: new Prisma.Decimal(totalAmount),
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'PENDING',
            },
            include: {
                vendor: {
                    select: { businessName: true },
                },
            },
        });

        return NextResponse.json(
            { message: 'Invoice created successfully', invoice },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
