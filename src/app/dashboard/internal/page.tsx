'use client';

import { useState, useEffect } from 'react';
import { MiniStatCard } from '@/components/dashboard/MiniStatCard';

interface DashboardStats {
    vendorCount: number;
    activeOrderCount: number;
    pendingInvoiceCount: number;
    openDisputeCount: number;
}

interface AlertData {
    pendingKYC: number;
    highRiskVendors: number;
}

interface ActivityItem {
    id: string;
    vendor: string;
    type: string;
    amount: string;
    status: string;
    date: string;
}

export default function InternalDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [alerts, setAlerts] = useState<AlertData>({ pendingKYC: 0, highRiskVendors: 0 });
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/internal/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setAlerts(data.alerts);
                    setRecentActivity(data.recentActivity || []);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = stats ? [
        {
            title: 'Total Vendors',
            value: stats.vendorCount.toString(),
            icon: 'business',
            iconColor: 'text-blue-600',
            iconBgColor: 'bg-blue-100',
            trend: { value: `${stats.vendorCount} registered`, type: 'neutral' as const }
        },
        {
            title: 'Active Orders',
            value: stats.activeOrderCount.toString(),
            icon: 'shopping_cart',
            iconColor: 'text-emerald-600',
            iconBgColor: 'bg-emerald-100',
            trend: { value: 'In progress', type: 'positive' as const, icon: 'trending_up' }
        },
        {
            title: 'Pending Invoices',
            value: stats.pendingInvoiceCount.toString(),
            icon: 'receipt',
            iconColor: 'text-amber-600',
            iconBgColor: 'bg-amber-100',
            trend: { value: 'Awaiting approval', type: 'neutral' as const }
        },
        {
            title: 'Open Disputes',
            value: stats.openDisputeCount.toString(),
            icon: 'gavel',
            iconColor: 'text-red-600',
            iconBgColor: 'bg-red-100',
            trend: stats.openDisputeCount > 0
                ? { value: 'Needs attention', type: 'warning' as const, icon: 'warning' }
                : { value: 'All clear', type: 'positive' as const }
        },
    ] : [];

    const alertsList = [
        ...(alerts.pendingKYC > 0 ? [{
            id: 1,
            type: 'warning' as const,
            title: 'Vendors Pending KYC',
            message: `${alerts.pendingKYC} vendors are awaiting KYC verification`,
            timestamp: 'Now'
        }] : []),
        ...(alerts.highRiskVendors > 0 ? [{
            id: 2,
            type: 'danger' as const,
            title: 'High-Risk Vendors',
            message: `${alerts.highRiskVendors} vendors flagged as high risk`,
            timestamp: 'Now'
        }] : [])
    ];

    const formatCurrency = (amount: string) => {
        const num = parseFloat(amount);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor vendor operations and activities</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                        </div>
                    ))
                ) : (
                    statCards.map((stat, index) => (
                        <MiniStatCard key={index} {...stat} />
                    ))
                )}
            </div>

            {/* Alerts Section */}
            {alertsList.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-icons-round text-amber-500">notifications</span>
                        Alerts & Notifications
                    </h2>
                    <div className="space-y-3">
                        {alertsList.map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-lg border-l-4 ${alert.type === 'danger'
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                        : alert.type === 'warning'
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className={`font-medium ${alert.type === 'danger' ? 'text-red-800 dark:text-red-200' :
                                                alert.type === 'warning' ? 'text-amber-800 dark:text-amber-200' :
                                                    'text-blue-800 dark:text-blue-200'
                                            }`}>
                                            {alert.title}
                                        </h3>
                                        <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{alert.message}</p>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{alert.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td>
                                </tr>
                            ) : recentActivity.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No recent activity. Start by adding vendors and creating orders!
                                    </td>
                                </tr>
                            ) : (
                                recentActivity.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 text-sm font-medium text-blue-600">{item.id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{item.vendor}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{item.type}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(item.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'COMPLETED' || item.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
