'use client';

import React from 'react';

interface Prediction {
    type: string;
    probability: number;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface PredictionCardProps {
    title?: string;
    prediction: Prediction;
    showDetails?: boolean;
}

export function PredictionCard({
    title,
    prediction,
    showDetails = true,
}: PredictionCardProps) {
    const severityConfig = {
        LOW: {
            color: '#22c55e',
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
        },
        MEDIUM: {
            color: '#f59e0b',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
        },
        HIGH: {
            color: '#ef4444',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
        },
    };

    const config = severityConfig[prediction.severity];

    // Get appropriate icon
    const getIcon = (type: string) => {
        switch (type) {
            case 'DELIVERY_DELAY':
                return '🚚';
            case 'QUALITY_ISSUE':
                return '⚠️';
            case 'DISPUTE_RISK':
                return '⚖️';
            default:
                return '📊';
        }
    };

    // Format type for display
    const formatType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <div className={`rounded-xl p-4 ${config.bg} border ${config.border}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIcon(prediction.type)}</span>
                    <div>
                        <h4 className="font-medium text-white">
                            {title || formatType(prediction.type)}
                        </h4>
                        <p className="text-sm text-gray-400">{prediction.type}</p>
                    </div>
                </div>

                <div className="text-right">
                    <div
                        className="text-2xl font-bold"
                        style={{ color: config.color }}
                    >
                        {prediction.probability}%
                    </div>
                    <span className="text-xs text-gray-400">probability</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${prediction.probability}%`,
                            backgroundColor: config.color,
                        }}
                    />
                </div>
            </div>

            {/* Message */}
            {showDetails && (
                <p className="mt-3 text-sm text-gray-300">{prediction.message}</p>
            )}
        </div>
    );
}

interface PredictionListProps {
    predictions: Prediction[];
    title?: string;
    emptyMessage?: string;
}

export function PredictionList({
    predictions,
    title = 'Performance Predictions',
    emptyMessage = 'No predictions available',
}: PredictionListProps) {
    if (!predictions || predictions.length === 0) {
        return (
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
                <span className="text-gray-500">{emptyMessage}</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {title && (
                <h3 className="text-white font-medium mb-4">{title}</h3>
            )}
            {predictions.map((pred, idx) => (
                <PredictionCard key={idx} prediction={pred} />
            ))}
        </div>
    );
}

export default PredictionCard;
