'use client';

import { useState, useEffect } from 'react';
import { RiskScoreGauge } from '@/components/ai/RiskScoreGauge';
import { TrendForecastChart } from '@/components/ai/TrendForecastChart';
import { PredictionList } from '@/components/ai/PredictionCard';
import { RecommendationPanel } from '@/components/ai/RecommendationPanel';
import { ScoreBreakdown } from '@/components/ai/ScoreBreakdown';

export default function VendorPerformancePage() {
    const [loading, setLoading] = useState(true);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [riskData, setRiskData] = useState<any>(null);
    const [predictions, setPredictions] = useState<any>(null);
    const [trendData, setTrendData] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    useEffect(() => {
        // First get current vendor ID
        fetch('/api/user/settings')
            .then(res => res.json())
            .then(data => {
                const vid = data.user?.vendor?.id;
                if (vid) {
                    setVendorId(vid);
                    fetchAIData(vid);
                } else {
                    console.log('No vendor ID found for user');
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error('Failed to fetch user settings:', err);
                setLoading(false);
            });
    }, []);

    const fetchAIData = async (id: string) => {
        try {
            const [riskRes, predRes, trendRes, recRes] = await Promise.all([
                fetch(`/api/ai/risk-score?vendorId=${id}`),
                fetch(`/api/ai/predictions?vendorId=${id}`),
                fetch(`/api/ai/trends?vendorId=${id}`),
                fetch(`/api/ai/recommendations?vendorId=${id}`)
            ]);

            const risk = await riskRes.json();
            const pred = await predRes.json();
            const trend = await trendRes.json();
            const rec = await recRes.json();

            setRiskData(risk);
            setPredictions(pred);
            setTrendData(trend);
            setRecommendations(rec.recommendations || []);
        } catch (error) {
            console.error('Error fetching AI data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!vendorId) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Access Restricted</h2>
                <p className="text-slate-500 mt-2">This dashboard is only available for registered vendors.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Insights</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">AI-driven analysis of your performance and risk metrics</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <span className="material-icons-round text-xl">download</span>
                    Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Score Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                    <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white w-full text-left">Your Risk Score</h3>
                    <div className="my-4">
                        <RiskScoreGauge
                            score={riskData?.riskScore || 0}
                            size="lg"
                        />
                    </div>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                        Lower score indicates better performance. Calculated based on delivery times, quality, and dispute history.
                    </p>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <ScoreBreakdown
                        scores={[
                            { label: 'Delivery Performance', value: riskData?.deliveryScore || 0 },
                            { label: 'Quality Standards', value: riskData?.qualityScore || 0 },
                            { label: 'Dispute Resolution', value: riskData?.disputeScore || 0 },
                            { label: 'Payment History', value: riskData?.paymentScore || 0 },
                        ]}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Forecast */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Risk Trend & Forecast</h3>
                    {trendData?.historical && (
                        <TrendForecastChart
                            data={trendData.historical.map((h: any) => ({
                                month: h.date,
                                score: h.riskScore
                            }))}
                            predictedScore={trendData.forecast?.predicted_risk_score}
                            trend={(trendData.forecast?.trend_direction || 'stable').toLowerCase()}
                            height={250}
                        />
                    )}
                </div>

                {/* Predictions */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Performance Predictions</h3>
                    <PredictionList
                        predictions={predictions?.predictions?.map((p: any) => ({
                            type: p.type || p.predictionType,
                            probability: p.probability > 1 ? p.probability : p.probability * 100,
                            message: p.message || p.details,
                            severity: (p.probability > 70 || (p.probability <= 1 && p.probability > 0.7)) ? 'HIGH' : 'MEDIUM'
                        })) || []}
                        title=""
                        emptyMessage="No significant risks predicted for the coming month."
                    />
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <RecommendationPanel
                    recommendations={recommendations}
                    title="Recommended Actions to Improve Score"
                />
            </div>
        </div>
    );
}
