'use client';

import { useState, useEffect } from 'react';
import { RiskScoreGauge } from '@/components/ai/RiskScoreGauge';
import { TrendForecastChart } from '@/components/ai/TrendForecastChart';
import { PredictionCard, PredictionList } from '@/components/ai/PredictionCard';
import { RecommendationPanel } from '@/components/ai/RecommendationPanel';
import { ScoreBreakdown } from '@/components/ai/ScoreBreakdown';

interface Vendor {
    id: string;
    businessName: string;
    riskCategory: string;
    status: string;
}

interface RiskScore {
    vendorId: string;
    riskScore: number;
    riskCategory: string;
    deliveryScore: number;
    disputeScore: number;
    qualityScore: number;
    calculatedAt: string;
    vendor: {
        businessName: string;
    }
}

interface Prediction {
    type: string;
    probability: number;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function AIInsightsPage() {
    const [selectedVendorId, setSelectedVendorId] = useState<string>('all');
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
    const [loading, setLoading] = useState(true);

    // Single vendor data
    const [vendorPrediction, setVendorPrediction] = useState<any>(null);
    const [vendorTrend, setVendorTrend] = useState<any>(null);
    const [vendorRecommendations, setVendorRecommendations] = useState<any[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedVendorId !== 'all') {
            fetchVendorSpecificData(selectedVendorId);
        }
    }, [selectedVendorId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [vendorsRes, scoresRes] = await Promise.all([
                fetch('/api/vendors'),
                fetch('/api/ai/risk-score')
            ]);

            const vendorsData = await vendorsRes.json();
            const scoresData = await scoresRes.json();

            setVendors(vendorsData.vendors || []);
            setRiskScores(scoresData.highRiskVendors || []);

            // Use distribution from API
            if (scoresData.distribution) {
                setRiskDistribution({
                    low: scoresData.distribution.LOW || 0,
                    medium: scoresData.distribution.MEDIUM || 0,
                    high: scoresData.distribution.HIGH || 0,
                });
            }
            // Note: In a real app we'd want a paginated list of all vendor scores

            setLoading(false);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setLoading(false);
        }
    };

    const fetchVendorSpecificData = async (vendorId: string) => {
        try {
            setLoading(true);
            const [predRes, trendRes, recRes] = await Promise.all([
                fetch(`/api/ai/predictions?vendorId=${vendorId}`),
                fetch(`/api/ai/trends?vendorId=${vendorId}`),
                fetch(`/api/ai/recommendations?vendorId=${vendorId}`)
            ]);

            const predData = await predRes.json();
            const trendData = await trendRes.json();
            const recData = await recRes.json();

            setVendorPrediction(predData);
            setVendorTrend(trendData);
            setVendorRecommendations(recData.recommendations || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vendor data:', error);
            setLoading(false);
        }
    };

    const [riskDistribution, setRiskDistribution] = useState({ low: 0, medium: 0, high: 0 });

    const getVendorScore = (id: string) => riskScores.find(s => s.vendorId === id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Insights</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">AI-generated vendor risk scores and performance indicators</p>
                </div>

                <div className="w-full md:w-64">
                    <select
                        value={selectedVendorId}
                        onChange={(e) => setSelectedVendorId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Overview (All Vendors)</option>
                        {vendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                                {vendor.businessName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* AI Advisory Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                <span className="material-icons-round text-blue-600 dark:text-blue-400">psychology</span>
                <div className="flex-1">
                    <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">AI Advisory Information</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        All insights are AI-generated for decision support. Final procurement decisions remain human-driven.
                    </p>
                </div>
            </div>

            {selectedVendorId === 'all' ? (
                /* All Vendors View */
                <>
                    {/* Risk Distribution Summary */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Risk Distribution Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 dark:text-green-400 font-medium">Low Risk Vendors</p>
                                        <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-2">{riskDistribution.low}</p>
                                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">Risk Score: 0-33</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="material-icons-round text-white">check_circle</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Medium Risk Vendors</p>
                                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-300 mt-2">{riskDistribution.medium}</p>
                                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Risk Score: 34-66</p>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                                        <span className="material-icons-round text-white">warning</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">High Risk Vendors</p>
                                        <p className="text-3xl font-bold text-red-900 dark:text-red-300 mt-2">{riskDistribution.high}</p>
                                        <p className="text-xs text-red-600 dark:text-red-500 mt-1">Risk Score: 67-100</p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="material-icons-round text-white">error</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* High Risk Vendors Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Flagged High Risk Vendors</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Vendor</th>
                                        <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Risk Score</th>
                                        <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Delivery</th>
                                        <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Quality</th>
                                        <th className="px-6 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {riskScores.map((score) => (
                                        <tr key={score.vendorId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                {score.vendor?.businessName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${score.riskScore > 66 ? 'text-red-600' : 'text-amber-600'}`}>
                                                        {score.riskScore}
                                                    </span>
                                                    <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full ${score.riskScore > 66 ? 'bg-red-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${score.riskScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{score.deliveryScore?.toFixed(0) || 'N/A'}</td>
                                            <td className="px-6 py-4">{score.qualityScore?.toFixed(0) || 'N/A'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedVendorId(score.vendorId)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Analyze
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* Single Vendor Dashboard */
                <>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Scores & Trends */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Trend Chart */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Risk Trend Forecast</h2>
                                    {vendorTrend?.historical && (
                                        <TrendForecastChart
                                            data={vendorTrend.historical.map((h: any) => ({
                                                month: h.date,
                                                score: h.riskScore
                                            }))}
                                            predictedScore={vendorTrend.forecast?.predicted_risk_score}
                                            trend={(vendorTrend.forecast?.trend_direction || 'stable').toLowerCase()}
                                            height={300}
                                        />
                                    )}
                                </div>

                                {/* Recommendations */}
                                <RecommendationPanel
                                    recommendations={vendorRecommendations}
                                    title="AI-Driven Actions"
                                />
                            </div>

                            {/* Right Column: Key Metrics & Predictions */}
                            <div className="space-y-6">
                                {/* Risk Gauge */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Current Risk Score</h2>
                                    <RiskScoreGauge
                                        score={vendorTrend?.historical && vendorTrend.historical.length > 0 ? vendorTrend.historical[vendorTrend.historical.length - 1].riskScore : 0}
                                        size="lg"
                                    />
                                </div>

                                {/* Score Breakdown */}
                                <ScoreBreakdown
                                    scores={[
                                        {
                                            label: 'Delivery Reliability',
                                            value: vendorTrend?.historical?.length > 0
                                                ? (vendorTrend.historical[vendorTrend.historical.length - 1].deliveryScore || 0)
                                                : 0
                                        },
                                        {
                                            label: 'Quality Assurance',
                                            value: vendorTrend?.historical?.length > 0
                                                ? (vendorTrend.historical[vendorTrend.historical.length - 1].qualityScore || 0)
                                                : 0
                                        },
                                        {
                                            label: 'Dispute Resolution',
                                            value: vendorTrend?.historical?.length > 0
                                                ? (vendorTrend.historical[vendorTrend.historical.length - 1].disputeScore || 0)
                                                : 0
                                        },
                                        {
                                            label: 'Payment History',
                                            value: vendorTrend?.historical?.length > 0
                                                ? (vendorTrend.historical[vendorTrend.historical.length - 1].paymentScore || 0)
                                                : 0
                                        },
                                    ]}
                                />

                                {/* Predictive Alerts */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-slate-900 dark:text-white">Predictive Alerts (Next 30 Days)</h3>
                                    <PredictionList
                                        predictions={vendorPrediction?.predictions?.map((p: any) => ({
                                            type: p.type || p.predictionType,
                                            probability: p.probability > 1 ? p.probability : p.probability * 100, // Handle 0-1 vs 0-100
                                            message: p.message || p.details,
                                            severity: (p.probability > 70 || (p.probability <= 1 && p.probability > 0.7)) ? 'HIGH' : 'MEDIUM'
                                        })) || []}
                                        title=""
                                        emptyMessage="No immediate risks detected."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
