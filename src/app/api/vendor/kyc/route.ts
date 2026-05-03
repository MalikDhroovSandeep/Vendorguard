import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Helper to get vendor from session
async function getVendorWithKyc(session: { user?: { id?: string; email?: string | null } }) {
    if (!session?.user?.id) return null;

    let vendor = await prisma.vendor.findFirst({
        where: { userId: session.user.id },
        include: {
            contact: true,
            kyc: true,
        },
    });

    if (!vendor && session.user.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (user) {
            vendor = await prisma.vendor.findFirst({
                where: { userId: user.id },
                include: {
                    contact: true,
                    kyc: true,
                },
            });
        }
    }

    return vendor;
}

// GET /api/vendor/kyc - Get vendor's KYC data
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await getVendorWithKyc(session);
        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
        }

        return NextResponse.json({
            vendor: {
                id: vendor.id,
                businessName: vendor.businessName,
                businessType: vendor.businessType,
                industryCategory: vendor.industryCategory,
                businessDescription: vendor.businessDescription,
                yearEstablished: vendor.yearEstablished,
                kycStatus: vendor.kycStatus,
            },
            contact: vendor.contact ? {
                contactName: vendor.contact.contactName,
                designation: vendor.contact.designation,
                email: vendor.contact.email,
                phone: vendor.contact.phone,
                address: vendor.contact.address,
                city: vendor.contact.city,
                state: vendor.contact.state,
                pinCode: vendor.contact.pinCode,
            } : null,
            kyc: vendor.kyc ? {
                gstNumber: vendor.kyc.gstNumber,
                panNumber: vendor.kyc.panNumber,
                businessDocType: vendor.kyc.businessDocType,
                businessDocNumber: vendor.kyc.businessDocNumber,
                businessDocAuthority: vendor.kyc.businessDocAuthority,
                businessDocIssueDate: vendor.kyc.businessDocIssueDate,
                submittedAt: vendor.kyc.submittedAt,
                reviewedAt: vendor.kyc.reviewedAt,
                rejectionReason: vendor.kyc.rejectionReason,
                // Document URLs
                gstDocument: vendor.kyc.gstDocument,
                panDocument: vendor.kyc.panDocument,
                businessDocument: vendor.kyc.businessDocument,
            } : null,
        });
    } catch (error) {
        console.error('Error fetching vendor KYC:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/vendor/kyc - Update/submit vendor's KYC data
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await getVendorWithKyc(session);
        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
        }

        const body = await request.json();
        const { businessDetails, contact, kyc, documents } = body;

        // Update vendor business details
        if (businessDetails) {
            await prisma.vendor.update({
                where: { id: vendor.id },
                data: {
                    businessDescription: businessDetails.businessDescription,
                    yearEstablished: businessDetails.yearEstablished ? parseInt(businessDetails.yearEstablished) : null,
                },
            });
        }

        // Update or create contact info
        if (contact) {
            await prisma.vendorContact.upsert({
                where: { vendorId: vendor.id },
                create: {
                    vendorId: vendor.id,
                    contactName: contact.contactName || '',
                    designation: contact.designation,
                    email: contact.email || '',
                    phone: contact.phone || '',
                    address: contact.address || '',
                    city: contact.city || '',
                    state: contact.state || '',
                    pinCode: contact.pinCode || '',
                },
                update: {
                    contactName: contact.contactName,
                    designation: contact.designation,
                    email: contact.email,
                    phone: contact.phone,
                    address: contact.address,
                    city: contact.city,
                    state: contact.state,
                    pinCode: contact.pinCode,
                },
            });
        }

        // Update or create KYC info
        if (kyc) {
            await prisma.vendorKYC.upsert({
                where: { vendorId: vendor.id },
                create: {
                    vendorId: vendor.id,
                    gstNumber: kyc.gstNumber,
                    panNumber: kyc.panNumber,
                    businessDocType: kyc.businessDocType || null,
                    businessDocNumber: kyc.businessDocNumber,
                    businessDocAuthority: kyc.businessDocAuthority,
                    businessDocIssueDate: kyc.businessDocIssueDate ? new Date(kyc.businessDocIssueDate) : null,
                    submittedAt: new Date(),
                },
                update: {
                    gstNumber: kyc.gstNumber,
                    panNumber: kyc.panNumber,
                    businessDocType: kyc.businessDocType || null,
                    businessDocNumber: kyc.businessDocNumber,
                    businessDocAuthority: kyc.businessDocAuthority,
                    businessDocIssueDate: kyc.businessDocIssueDate ? new Date(kyc.businessDocIssueDate) : null,
                    submittedAt: new Date(),
                    // Document URLs
                    ...(documents?.gstDocument && { gstDocument: documents.gstDocument }),
                    ...(documents?.panDocument && { panDocument: documents.panDocument }),
                    ...(documents?.businessDocument && { businessDocument: documents.businessDocument }),
                },
            });

            // Update KYC status to SUBMITTED if it was PENDING
            if (vendor.kycStatus === 'PENDING') {
                await prisma.vendor.update({
                    where: { id: vendor.id },
                    data: { kycStatus: 'SUBMITTED' },
                });
            }
        }

        return NextResponse.json({ message: 'KYC data saved successfully' });
    } catch (error) {
        console.error('Error updating vendor KYC:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
