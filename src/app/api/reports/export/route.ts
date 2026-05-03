import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Types matching the actual /api/reports response
interface ReportsData {
    vendorPerformance: Array<{
        vendorId: string;
        vendorName: string;
        totalOrders: number;
        completedOrders: number;
        onTimeRate: number;
        disputeCount: number;
        openDisputes: number;
        riskCategory: string;
    }>;
    orderStats: Array<{
        status: string;
        count: number;
        totalAmount: string;
    }>;
    riskDistribution: Array<{
        category: string;
        count: number;
    }>;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'pdf';

        // Fetch reports data (same as /api/reports)
        const reportsRes = await fetch(new URL('/api/reports', request.url).toString(), {
            headers: {
                'Cookie': request.headers.get('cookie') || '',
            },
        });

        if (!reportsRes.ok) {
            console.error('Reports fetch failed:', reportsRes.status);
            return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
        }

        const data: ReportsData = await reportsRes.json();

        if (format === 'excel') {
            return generateExcel(data);
        } else {
            return generatePDF(data);
        }
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}

async function generatePDF(data: ReportsData) {
    // Dynamic import for jsPDF (ESM module)
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text('VendorGuard - Performance Report', 14, 20);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`, 14, 28);

    // Transform order stats for display
    const getOrderCount = (status: string) => {
        const stat = data.orderStats.find(s => s.status === status);
        return stat?.count || 0;
    };
    const totalOrders = data.orderStats.reduce((sum, s) => sum + s.count, 0);

    // Order Statistics Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Order Statistics', 14, 40);

    autoTable(doc, {
        startY: 45,
        head: [['Total Orders', 'Pending', 'Approved', 'Completed', 'Cancelled']],
        body: [[
            totalOrders,
            getOrderCount('PENDING'),
            getOrderCount('APPROVED'),
            getOrderCount('COMPLETED'),
            getOrderCount('CANCELLED'),
        ]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
    });

    // Risk Distribution Section
    const afterOrderStats = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Risk Distribution', 14, afterOrderStats);

    const getRiskCount = (category: string) => {
        const risk = data.riskDistribution.find(r => r.category?.toUpperCase() === category);
        return risk?.count || 0;
    };

    autoTable(doc, {
        startY: afterOrderStats + 5,
        head: [['Low Risk', 'Medium Risk', 'High Risk', 'Critical / Unassessed']],
        body: [[
            getRiskCount('LOW'),
            getRiskCount('MEDIUM'),
            getRiskCount('HIGH'),
            getRiskCount('CRITICAL') + getRiskCount('UNASSESSED'),
        ]],
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
    });

    // Vendor Performance Table
    const afterRiskStats = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Vendor Performance', 14, afterRiskStats);

    autoTable(doc, {
        startY: afterRiskStats + 5,
        head: [['Vendor', 'Orders', 'Completed', 'On-Time %', 'Disputes', 'Open', 'Risk']],
        body: data.vendorPerformance.map(v => [
            v.vendorName || 'N/A',
            v.totalOrders,
            v.completedOrders,
            `${v.onTimeRate}%`,
            v.disputeCount,
            v.openDisputes,
            v.riskCategory || 'N/A',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} - VendorGuard Report`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="vendorguard-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
    });
}

async function generateExcel(data: ReportsData) {
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Transform data for excel
    const getOrderCount = (status: string) => {
        const stat = data.orderStats.find(s => s.status === status);
        return stat?.count || 0;
    };
    const totalOrders = data.orderStats.reduce((sum, s) => sum + s.count, 0);

    const getRiskCount = (category: string) => {
        const risk = data.riskDistribution.find(r => r.category?.toUpperCase() === category);
        return risk?.count || 0;
    };

    // Order Statistics Sheet
    const orderStatsData = [
        ['Order Statistics'],
        [''],
        ['Total Orders', 'Pending', 'Approved', 'Completed', 'Cancelled'],
        [totalOrders, getOrderCount('PENDING'), getOrderCount('APPROVED'), getOrderCount('COMPLETED'), getOrderCount('CANCELLED')],
        [''],
        ['Risk Distribution'],
        [''],
        ['Low Risk', 'Medium Risk', 'High Risk', 'Critical'],
        [getRiskCount('LOW'), getRiskCount('MEDIUM'), getRiskCount('HIGH'), getRiskCount('CRITICAL')],
    ];
    const statsSheet = XLSX.utils.aoa_to_sheet(orderStatsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Summary');

    // Vendor Performance Sheet
    const vendorData = [
        ['Vendor Performance Report'],
        ['Generated on: ' + new Date().toLocaleDateString('en-IN')],
        [''],
        ['Vendor Name', 'Total Orders', 'Completed Orders', 'On-Time Rate (%)', 'Total Disputes', 'Open Disputes', 'Risk Category'],
        ...data.vendorPerformance.map(v => [
            v.vendorName || 'N/A',
            v.totalOrders,
            v.completedOrders,
            v.onTimeRate,
            v.disputeCount,
            v.openDisputes,
            v.riskCategory || 'N/A',
        ]),
    ];
    const vendorSheet = XLSX.utils.aoa_to_sheet(vendorData);

    // Set column widths
    vendorSheet['!cols'] = [
        { wch: 25 }, // Vendor Name
        { wch: 12 }, // Total Orders
        { wch: 15 }, // Completed Orders
        { wch: 15 }, // On-Time Rate
        { wch: 14 }, // Total Disputes
        { wch: 14 }, // Open Disputes
        { wch: 15 }, // Risk Category
    ];

    XLSX.utils.book_append_sheet(workbook, vendorSheet, 'Vendor Performance');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="vendorguard-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
    });
}
