import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/vendor/returns - Get vendor's returns
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { vendorId: user.vendor.id };
        if (status) where.status = status;

        const [returns, total] = await Promise.all([
            prisma.return.findMany({
                where,
                include: {
                    order: {
                        select: { id: true, orderNumber: true, title: true },
                    },
                    items: true,
                    creditNote: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.return.count({ where }),
        ]);

        return NextResponse.json({
            returns,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching vendor returns:', error);
        return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
    }
}
