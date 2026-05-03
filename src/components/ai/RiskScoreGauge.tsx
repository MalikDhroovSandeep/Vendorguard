'use client';

import React from 'react';

interface RiskScoreGaugeProps {
    score: number; // 0-100
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    showPercentage?: boolean;
    animated?: boolean;
}

export function RiskScoreGauge({
    score,
    label = 'Risk Score',
    size = 'md',
    showPercentage = true,
    animated = true,
}: RiskScoreGaugeProps) {
    // Clamp score between 0-100
    const clampedScore = Math.min(100, Math.max(0, score));

    // Determine risk level and colors
    const getRiskLevel = (s: number) => {
        if (s <= 33) return { level: 'LOW', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' };
        if (s <= 66) return { level: 'MEDIUM', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
        return { level: 'HIGH', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
    };

    const risk = getRiskLevel(clampedScore);

    // SVG dimensions based on size
    const dimensions = {
        sm: { width: 120, strokeWidth: 8, fontSize: 18, labelSize: 10 },
        md: { width: 160, strokeWidth: 12, fontSize: 28, labelSize: 12 },
        lg: { width: 200, strokeWidth: 16, fontSize: 36, labelSize: 14 },
    };

    const dim = dimensions[size];
    const radius = (dim.width - dim.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (clampedScore / 100) * circumference;
    const dashOffset = circumference - progress;

    return (
        <div className="flex flex-col items-center">
            <svg
                width={dim.width}
                height={dim.width}
                viewBox={`0 0 ${dim.width} ${dim.width}`}
                className={animated ? 'transition-all duration-1000' : ''}
            >
                {/* Background circle */}
                <circle
                    cx={dim.width / 2}
                    cy={dim.width / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={dim.strokeWidth}
                />

                {/* Progress arc */}
                <circle
                    cx={dim.width / 2}
                    cy={dim.width / 2}
                    r={radius}
                    fill="none"
                    stroke={risk.color}
                    strokeWidth={dim.strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${dim.width / 2} ${dim.width / 2})`}
                    style={{
                        transition: animated ? 'stroke-dashoffset 1s ease-out' : 'none',
                        filter: `drop-shadow(0 0 8px ${risk.color}40)`,
                    }}
                />

                {/* Score text */}
                <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={dim.fontSize}
                    fontWeight="bold"
                >
                    {clampedScore}
                    {showPercentage && (
                        <tspan fontSize={dim.fontSize * 0.5} fill="rgba(255,255,255,0.6)">
                            %
                        </tspan>
                    )}
                </text>

                {/* Risk level label */}
                <text
                    x="50%"
                    y="62%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={risk.color}
                    fontSize={dim.labelSize}
                    fontWeight="600"
                >
                    {risk.level} RISK
                </text>
            </svg>

            {label && (
                <span className="mt-2 text-sm text-gray-400">{label}</span>
            )}
        </div>
    );
}

export default RiskScoreGauge;
