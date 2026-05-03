'use client';

import React, { useState, useEffect } from 'react';
import { TrendForecastChart } from '@/components/ai/TrendForecastChart';
import { AnomalyAlertCard } from '@/components/ai/AnomalyAlertCard';
import { RiskScoreGauge } from '@/components/ai/RiskScoreGauge';

// Types
interface RiskStats {
    totalVendors: number;
    averageRiskScore: number;
    distribution: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
    };
    highRiskVendors: Array<{
        id: string;
        businessName: string;
        riskScore: number;
        riskCategory: string;
    }>;
}

interface AnomalyAlert {
    id: string;
    vendorId: string;
    vendor: {
        businessName: string;
    };
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: string;
    status: string;
}

interface TrendData {
    month: string;
    averageScore: number;
    vendorCount: number;
}

export default function AIRiskAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [riskStats, setRiskStats] = useState<RiskStats | null>(null);
    const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [riskRes, anomalyRes, trendRes] = await Promise.all([
                    fetch('/api/ai/risk-score'),
                    fetch('/api/ai/anomalies?status=NEW'),
                    fetch('/api/ai/trends')
                ]);

                const riskData = await riskRes.json();
                const anomalyData = await anomalyRes.json();
                const trendResult = await trendRes.json();

                setRiskStats(riskData);
                setAnomalies(anomalyData.alerts || []);
                setTrendData(trendResult.trend || []);
            } catch (error) {
                console.error('Failed to fetch AI analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatCards = () => {
        if (!riskStats) return [];

        return [
            {
                title: 'High Risk Vendors',
                value: riskStats.distribution.HIGH.toString(),
                icon: 'warning',
                iconBg: 'bg-red-100 dark:bg-red-900/30',
                iconColor: 'text-red-600 dark:text-red-400',
                subtitle: `${((riskStats.distribution.HIGH / riskStats.totalVendors) * 100).toFixed(1)}% of total vendors`,
            },
            {
                title: 'Avg Risk Score',
                value: riskStats.averageRiskScore.toString(),
                valueSuffix: '/100',
                icon: 'speed',
                iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                iconColor: 'text-blue-600',
                subtitle: 'Global risk average',
            },
            {
                title: 'Active Anomalies',
                value: anomalies.length.toString(),
                icon: 'notifications_active',
                iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
                iconColor: 'text-yellow-600 dark:text-yellow-400',
                subtitle: 'Requires attention',
            },
            {
                title: 'Total Vendors',
                value: riskStats.totalVendors.toLocaleString(),
                icon: 'store',
                iconBg: 'bg-green-100 dark:bg-green-900/30',
                iconColor: 'text-green-600 dark:text-green-400',
                subtitle: 'Monitored by AI',
            },
        ];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Risk Analytics</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI-powered vendor risk assessment and monitoring</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getStatCards().map((card, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{card.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {card.value}
                                    {card.valueSuffix && <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{card.valueSuffix}</span>}
                                </h3>
                            </div>
                            <span className={`p-2 ${card.iconBg} ${card.iconColor} rounded-md`}>
                                <span className="material-icons-outlined text-xl">{card.icon}</span>
                            </span>
                        </div>
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                            {card.subtitle}
                        </div>
                    </div>
                ))}
            </div>

            {/* Risk Trend Chart + AI Anomaly Detection */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Score Trend */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Risk Score Trend</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Average vendor risk exposure over time</p>
                        </div>
                    </div>

                    <div className="h-64">
                        <TrendForecastChart
                            data={trendData.map(d => ({
                                month: d.month,
                                score: d.averageScore
                            }))}
                            height={250}
                            title=""
                            trend={
                                trendData.length >= 2
                                    ? (trendData[trendData.length - 1].averageScore < trendData[trendData.length - 2].averageScore ? 'improving' : 'declining')
                                    : 'stable'
                            }
                        />
                    </div>
                </div>

                {/* AI Anomaly Detection */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live Anomalies</h2>
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                            {anomalies.length} New
                        </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[400px] flex-1 pr-2">
                        {anomalies.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <span className="material-icons-outlined text-4xl mb-2">check_circle</span>
                                <p>No anomalies detected</p>
                            </div>
                        ) : (
                            anomalies.map((alert, index) => (
                                <AnomalyAlertCard
                                    key={alert.id || index}
                                    title={alert.title}
                                    vendorName={alert.vendor?.businessName}
                                    severity={alert.severity}
                                    message={alert.description}
                                    timestamp={alert.createdAt}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Vendor Risk Matrix */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">High Risk Vendors</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Vendors requiring immediate attention based on AI scoring.</p>
                    </div>
                    <div>
                        <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">View All Vendors →</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 font-medium">Vendor Name</th>
                                <th className="px-6 py-3 font-medium">Risk Score</th>
                                <th className="px-6 py-3 font-medium">Risk Visual</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {riskStats?.highRiskVendors.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No high risk vendors found. Great job!
                                    </td>
                                </tr>
                            ) : (
                                riskStats?.highRiskVendors.map((vendor, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {vendor.businessName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${vendor.riskScore > 75 ? 'text-red-600' : 'text-orange-600'
                                                }`}>
                                                {vendor.riskScore} / 100
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-24">
                                                <RiskScoreGauge
                                                    score={vendor.riskScore}
                                                    size="sm"
                                                    showPercentage={false}
                                                    label=""
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`/dashboard/internal/vendors/${vendor.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Details
                                            </a>
                                        </td>
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
