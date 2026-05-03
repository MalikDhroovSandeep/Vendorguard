'use client';

import { useState, useEffect } from 'react';

interface VendorPerformance {
    vendorId: string;
    vendorName: string;
    totalOrders: number;
    completedOrders: number;
    onTimeRate: number;
    disputeCount: number;
    openDisputes: number;
    riskCategory: string;
}

interface OrderStat {
    status: string;
    count: number;
    totalAmount: string;
}

interface RiskDistribution {
    category: string;
    count: number;
}

export default function ReportsPage() {
    const [reportType, setReportType] = useState('vendor_performance');
    const [loading, setLoading] = useState(true);
    const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance[]>([]);
    const [orderStats, setOrderStats] = useState<OrderStat[]>([]);
    const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[]>([]);
    const [exporting, setExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports');
                if (res.ok) {
                    const data = await res.json();
                    setVendorPerformance(data.vendorPerformance || []);
                    setOrderStats(data.orderStats || []);
                    setRiskDistribution(data.riskDistribution || []);
                }
            } catch (err) {
                console.error('Failed to fetch reports:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleExport = async (format: 'pdf' | 'excel') => {
        setExporting(true);
        setShowExportMenu(false);
        try {
            const res = await fetch(`/api/reports/export?format=${format}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vendorguard-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setExporting(false);
        }
    };

    // Calculate totals from order stats
    const totalOrders = orderStats.reduce((sum, s) => sum + s.count, 0);
    const totalValue = orderStats.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    const totalVendors = riskDistribution.reduce((sum, r) => sum + r.count, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Summary reports and analytics</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <span className="material-icons-round text-xl">{exporting ? 'hourglass_empty' : 'download'}</span>
                        {exporting ? 'Exporting...' : 'Export Report'}
                    </button>
                    {showExportMenu && (
                        <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-10 min-w-[160px]">
                            <button
                                onClick={() => handleExport('pdf')}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                                <span className="material-icons-outlined text-lg text-red-500">picture_as_pdf</span>
                                Export as PDF
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                                <span className="material-icons-outlined text-lg text-green-500">table_chart</span>
                                Export as Excel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Report:</span>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="vendor_performance">Vendor Performance</option>
                        <option value="purchase_orders">Purchase Order Activity</option>
                        <option value="risk_distribution">Risk Distribution</option>
                    </select>
                </div>
            </div>

            {/* Vendor Performance Report */}
            {reportType === 'vendor_performance' && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Vendor Performance Summary</h2>
                        <p className="text-sm text-slate-600 mt-1">Delivery performance and order statistics by vendor</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Vendor Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Total Orders</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">On-Time %</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Disputes</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading vendor data...</td>
                                    </tr>
                                ) : vendorPerformance.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No vendor data available.</td>
                                    </tr>
                                ) : (
                                    vendorPerformance.map((vendor) => (
                                        <tr key={vendor.vendorId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{vendor.vendorName}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{vendor.totalOrders}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-200 rounded-full h-2 w-16">
                                                        <div
                                                            className={`h-2 rounded-full ${vendor.onTimeRate >= 90 ? 'bg-green-500' : vendor.onTimeRate >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${vendor.onTimeRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{vendor.onTimeRate}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {vendor.disputeCount} ({vendor.openDisputes} open)
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.riskCategory === 'LOW' ? 'bg-green-100 text-green-700' :
                                                    vendor.riskCategory === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                                        vendor.riskCategory === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {vendor.riskCategory}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Purchase Order Activity Report */}
            {reportType === 'purchase_orders' && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Purchase Order Activity</h2>
                        <p className="text-sm text-slate-600 mt-1">Order statistics by status</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Order Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Total Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">Loading order data...</td>
                                    </tr>
                                ) : orderStats.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No order data available.</td>
                                    </tr>
                                ) : (
                                    orderStats.map((stat) => (
                                        <tr key={stat.status} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stat.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                    stat.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                                        stat.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                            stat.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {stat.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{stat.count}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(parseFloat(stat.totalAmount))}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalOrders}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalValue)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Average Order Value</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalOrders > 0 ? formatCurrency(totalValue / totalOrders) : '₹0'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Distribution Report */}
            {reportType === 'risk_distribution' && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Distribution Analysis</h2>
                        <p className="text-sm text-slate-600 mt-1">Vendor risk categorization and distribution</p>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <p className="text-center text-slate-500">Loading risk data...</p>
                        ) : riskDistribution.length === 0 ? (
                            <p className="text-center text-slate-500">No risk data available.</p>
                        ) : (
                            <div className="space-y-4">
                                {riskDistribution.map((item, index) => {
                                    const percentage = totalVendors > 0 ? Math.round((item.count / totalVendors) * 100) : 0;
                                    return (
                                        <div key={item.category} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{item.category} Risk</span>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{item.count} vendors ({percentage}%)</span>
                                            </div>
                                            <div className="bg-slate-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full ${item.category === 'LOW' ? 'bg-green-500' :
                                                        item.category === 'MEDIUM' ? 'bg-amber-500' :
                                                            item.category === 'HIGH' ? 'bg-red-500' :
                                                                'bg-slate-400'
                                                        }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-100 rounded-lg p-4 text-center">
                                <p className="text-sm text-green-700 font-medium">Low Risk</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">
                                    {riskDistribution.find(r => r.category === 'LOW')?.count || 0}
                                </p>
                            </div>
                            <div className="bg-amber-100 rounded-lg p-4 text-center">
                                <p className="text-sm text-amber-700 font-medium">Medium Risk</p>
                                <p className="text-3xl font-bold text-amber-900 mt-2">
                                    {riskDistribution.find(r => r.category === 'MEDIUM')?.count || 0}
                                </p>
                            </div>
                            <div className="bg-red-100 rounded-lg p-4 text-center">
                                <p className="text-sm text-red-700 font-medium">High Risk</p>
                                <p className="text-3xl font-bold text-red-900 mt-2">
                                    {riskDistribution.find(r => r.category === 'HIGH')?.count || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Info */}
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-4 flex gap-3">
                <span className="material-icons-round text-slate-600">download</span>
                <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white font-medium">Export Options</p>
                    <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">
                        Click the Export Report button to download the current report in PDF or Excel format.
                    </p>
                </div>
            </div>
        </div>
    );
}
