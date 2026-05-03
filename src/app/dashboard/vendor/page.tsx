'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import Link from 'next/link';

interface VendorStats {
    activeOrders: number;
    pendingInvoices: number;
    pendingInvoicesAmount: number;
    disputes: number;
    riskScore: number | null;
    riskCategory: string | null;
    kycStatus: string;
}

interface RecentActivity {
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    timestamp: string;
}

interface AIRecommendation {
    type: string;
    priority: string;
    title: string;
    message: string;
}

interface TrendPoint {
    date: string;
    riskScore: number;
}

export default function VendorDashboard() {
    const [stats, setStats] = useState<VendorStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // AI State
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [trendData, setTrendData] = useState<TrendPoint[]>([]);
    const [topPrediction, setTopPrediction] = useState<{ type: string; probability: number; message: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch vendor stats
                const statsRes = await fetch('/api/vendor/stats');
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data.stats);
                    setRecentActivity(data.recentActivity || []);
                }

                // Fetch AI recommendations (for vendor's own data)
                const recRes = await fetch('/api/ai/recommendations');
                if (recRes.ok) {
                    const recData = await recRes.json();
                    setRecommendations((recData.recommendations || []).slice(0, 2)); // Top 2
                }

                // Fetch AI predictions
                const predRes = await fetch('/api/ai/predictions');
                if (predRes.ok) {
                    const predData = await predRes.json();
                    const preds = predData.predictions || [];
                    if (preds.length > 0) {
                        // Get highest probability prediction
                        const top = preds.reduce((max: any, p: any) =>
                            (p.probability > (max?.probability || 0)) ? p : max, null);
                        setTopPrediction(top);
                    }
                }

                // Fetch AI trends
                const trendRes = await fetch('/api/ai/trends');
                if (trendRes.ok) {
                    const trendData = await trendRes.json();
                    setTrendData((trendData.historical || []).slice(-6)); // Last 6 months
                }
            } catch (err) {
                console.error('Failed to fetch vendor data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getKycStatusBadge = () => {
        const status = stats?.kycStatus || 'PENDING';
        const statusMap: Record<string, { text: string; color: string }> = {
            PENDING: { text: 'KYC Pending', color: 'bg-yellow-400' },
            SUBMITTED: { text: 'KYC Submitted', color: 'bg-blue-400' },
            VERIFIED: { text: 'KYC Verified', color: 'bg-green-400' },
            REJECTED: { text: 'KYC Rejected', color: 'bg-red-400' },
        };
        return statusMap[status] || statusMap.PENDING;
    };

    const getRiskBadge = () => {
        const category = stats?.riskCategory || 'LOW';
        const categoryMap: Record<string, { text: string; color: string }> = {
            LOW: { text: 'Low Risk', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
            MEDIUM: { text: 'Medium Risk', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
            HIGH: { text: 'High Risk', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
        };
        return categoryMap[category] || categoryMap.LOW;
    };

    const kycBadge = getKycStatusBadge();
    const riskBadge = getRiskBadge();

    return (
        <div className="space-y-8">
            {/* Welcome & KYC CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-3">Welcome to VendorGuard</h2>
                        <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
                            Your vendor profile helps us streamline procurement and payments.
                            {stats?.kycStatus !== 'VERIFIED' && ' Please complete your KYC to unlock full access to orders and invoicing.'}
                        </p>
                        <div className="flex items-center gap-4 mt-6">
                            <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
                                <span className={`w-2 h-2 ${kycBadge.color} rounded-full ${stats?.kycStatus === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                                {kycBadge.text}
                            </span>
                        </div>
                    </div>
                    {stats?.kycStatus !== 'VERIFIED' && (
                        <Link
                            href="/dashboard/vendor/kyc"
                            className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 group whitespace-nowrap"
                        >
                            Complete KYC Details
                            <span className="material-icons-round group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <span className="material-icons-round text-9xl">verified_user</span>
                </div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -top-12 right-1/4 w-32 h-32 bg-indigo-400 rounded-full blur-3xl opacity-30"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Active Orders"
                    value={loading ? '...' : String(stats?.activeOrders || 0)}
                    icon="shopping_cart"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Pending Invoices"
                    value={loading ? '...' : formatCurrency(stats?.pendingInvoicesAmount || 0)}
                    icon="receipt_long"
                    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    badge={{
                        text: `${stats?.pendingInvoices || 0} Pending`,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
                    }}
                />
                <StatCard
                    title="Risk Score"
                    value={loading ? '...' : String(stats?.riskScore || 'N/A')}
                    icon="verified"
                    iconBgColor="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                    badge={{
                        text: riskBadge.text,
                        color: riskBadge.color,
                    }}
                />
                <StatCard
                    title="Disputes"
                    value={loading ? '...' : String(stats?.disputes || 0)}
                    icon="gavel"
                    iconBgColor="bg-slate-50 dark:bg-slate-800"
                    iconColor="text-slate-600 dark:text-slate-400"
                    trend={{
                        value: stats?.disputes === 0 ? 'Clean' : `${stats?.disputes} Active`,
                        direction: stats?.disputes === 0 ? 'neutral' : 'down',
                        label: stats?.disputes === 0 ? 'No issues' : 'Needs attention',
                    }}
                />
            </div>

            {/* AI Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick AI Alert Banner */}
                {topPrediction && (
                    <div className={`rounded-2xl p-5 border shadow-sm ${topPrediction.probability > 50
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-full ${topPrediction.probability > 50
                                ? 'bg-amber-100 dark:bg-amber-800'
                                : 'bg-green-100 dark:bg-green-800'
                                }`}>
                                <span className={`material-icons-round text-lg ${topPrediction.probability > 50
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    {topPrediction.probability > 50 ? 'warning' : 'check_circle'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Prediction</p>
                                <p className={`font-bold ${topPrediction.probability > 50
                                    ? 'text-amber-800 dark:text-amber-300'
                                    : 'text-green-800 dark:text-green-300'
                                    }`}>
                                    {topPrediction.probability > 1 ? topPrediction.probability.toFixed(0) : (topPrediction.probability * 100).toFixed(0)}% {topPrediction.type?.replace('_', ' ') || 'Risk'}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{topPrediction.message}</p>
                        <Link href="/dashboard/vendor/performance" className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-3 inline-flex items-center gap-1 hover:underline">
                            View Details <span className="material-icons-round text-xs">arrow_forward</span>
                        </Link>
                    </div>
                )}

                {/* Mini Trend Sparkline */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Risk Score Trend</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">Last 6 Months</p>
                        </div>
                        <span className="material-icons-round text-blue-500">trending_up</span>
                    </div>
                    {trendData.length > 0 ? (
                        <div className="flex items-end gap-1 h-16">
                            {trendData.map((point, idx) => {
                                const maxScore = Math.max(...trendData.map(p => p.riskScore));
                                const height = (point.riskScore / Math.max(maxScore, 100)) * 100;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center">
                                        <div
                                            className={`w-full rounded-t transition-all ${point.riskScore > 66 ? 'bg-red-400' :
                                                point.riskScore > 33 ? 'bg-amber-400' : 'bg-green-400'
                                                }`}
                                            style={{ height: `${Math.max(height, 10)}%` }}
                                            title={`${point.date}: ${point.riskScore}`}
                                        />
                                        <span className="text-[10px] text-slate-400 mt-1">{point.date.slice(5)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400 text-center py-4">No trend data</div>
                    )}
                </div>

                {/* Top Recommendations */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Recommendations</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">Actions for You</p>
                        </div>
                        <span className="material-icons-round text-purple-500">psychology</span>
                    </div>
                    {recommendations.length > 0 ? (
                        <div className="space-y-3">
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                    <span className={`material-icons-round text-sm mt-0.5 ${rec.priority === 'HIGH' ? 'text-red-500' :
                                        rec.priority === 'MEDIUM' ? 'text-amber-500' : 'text-green-500'
                                        }`}>
                                        {rec.priority === 'HIGH' ? 'priority_high' : rec.priority === 'MEDIUM' ? 'remove' : 'low_priority'}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{rec.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{rec.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400 text-center py-4">
                            <span className="material-icons-round text-2xl mb-1">check_circle</span>
                            <p>No recommendations - you&apos;re doing great!</p>
                        </div>
                    )}
                    <Link href="/dashboard/vendor/performance" className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-3 inline-flex items-center gap-1 hover:underline">
                        View All Insights <span className="material-icons-round text-xs">arrow_forward</span>
                    </Link>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
                    <Link href="/dashboard/vendor/orders" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                        View All Orders
                    </Link>
                </div>
                <div className="space-y-0">
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading...</div>
                    ) : recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <span className="material-icons-round text-4xl mb-2 text-slate-300">inbox</span>
                            <p>No recent activity</p>
                        </div>
                    ) : (
                        recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-xl mx-[-1rem] px-6">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                    <span className="material-icons-round text-sm">
                                        {activity.type === 'order' ? 'shopping_cart' : 'notifications'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{activity.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
