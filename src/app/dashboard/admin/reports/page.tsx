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

interface ReportData {
    vendorPerformance: VendorPerformance[];
    orderStats: unknown[];
    riskDistribution: unknown[];
}

interface Prediction {
    type: string;
    probability: number;
    message: string;
    severity: string;
}

interface AnomalyAlert {
    id: string;
    alertType: string;
    severity: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
}

interface VendorAnalysis {
    risk: {
        riskScore: number;
        riskCategory: string;
        factors?: Record<string, number>;
    } | null;
    predictions: Prediction[];
    anomalies: AnomalyAlert[];
    loadingRisk: boolean;
    loadingPredictions: boolean;
    loadingAnomalies: boolean;
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<VendorPerformance | null>(null);
    const [analysis, setAnalysis] = useState<VendorAnalysis>({
        risk: null,
        predictions: [],
        anomalies: [],
        loadingRisk: false,
        loadingPredictions: false,
        loadingAnomalies: false,
    });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleViewAnalysis = async (vendor: VendorPerformance) => {
        setSelectedVendor(vendor);
        setAnalysis({
            risk: null,
            predictions: [],
            anomalies: [],
            loadingRisk: true,
            loadingPredictions: true,
            loadingAnomalies: true,
        });

        // Fetch risk score
        fetch(`/api/ai/risk-score?vendorId=${vendor.vendorId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setAnalysis(prev => ({
                    ...prev,
                    risk: data ? {
                        riskScore: data.riskScore ?? data.risk_score ?? 50,
                        riskCategory: data.riskCategory ?? data.risk_category ?? vendor.riskCategory,
                        factors: data.factors ?? data.risk_factors ?? null,
                    } : { riskScore: 50, riskCategory: vendor.riskCategory, factors: null },
                    loadingRisk: false,
                }));
            })
            .catch(() => {
                setAnalysis(prev => ({
                    ...prev,
                    risk: { riskScore: 50, riskCategory: vendor.riskCategory, factors: null },
                    loadingRisk: false,
                }));
            });

        // Fetch predictions
        fetch(`/api/ai/predictions?vendorId=${vendor.vendorId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setAnalysis(prev => ({
                    ...prev,
                    predictions: data?.predictions || [],
                    loadingPredictions: false,
                }));
            })
            .catch(() => {
                setAnalysis(prev => ({ ...prev, predictions: [], loadingPredictions: false }));
            });

        // Fetch anomalies
        fetch(`/api/ai/anomalies?vendorId=${vendor.vendorId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setAnalysis(prev => ({
                    ...prev,
                    anomalies: data?.alerts || [],
                    loadingAnomalies: false,
                }));
            })
            .catch(() => {
                setAnalysis(prev => ({ ...prev, anomalies: [], loadingAnomalies: false }));
            });
    };

    const closeModal = () => {
        setSelectedVendor(null);
    };

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

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'bg-green-100 text-green-700';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
            case 'HIGH': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getRiskGaugeColor = (score: number) => {
        if (score <= 33) return '#22c55e';
        if (score <= 66) return '#eab308';
        return '#ef4444';
    };

    const getSeverityStyle = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPredictionIcon = (type: string) => {
        switch (type) {
            case 'DELIVERY_DELAY': return 'local_shipping';
            case 'DISPUTE_RISK': return 'gavel';
            case 'QUALITY_ISSUE': return 'verified';
            default: return 'analytics';
        }
    };

    const formatPredictionType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Vendor Performance Analytics</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time performance metrics and risk analysis.</p>
                </div>
                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
                    >
                        <span className="material-icons-outlined text-[20px]">{exporting ? 'hourglass_empty' : 'download'}</span>
                        <span>{exporting ? 'Exporting...' : 'Export Data'}</span>
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

            {/* AI Insight Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <span className="material-icons-outlined">auto_awesome</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">Live Insights</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Viewing real-time performance data for {data?.vendorPerformance.length || 0} active vendors.
                        Tracking {data?.vendorPerformance.reduce((acc, v) => acc + v.disputeCount, 0)} total disputes and {data?.vendorPerformance.reduce((acc, v) => acc + v.totalOrders, 0)} orders.
                    </p>
                </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Vendor Performance Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor Name</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Total Orders</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">On-Time Rate</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Disputes (Open/Total)</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Risk Category</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {data?.vendorPerformance.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No data available.</td>
                                </tr>
                            ) : (
                                data?.vendorPerformance.map((vendor) => (
                                    <tr key={vendor.vendorId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-slate-900 dark:text-white">{vendor.vendorName}</span>
                                        </td>
                                        <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-300">
                                            {vendor.totalOrders}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vendor.onTimeRate >= 90 ? 'bg-green-100 text-green-700' :
                                                vendor.onTimeRate >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {vendor.onTimeRate}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-300">
                                            <span className={vendor.openDisputes > 0 ? 'text-red-600 font-medium' : ''}>{vendor.openDisputes}</span> / {vendor.disputeCount}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(vendor.riskCategory)}`}>
                                                {vendor.riskCategory}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleViewAnalysis(vendor)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:underline transition-colors"
                                            >
                                                View Analysis
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Analysis Modal */}
            {selectedVendor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Vendor Analysis — {selectedVendor.vendorName}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    AI-powered risk assessment and performance insights
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
                            >
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Top Summary Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Orders</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedVendor.totalOrders}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">On-Time</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedVendor.onTimeRate}%</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Disputes</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedVendor.disputeCount}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk</p>
                                    <span className={`inline-flex items-center mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(selectedVendor.riskCategory)}`}>
                                        {selectedVendor.riskCategory}
                                    </span>
                                </div>
                            </div>

