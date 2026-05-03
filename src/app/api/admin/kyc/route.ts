import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';
import { kycApprovedTemplate, kycRejectedTemplate } from '@/lib/email-templates';

// GET /api/admin/kyc - Get pending KYC submissions
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch vendors with SUBMITTED or PENDING KYC status
        const vendors = await prisma.vendor.findMany({
            where: {
                kycStatus: { in: ['SUBMITTED', 'PENDING'] }
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                kyc: true,
                contact: true
            },
            orderBy: {
                // Prioritize SUBMITTED over PENDING, then by date
                updatedAt: 'desc'
            }
        });

        // Transform data for frontend
        const kycList = vendors.map(vendor => ({
            id: vendor.id,
            name: vendor.businessName,
            submitted: vendor.kyc?.submittedAt || vendor.updatedAt,
            kycStatus: vendor.kycStatus,
            riskScore: vendor.riskScore?.toNumber() || 0,
            riskCategory: vendor.riskCategory,
            documents: [
                { label: 'GST', status: vendor.kyc?.gstNumber ? 'present' : 'missing' },
                { label: 'PAN', status: vendor.kyc?.panNumber ? 'present' : 'missing' },
                { label: 'Business Doc', status: vendor.kyc?.businessDocNumber ? 'present' : 'missing' }
            ],
            contact: vendor.contact
        }));

        return NextResponse.json({ kycList });

    } catch (error) {
        console.error('Error fetching KYC list:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/kyc - Approve or Reject KYC
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { vendorId, action, rejectionReason } = body;

        if (!vendorId || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        if (action === 'REJECT' && !rejectionReason) {
            return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
        }

        // Update vendor status based on action
        const result = await prisma.$transaction(async (tx) => {
            if (action === 'APPROVE') {
                // Update Vendor status and KYC status
                const updatedVendor = await tx.vendor.update({
                    where: { id: vendorId },
                    data: {
                        kycStatus: 'VERIFIED',
                        status: 'ACTIVE', // Activate vendor on KYC approval
                    }
                });

                // Update KYC record if it exists, otherwise create it
                await tx.vendorKYC.upsert({
                    where: { vendorId },
                    update: {
                        reviewedAt: new Date(),
                        // reviewedById: session.user.id // need to link to admin user
                    },
                    create: {
                        vendorId,
                        reviewedAt: new Date(),
                    }
                });

                return updatedVendor;
            } else {
                // Reject
                const updatedVendor = await tx.vendor.update({
                    where: { id: vendorId },
                    data: {
                        kycStatus: 'REJECTED',
                    },
                    include: {
                        user: { select: { email: true, name: true } }
                    }
                });

                await tx.vendorKYC.upsert({
                    where: { vendorId },
                    update: {
                        reviewedAt: new Date(),
                        rejectionReason: rejectionReason
                    },
                    create: {
                        vendorId,
                        reviewedAt: new Date(),
                        rejectionReason: rejectionReason
                    }
                });

                return updatedVendor;
            }
        });

        // Send email notification after transaction completes
        const vendorWithUser = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: { user: { select: { email: true, name: true } } }
        });

        if (vendorWithUser?.user?.email) {
            const emailTo = vendorWithUser.user.email;
            const vendorName = vendorWithUser.businessName || vendorWithUser.user.name || 'Vendor';

            if (action === 'APPROVE') {
                await sendEmail({
                    to: emailTo,
                    subject: '🎉 Your KYC has been approved - VendorGuard',
                    html: kycApprovedTemplate(vendorName),
                });
            } else {
                await sendEmail({
                    to: emailTo,
                    subject: '⚠️ KYC Verification Update - VendorGuard',
                    html: kycRejectedTemplate(vendorName, rejectionReason),
                });
            }
        }

        return NextResponse.json({ message: `Vendor KYC ${action === 'APPROVE' ? 'approved' : 'rejected'}`, vendor: result });

    } catch (error) {
        console.error('Error updating KYC status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
