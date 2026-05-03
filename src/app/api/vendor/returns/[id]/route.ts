import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/vendor/returns/[id] - Get return details for vendor
export async function GET(
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
            include: { vendor: true },
        });

        if (!user?.vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const { id } = await params;

        const returnData = await prisma.return.findUnique({
            where: { id, vendorId: user.vendor.id },
            include: {
                order: {
                    select: { id: true, orderNumber: true, title: true },
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

// PUT /api/vendor/returns/[id] - Vendor respond to return
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
            include: { vendor: true },
        });

        if (!user?.vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const { id } = await params;
        const body = await request.json();
        const { response, accept } = body;

        const existingReturn = await prisma.return.findUnique({
            where: { id, vendorId: user.vendor.id },
        });

        if (!existingReturn) {
            return NextResponse.json({ error: 'Return not found' }, { status: 404 });
        }

        if (existingReturn.vendorResponse) {
            return NextResponse.json(
                { error: 'You have already responded to this return' },
                { status: 400 }
            );
        }

        const updatedReturn = await prisma.return.update({
            where: { id },
            data: {
                vendorResponse: response,
                vendorRespondedAt: new Date(),
                status: accept ? 'APPROVED' : 'VENDOR_REVIEW',
            },
            include: {
                order: { select: { id: true, orderNumber: true } },
                items: true,
            },
        });

        return NextResponse.json(updatedReturn);
    } catch (error) {
        console.error('Error responding to return:', error);
        return NextResponse.json({ error: 'Failed to respond' }, { status: 500 });
    }
}