                            {/* Risk Score Section */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-5 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-icons-outlined text-blue-500">shield</span>
                                    <h4 className="font-semibold text-slate-800 dark:text-white">AI Risk Score</h4>
                                </div>
                                {analysis.loadingRisk ? (
                                    <div className="flex items-center gap-3 py-4">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm text-slate-500">Calculating risk score...</span>
                                    </div>
                                ) : analysis.risk ? (
                                    <div className="flex items-center gap-8">
                                        {/* Risk Gauge */}
                                        <div className="flex-shrink-0">
                                            <div className="relative w-28 h-28">
                                                <svg viewBox="0 0 120 120" className="w-28 h-28 transform -rotate-90">
                                                    <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-600" />
                                                    <circle
                                                        cx="60" cy="60" r="50" fill="none"
                                                        stroke={getRiskGaugeColor(analysis.risk.riskScore)}
                                                        strokeWidth="10"
                                                        strokeDasharray={`${(analysis.risk.riskScore / 100) * 314} 314`}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-1000 ease-out"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(analysis.risk.riskScore)}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">/ 100</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Risk Details */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">Category:</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRiskColor(analysis.risk.riskCategory)}`}>
                                                    {analysis.risk.riskCategory}
                                                </span>
                                            </div>
                                            {analysis.risk.factors && Object.keys(analysis.risk.factors).length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contributing Factors</p>
                                                    {Object.entries(analysis.risk.factors).slice(0, 4).map(([key, value]) => (
                                                        <div key={key} className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-600 dark:text-slate-400 flex-1 capitalize">
                                                                {key.replace(/_/g, ' ')}
                                                            </span>
                                                            <div className="w-24 bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                                                                <div
                                                                    className="h-1.5 rounded-full transition-all duration-700"
                                                                    style={{
                                                                        width: `${Math.min(Number(value), 100)}%`,
                                                                        backgroundColor: getRiskGaugeColor(Number(value)),
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-slate-500 w-8 text-right">{Math.round(Number(value))}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Unable to retrieve risk score data.</p>
                                )}
                            </div>

                            {/* Performance Predictions */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-5 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-icons-outlined text-purple-500">trending_up</span>
                                    <h4 className="font-semibold text-slate-800 dark:text-white">Performance Predictions</h4>
                                </div>
                                {analysis.loadingPredictions ? (
                                    <div className="flex items-center gap-3 py-4">
                                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm text-slate-500">Running ML predictions...</span>
                                    </div>
                                ) : analysis.predictions.length > 0 ? (
                                    <div className="space-y-3">
                                        {analysis.predictions.map((pred, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${pred.severity === 'HIGH' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                        pred.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    <span className="material-icons-outlined text-lg">{getPredictionIcon(pred.type)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-semibold text-slate-800 dark:text-white">
                                                            {formatPredictionType(pred.type)}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSeverityStyle(pred.severity)}`}>
                                                            {pred.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">{pred.message}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(pred.probability)}%</span>
                                                    <p className="text-[10px] text-slate-500 uppercase">probability</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 py-3 text-sm text-slate-500">
                                        <span className="material-icons-outlined text-lg">check_circle</span>
                                        No performance risks predicted for this vendor.
                                    </div>
                                )}
                            </div>

                            {/* Anomaly Alerts */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-5 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-icons-outlined text-amber-500">warning</span>
                                    <h4 className="font-semibold text-slate-800 dark:text-white">Anomaly Alerts</h4>
                                    {!analysis.loadingAnomalies && analysis.anomalies.length > 0 && (
                                        <span className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {analysis.anomalies.length} alert{analysis.anomalies.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                {analysis.loadingAnomalies ? (
                                    <div className="flex items-center gap-3 py-4">
                                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm text-slate-500">Scanning for anomalies...</span>
                                    </div>
                                ) : analysis.anomalies.length > 0 ? (
                                    <div className="space-y-2">
                                        {analysis.anomalies.slice(0, 5).map((alert, idx) => (
                                            <div key={alert.id || idx} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSeverityStyle(alert.severity)}`}>
                                                    {alert.severity}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{alert.title}</p>
                                                    {alert.description && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{alert.description}</p>
                                                    )}
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${alert.status === 'NEW' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        alert.status === 'CONFIRMED' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                                                    }`}>
                                                    {alert.status}
                                                </span>
                                            </div>
                                        ))}
                                        {analysis.anomalies.length > 5 && (
                                            <p className="text-xs text-center text-slate-500 pt-1">
                                                +{analysis.anomalies.length - 5} more alerts
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 py-3 text-sm text-slate-500">
                                        <span className="material-icons-outlined text-lg text-green-500">verified_user</span>
                                        No anomalies detected — vendor behavior is within expected patterns.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
