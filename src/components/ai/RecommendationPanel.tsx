'use client';

import React from 'react';

interface Recommendation {
    type: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    message: string;
    action: string;
}

interface RecommendationPanelProps {
    recommendations: Recommendation[];
    title?: string;
    maxItems?: number;
    onActionClick?: (action: string, recommendation: Recommendation) => void;
}

export function RecommendationPanel({
    recommendations,
    title = 'AI Recommendations',
    maxItems,
    onActionClick,
}: RecommendationPanelProps) {
    const priorityConfig = {
        HIGH: {
            icon: '🔴',
            color: '#ef4444',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            actionBg: 'bg-red-500/20 hover:bg-red-500/30',
        },
        MEDIUM: {
            icon: '🟡',
            color: '#f59e0b',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            actionBg: 'bg-yellow-500/20 hover:bg-yellow-500/30',
        },
        LOW: {
            icon: '🟢',
            color: '#22c55e',
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
            actionBg: 'bg-green-500/20 hover:bg-green-500/30',
        },
    };

    // Get appropriate type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'RISK_ALERT':
                return '⚠️';
            case 'ANOMALY_ALERT':
                return '🔍';
            case 'PERFORMANCE_WARNING':
                return '📉';
            case 'IMPROVEMENT':
                return '📈';
            case 'OPPORTUNITY':
                return '✨';
            case 'DISPUTE_ALERT':
                return '⚖️';
            default:
                return '💡';
        }
    };

    // Format action for display
    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-white font-medium mb-4">{title}</h3>
                <div className="text-center py-8">
                    <span className="text-4xl">✅</span>
                    <p className="mt-2 text-gray-400">No recommendations at this time</p>
                    <p className="text-sm text-gray-500">All metrics look healthy</p>
                </div>
            </div>
        );
    }

    const displayedRecommendations = maxItems
        ? recommendations.slice(0, maxItems)
        : recommendations;

    return (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{title}</h3>
                <span className="text-xs text-gray-500">
                    {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-3">
                {displayedRecommendations.map((rec, idx) => {
                    const config = priorityConfig[rec.priority];

                    return (
                        <div
                            key={idx}
                            className={`rounded-lg p-4 ${config.bg} border ${config.border} transition-all hover:scale-[1.01]`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-xl">{getTypeIcon(rec.type)}</span>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-medium text-white">{rec.title}</h4>
                                        <span className="text-sm">{config.icon}</span>
                                    </div>

                                    <p className="mt-1 text-sm text-gray-300">{rec.message}</p>

                                    {onActionClick && rec.action && (
                                        <button
                                            onClick={() => onActionClick(rec.action, rec)}
                                            className={`mt-3 px-3 py-1.5 rounded-lg text-sm font-medium ${config.actionBg} transition`}
                                            style={{ color: config.color }}
                                        >
                                            {formatAction(rec.action)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {maxItems && recommendations.length > maxItems && (
                <button className="w-full mt-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 transition">
                    View all {recommendations.length} recommendations →
                </button>
            )}
        </div>
    );
}

export default RecommendationPanel;
