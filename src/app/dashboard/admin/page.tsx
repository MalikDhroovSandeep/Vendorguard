'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { VendorStatusBreakdown } from '@/components/dashboard/VendorStatusBreakdown';
import { VendorTable } from '@/components/dashboard/VendorTable';
import Link from 'next/link';

interface Vendor {
    id: string;
    businessName: string;
    industryCategory: string;
    riskScore: string | number | null;
    riskCategory: string | null;
    status: string;
}

interface AdminDashboardData {
    stats: {
        totalVendors: number;
        pendingKyc: number;
        highRiskVendors: number;
        openDisputes: number;
    };
    breakdown: {
        active: number;
        inactive: number;
        blacklisted: number;
        pendingApproval: number;
        onboardingIncomplete: number;
    };
    recentVendors: Vendor[];
}

interface TrendPoint {
    date: string;
    riskScore: number;
}

interface AnomalyAlert {
    id: string;
    vendorId: string;
    vendor?: { businessName: string };
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: string;
}

interface Prediction {
    type: string;
    probability: number;
    message: string;
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    // AI State
    const [trendData, setTrendData] = useState<TrendPoint[]>([]);
    const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
    const [topRiskVendor, setTopRiskVendor] = useState<Vendor | null>(null);
    const [predictionsCount, setPredictionsCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch admin stats
                const statsRes = await fetch('/api/admin/stats');
                if (statsRes.ok) {
                    const json = await statsRes.json();
                    setData(json);
                    // Get top risk vendor from recent vendors
                    if (json.recentVendors?.length > 0) {
                        const sorted = [...json.recentVendors].sort((a, b) =>
                            (Number(b.riskScore) || 0) - (Number(a.riskScore) || 0)
                        );
                        if (sorted[0] && Number(sorted[0].riskScore) > 50) {
                            setTopRiskVendor(sorted[0]);
                        }
                    }
                }

                // Fetch AI trends (all vendors)
                const trendRes = await fetch('/api/ai/trends');
                if (trendRes.ok) {
                    const trendJson = await trendRes.json();
                    setTrendData((trendJson.historical || []).slice(-6));
                }

                // Fetch anomalies
                const anomalyRes = await fetch('/api/ai/anomalies');
                if (anomalyRes.ok) {
                    const anomalyJson = await anomalyRes.json();
                    setAnomalies((anomalyJson.alerts || []).slice(0, 3));
                }

                // Fetch predictions count (high-risk predictions)
                const predRes = await fetch('/api/ai/predictions');
                if (predRes.ok) {
                    const predJson = await predRes.json();
                    const highRisk = (predJson.predictions || []).filter((p: Prediction) => p.probability > 50);
                    setPredictionsCount(highRisk.length);
                }
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    const { stats, recentVendors, breakdown } = data || {
        stats: { totalVendors: 0, pendingKyc: 0, highRiskVendors: 0, openDisputes: 0 },
        recentVendors: [],
        breakdown: undefined
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Vendors"
                    value={stats.totalVendors.toString()}
                    icon="groups"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    trend={{
                        value: '+12%', // Todo: Calculate real trend
                        direction: 'up',
                        label: 'from last month',
                    }}
                />
                <StatCard
                    title="Pending KYC"
                    value={stats.pendingKyc.toString()}
                    icon="pending_actions"
                    iconBgColor="bg-yellow-50 dark:bg-yellow-900/20"
                    iconColor="text-yellow-600 dark:text-yellow-400"
                    badge={stats.pendingKyc > 0 ? {
                        text: 'Action Required',
                        color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
                    } : undefined}
                />
                <StatCard
                    title="High-Risk Vendors"
                    value={stats.highRiskVendors.toString()}
                    icon="warning"
                    iconBgColor="bg-red-50 dark:bg-red-900/20"
                    iconColor="text-red-600 dark:text-red-400"
                    trend={{
                        value: 'Critical',
                        direction: 'neutral',
                        label: 'AI Flagged',
                    }}
                />
                <StatCard
                    title="Open Disputes"
                    value={stats.openDisputes.toString()}
                    icon="gavel"
                    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    trend={{
                        value: 'Active',
                        direction: 'down',
                        label: 'requiring attention',
                    }}
                />
            </div>

            {/* AI Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Top Risk Alert */}
                <div className={`rounded-2xl p-5 border shadow-sm ${topRiskVendor
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    }`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-full ${topRiskVendor
                                ? 'bg-red-100 dark:bg-red-800'
                                : 'bg-green-100 dark:bg-green-800'
                            }`}>
                            <span className={`material-icons-round text-lg ${topRiskVendor
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                {topRiskVendor ? 'warning' : 'verified'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Risk Alert</p>
                            <p className={`font-bold text-sm ${topRiskVendor
                                    ? 'text-red-800 dark:text-red-300'
                                    : 'text-green-800 dark:text-green-300'
                                }`}>
                                {topRiskVendor ? topRiskVendor.businessName : 'All Clear'}
                            </p>
                        </div>
                    </div>
                    {topRiskVendor ? (
                        <>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Risk Score: <span className="font-bold text-red-600">{topRiskVendor.riskScore}</span> ({topRiskVendor.riskCategory})
                            </p>
                            <Link href={`/dashboard/admin/vendors`} className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2 inline-flex items-center gap-1 hover:underline">
                                View Vendor <span className="material-icons-round text-xs">arrow_forward</span>
                            </Link>
                        </>
                    ) : (
                        <p className="text-sm text-green-700 dark:text-green-400">No high-risk vendors detected!</p>
                    )}
                </div>

                {/* Risk Trend Sparkline */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">System Risk Trend</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Last 6 Months</p>
                        </div>
                        <span className="material-icons-round text-blue-500">trending_up</span>
                    </div>
                    {trendData.length > 0 ? (
                        <div className="flex items-end gap-1 h-12">
                            {trendData.map((point, idx) => {
                                const maxScore = Math.max(...trendData.map(p => p.riskScore), 100);
                                const height = (point.riskScore / maxScore) * 100;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center">
                                        <div
                                            className={`w-full rounded-t transition-all ${point.riskScore > 66 ? 'bg-red-400' :
                                                    point.riskScore > 33 ? 'bg-amber-400' : 'bg-green-400'
                                                }`}
                                            style={{ height: `${Math.max(height, 10)}%` }}
                                            title={`${point.date}: ${point.riskScore.toFixed(0)}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400 text-center py-2">No trend data</div>
                    )}
                </div>

                {/* Predictions Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Predictions</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Next 30 Days</p>
                        </div>
                        <span className="material-icons-round text-purple-500">psychology</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`text-3xl font-bold ${predictionsCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            {predictionsCount}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {predictionsCount > 0
                                ? 'High-risk issues predicted'
                                : 'No high-risk predictions'}
                        </div>
                    </div>
                    <Link href="/dashboard/admin/risk" className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2 inline-flex items-center gap-1 hover:underline">
                        View Analytics <span className="material-icons-round text-xs">arrow_forward</span>
                    </Link>
                </div>

                {/* Anomaly Detection */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Anomaly Detection</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Recent Alerts</p>
                        </div>
                        <span className="material-icons-round text-orange-500">notifications_active</span>
                    </div>
                    {anomalies.length > 0 ? (
                        <div className="space-y-2">
                            {anomalies.slice(0, 2).map((a, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    <span className={`w-2 h-2 rounded-full ${a.severity === 'CRITICAL' ? 'bg-red-500' :
                                            a.severity === 'HIGH' ? 'bg-orange-500' :
                                                a.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                    <span className="text-slate-600 dark:text-slate-400 truncate">{a.title}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-green-600 dark:text-green-400">No anomalies detected</p>
                    )}
                    <Link href="/dashboard/admin/risk" className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2 inline-flex items-center gap-1 hover:underline">
                        View All <span className="material-icons-round text-xs">arrow_forward</span>
                    </Link>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                    <RiskDistributionChart />
                </div>
                <div className="col-span-1 lg:col-span-2">
                    <VendorStatusBreakdown breakdown={breakdown} totalVendors={stats.totalVendors} />
                </div>
            </div>

            {/* Vendor Table */}
            <VendorTable vendors={recentVendors} />
        </div>
    );
}
