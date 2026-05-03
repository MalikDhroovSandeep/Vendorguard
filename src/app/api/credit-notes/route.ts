import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createNotification } from '@/lib/notifications';

// Generate unique credit note number
async function generateCreditNoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.creditNote.count({
        where: {
            creditNumber: {
                startsWith: `CN-${year}`,
            },
        },
    });
    return `CN-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/credit-notes - List all credit notes
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (vendorId) where.vendorId = vendorId;

        const [creditNotes, total] = await Promise.all([
            prisma.creditNote.findMany({
                where,
                include: {
                    vendor: {
                        select: { id: true, businessName: true },
                    },
                    return: {
                        select: { id: true, returnNumber: true, reason: true },
                    },
                },
                orderBy: { issuedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.creditNote.count({ where }),
        ]);

        return NextResponse.json({
            creditNotes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching credit notes:', error);
        return NextResponse.json({ error: 'Failed to fetch credit notes' }, { status: 500 });
    }
}

// POST /api/credit-notes - Generate credit note for approved return
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { returnId, amount, notes } = body;

        if (!returnId) {
            return NextResponse.json({ error: 'Return ID is required' }, { status: 400 });
        }

        // Check if return exists and is approved
        const returnData = await prisma.return.findUnique({
            where: { id: returnId },
            include: {
                vendor: { select: { id: true, userId: true, businessName: true } },
                creditNote: true,
            },
        });

        if (!returnData) {
            return NextResponse.json({ error: 'Return not found' }, { status: 404 });
        }

        if (returnData.status !== 'APPROVED') {
            return NextResponse.json(
                { error: 'Credit note can only be generated for approved returns' },
                { status: 400 }
            );
        }

        if (returnData.creditNote) {
            return NextResponse.json(
                { error: 'Credit note already exists for this return' },
                { status: 400 }
            );
        }

        const creditNumber = await generateCreditNoteNumber();
        const creditAmount = amount || returnData.approvedAmount || returnData.totalAmount;

        // Create credit note and update return status
        const [creditNote] = await prisma.$transaction([
            prisma.creditNote.create({
                data: {
                    creditNumber,
                    returnId,
                    vendorId: returnData.vendorId,
                    amount: creditAmount,
                    notes,
                },
                include: {
                    vendor: { select: { id: true, businessName: true } },
                    return: { select: { id: true, returnNumber: true } },
                },
            }),
            prisma.return.update({
                where: { id: returnId },
                data: { status: 'CREDIT_ISSUED' },
            }),
        ]);

        // Notify vendor
        await createNotification({
            userId: returnData.vendor.userId,
            type: 'CREDIT_NOTE_ISSUED',
            title: 'Credit Note Issued',
            message: `Credit note ${creditNumber} for ₹${creditAmount} has been issued`,
            link: '/dashboard/vendor/returns',
        });

        return NextResponse.json(creditNote, { status: 201 });
    } catch (error) {
        console.error('Error creating credit note:', error);
        return NextResponse.json({ error: 'Failed to create credit note' }, { status: 500 });
    }
}
