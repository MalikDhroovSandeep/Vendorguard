import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';

// GET /api/vendors - List all vendors
export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admin and internal users can list all vendors
        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get query params
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.VendorWhereInput = {};

        if (search) {
            where.OR = [
                { businessName: { contains: search, mode: 'insensitive' } },
                { industryCategory: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status !== 'all') {
            where.status = status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
        }

        // Get vendors with count
        const [vendors, total] = await Promise.all([
            prisma.vendor.findMany({
                where,
                include: {
                    user: {
                        select: {
                            email: true,
                            name: true,
                        },
                    },
                    contact: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.vendor.count({ where }),
        ]);

        return NextResponse.json({
            vendors,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching vendors:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/vendors - Create a new vendor
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admin and internal users can create vendors
        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'internal') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { businessName, businessType, industryCategory, contactEmail, contactName, phone, password } = body;

        // Validate required fields
        if (!businessName || !businessType || !industryCategory || !contactEmail) {
            return NextResponse.json(
                { error: 'Missing required fields: businessName, businessType, industryCategory, contactEmail' },
                { status: 400 }
            );
        }

        // Validate business type enum
        const validBusinessTypes = ['INDIVIDUAL', 'PARTNERSHIP', 'PVT_LTD', 'LLP'];
        if (!validBusinessTypes.includes(businessType)) {
            return NextResponse.json(
                { error: 'Invalid business type. Must be INDIVIDUAL, PARTNERSHIP, PVT_LTD, or LLP' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: contactEmail.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'A user with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password - use provided password or default
        const bcrypt = await import('bcryptjs');
        const tempPassword = password || 'vendor123'; // Default password if not provided
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create user and vendor in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user for vendor
            const user = await tx.user.create({
                data: {
                    email: contactEmail.toLowerCase(),
                    name: contactName || businessName,
                    password: hashedPassword,
                    role: 'VENDOR',
                },
            });

            // Create vendor profile
            const vendor = await tx.vendor.create({
                data: {
                    userId: user.id,
                    businessName,
                    businessType,
                    industryCategory,
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            // Create vendor contact if phone provided
            if (phone || contactName) {
                await tx.vendorContact.create({
                    data: {
                        vendorId: vendor.id,
                        contactName: contactName || businessName,
                        email: contactEmail.toLowerCase(),
                        phone: phone || '',
                        address: '',
                        city: '',
                        state: '',
                        pinCode: '',
                    },
                });
            }

            return vendor;
        });

        return NextResponse.json(
            { message: 'Vendor created successfully', vendor: result },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating vendor:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
