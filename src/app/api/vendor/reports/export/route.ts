import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Types for vendor performance data
interface VendorExportData {
    vendor: {
        businessName: string;
        riskScore: number;
        riskCategory: string;
    };
    orders: Array<{
        orderNumber: string;
        status: string;
        amount: string;
        deliveryStatus: string;
        createdAt: Date;
    }>;
    invoices: Array<{
        invoiceNumber: string;
        status: string;
        amount: string;
        dueDate: Date;
    }>;
    disputes: Array<{
        disputeNumber: string;
        status: string;
        type: string;
        createdAt: Date;
    }>;
    stats: {
        totalOrders: number;
        completedOrders: number;
        pendingInvoices: number;
        openDisputes: number;
        onTimeRate: number;
    };
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'pdf';

        // Get vendor data for this user
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            include: {
                purchaseOrders: {
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        orderNumber: true,
                        status: true,
                        amount: true,
                        deliveryStatus: true,
                        createdAt: true,
                    },
                },
                invoices: {
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        invoiceNumber: true,
                        status: true,
                        amount: true,
                        dueDate: true,
                    },
                },
                disputes: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        disputeNumber: true,
                        status: true,
                        category: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const completedOrders = vendor.purchaseOrders.filter(o => o.status === 'COMPLETED').length;
        const onTimeDeliveries = vendor.purchaseOrders.filter(o => o.deliveryStatus === 'COMPLETED').length;

        const data: VendorExportData = {
            vendor: {
                businessName: vendor.businessName,
                riskScore: vendor.riskScore?.toNumber() || 0,
                riskCategory: vendor.riskCategory || 'N/A',
            },
            orders: vendor.purchaseOrders.map(o => ({
                orderNumber: o.orderNumber,
                status: o.status,
                amount: o.amount.toString(),
                deliveryStatus: o.deliveryStatus || 'N/A',
                createdAt: o.createdAt,
            })),
            invoices: vendor.invoices.map(i => ({
                invoiceNumber: i.invoiceNumber,
                status: i.status,
                amount: i.amount.toString(),
                dueDate: i.dueDate,
            })),
            disputes: vendor.disputes.map(d => ({
                disputeNumber: d.disputeNumber,
                status: d.status,
                type: d.category,
                createdAt: d.createdAt,
            })),
            stats: {
                totalOrders: vendor.purchaseOrders.length,
                completedOrders,
                pendingInvoices: vendor.invoices.filter(i => i.status === 'PENDING').length,
                openDisputes: vendor.disputes.filter(d => d.status === 'OPEN').length,
                onTimeRate: vendor.purchaseOrders.length > 0 ? Math.round((onTimeDeliveries / vendor.purchaseOrders.length) * 100) : 0,
            },
        };

        if (format === 'excel') {
            return generateExcel(data);
        } else {
            return generatePDF(data);
        }
    } catch (error) {
        console.error('Vendor export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}

async function generatePDF(data: VendorExportData) {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text('VendorGuard - Vendor Performance Report', 14, 20);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(data.vendor.businessName, 14, 30);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`, 14, 38);

    // Performance Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Performance Summary', 14, 50);

    autoTable(doc, {
        startY: 55,
        head: [['Total Orders', 'Completed', 'On-Time Rate', 'Pending Invoices', 'Open Disputes', 'Risk Level']],
        body: [[
            data.stats.totalOrders,
            data.stats.completedOrders,
            `${data.stats.onTimeRate}%`,
            data.stats.pendingInvoices,
            data.stats.openDisputes,
            data.vendor.riskCategory,
        ]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
    });

    // Orders Table
    if (data.orders.length > 0) {
        const afterSummary = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('Recent Orders', 14, afterSummary);

        autoTable(doc, {
            startY: afterSummary + 5,
            head: [['Order #', 'Status', 'Amount', 'Delivery Status', 'Date']],
            body: data.orders.slice(0, 10).map(o => [
                o.orderNumber,
                o.status,
                `₹${parseFloat(o.amount).toLocaleString('en-IN')}`,
                o.deliveryStatus,
                new Date(o.createdAt).toLocaleDateString('en-IN'),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [34, 197, 94] },
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} - VendorGuard Vendor Report`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="vendor-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
    });
}

async function generateExcel(data: VendorExportData) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
        ['Vendor Performance Report'],
        [`Business: ${data.vendor.businessName}`],
        [`Generated on: ${new Date().toLocaleDateString('en-IN')}`],
        [''],
        ['Performance Summary'],
        ['Total Orders', 'Completed', 'On-Time Rate', 'Pending Invoices', 'Open Disputes', 'Risk Level'],
        [data.stats.totalOrders, data.stats.completedOrders, `${data.stats.onTimeRate}%`, data.stats.pendingInvoices, data.stats.openDisputes, data.vendor.riskCategory],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Orders Sheet
    if (data.orders.length > 0) {
        const ordersData = [
            ['Orders'],
            ['Order #', 'Status', 'Amount', 'Delivery Status', 'Date'],
            ...data.orders.map(o => [
                o.orderNumber,
                o.status,
                parseFloat(o.amount),
                o.deliveryStatus,
                new Date(o.createdAt).toLocaleDateString('en-IN'),
            ]),
        ];
        const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
        ordersSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders');
    }

    // Invoices Sheet
    if (data.invoices.length > 0) {
        const invoicesData = [
            ['Invoices'],
            ['Invoice #', 'Status', 'Amount', 'Due Date'],
            ...data.invoices.map(i => [
                i.invoiceNumber,
                i.status,
                parseFloat(i.amount),
                new Date(i.dueDate).toLocaleDateString('en-IN'),
            ]),
        ];
        const invoicesSheet = XLSX.utils.aoa_to_sheet(invoicesData);
        invoicesSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(workbook, invoicesSheet, 'Invoices');
    }

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="vendor-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
    });
}
