'use client';

import React from 'react';

interface ScoreComponent {
    label: string;
    value: number; // 0-100
    icon?: string;
}

interface ScoreBreakdownProps {
    scores: ScoreComponent[];
    title?: string;
    overallScore?: number;
}

export function ScoreBreakdown({
    scores,
    title = 'Score Breakdown',
    overallScore,
}: ScoreBreakdownProps) {
    // Get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e'; // Green
        if (score >= 60) return '#84cc16'; // Lime
        if (score >= 40) return '#f59e0b'; // Amber
        if (score >= 20) return '#f97316'; // Orange
        return '#ef4444'; // Red
    };

    // Default icons if not provided
    const getDefaultIcon = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('delivery')) return '🚚';
        if (lowerLabel.includes('dispute')) return '⚖️';
        if (lowerLabel.includes('quality')) return '✨';
        if (lowerLabel.includes('payment')) return '💳';
        if (lowerLabel.includes('fulfillment')) return '📦';
        return '📊';
    };

    if (!scores || scores.length === 0) {
        return (
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
                <span className="text-gray-500">No score breakdown available</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{title}</h3>

                {overallScore !== undefined && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Overall:</span>
                        <span
                            className="text-xl font-bold"
                            style={{ color: getScoreColor(overallScore) }}
                        >
                            {overallScore}
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {scores.map((score, idx) => {
                    const color = getScoreColor(score.value);
                    const icon = score.icon || getDefaultIcon(score.label);

                    return (
                        <div key={idx}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{icon}</span>
                                    <span className="text-sm text-gray-300">{score.label}</span>
                                </div>
                                <span
                                    className="font-semibold"
                                    style={{ color }}
                                >
                                    {score.value}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${score.value}%`,
                                        backgroundColor: color,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Poor (0-39)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Fair (40-59)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-lime-500" />
                        <span>Good (60-79)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Excellent (80+)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScoreBreakdown;
