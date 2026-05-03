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

// GET /api/vendor/invoices - Get invoices for the logged-in vendor
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = await getVendorId(session);
        if (!vendorId) {
            return NextResponse.json({ invoices: [] });
        }

        const invoices = await prisma.invoice.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        title: true,
                    },
                },
            },
        });

        return NextResponse.json({
            invoices: invoices.map(invoice => ({
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                orderNumber: invoice.order?.orderNumber,
                orderTitle: invoice.order?.title,
                amount: invoice.amount.toNumber(),
                status: invoice.status,
                dueDate: invoice.dueDate,
                createdAt: invoice.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching vendor invoices:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
