'use client';

import React from 'react';

interface TrendDataPoint {
    month: string;
    score: number;
    isPrediction?: boolean;
}

interface TrendForecastChartProps {
    data: TrendDataPoint[];
    predictedScore?: number;
    trend?: 'improving' | 'stable' | 'declining';
    height?: number;
    showLegend?: boolean;
    title?: string;
}

export function TrendForecastChart({
    data,
    predictedScore,
    trend,
    height = 200,
    showLegend = true,
    title = 'Risk Trend',
}: TrendForecastChartProps) {
    if (!data || data.length === 0) {
        return (
            <div
                className="flex items-center justify-center rounded-xl bg-white/5 border border-white/10"
                style={{ height }}
            >
                <span className="text-gray-500">No trend data available</span>
            </div>
        );
    }

    // Include prediction point if provided
    const chartData = predictedScore
        ? [...data, { month: 'Predicted', score: predictedScore, isPrediction: true }]
        : data;

    // Calculate chart dimensions
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = 400;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate scales
    const scores = chartData.map(d => d.score);
    const minScore = Math.floor(Math.min(...scores) / 10) * 10;
    const maxScore = Math.ceil(Math.max(...scores) / 10) * 10;
    const scoreRange = maxScore - minScore || 1;

    // Generate points
    const points = chartData.map((d, i) => {
        const x = padding.left + (i / (chartData.length - 1 || 1)) * (chartWidth - padding.left - padding.right);
        const y = padding.top + (1 - (d.score - minScore) / scoreRange) * chartHeight;
        return { ...d, x, y };
    });

    // Create path
    const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    // Separate historical and prediction paths
    const historicalPoints = points.filter(p => !p.isPrediction);
    const predictionPoint = points.find(p => p.isPrediction);

    const historicalPath = historicalPoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    // Trend indicator
    const trendConfig = {
        improving: { icon: '↗️', color: '#22c55e', label: 'Improving' },
        stable: { icon: '→', color: '#f59e0b', label: 'Stable' },
        declining: { icon: '↘️', color: '#ef4444', label: 'Declining' },
    };

    const trendInfo = trend ? trendConfig[trend] : null;

    return (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{title}</h3>

                {trendInfo && (
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{trendInfo.icon}</span>
                        <span style={{ color: trendInfo.color }} className="text-sm font-medium">
                            {trendInfo.label}
                        </span>
                    </div>
                )}
            </div>

            <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${chartWidth} ${height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(pct => {
                    const y = padding.top + (1 - pct / 100) * chartHeight;
                    const score = minScore + (pct / 100) * scoreRange;
                    return (
                        <g key={pct}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={chartWidth - padding.right}
                                y2={y}
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4"
                            />
                            <text
                                x={padding.left - 8}
                                y={y}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                fill="rgba(255,255,255,0.4)"
                                fontSize="10"
                            >
                                {Math.round(score)}
                            </text>
                        </g>
                    );
                })}

                {/* Gradient area */}
                <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                    d={`${historicalPath} L ${historicalPoints[historicalPoints.length - 1]?.x || 0} ${padding.top + chartHeight} L ${historicalPoints[0]?.x || 0} ${padding.top + chartHeight} Z`}
                    fill="url(#trendGradient)"
                />

                {/* Historical line */}
                <path
                    d={historicalPath}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Prediction dashed line */}
                {predictionPoint && historicalPoints.length > 0 && (
                    <path
                        d={`M ${historicalPoints[historicalPoints.length - 1].x} ${historicalPoints[historicalPoints.length - 1].y} L ${predictionPoint.x} ${predictionPoint.y}`}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                    />
                )}

                {/* Data points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={p.isPrediction ? 6 : 4}
                            fill={p.isPrediction ? '#f59e0b' : '#818cf8'}
                            stroke={p.isPrediction ? '#f59e0b' : '#1e1e2e'}
                            strokeWidth="2"
                        />
                        {/* Month labels */}
                        <text
                            x={p.x}
                            y={height - 10}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.4)"
                            fontSize="10"
                        >
                            {p.month.slice(0, 3)}
                        </text>
                    </g>
                ))}

                {/* Prediction label */}
                {predictionPoint && (
                    <text
                        x={predictionPoint.x}
                        y={predictionPoint.y - 15}
                        textAnchor="middle"
                        fill="#f59e0b"
                        fontSize="12"
                        fontWeight="500"
                    >
                        {Math.round(predictionPoint.score)}
                    </text>
                )}
            </svg>

            {showLegend && (
                <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-indigo-400 rounded" />
                        <span>Historical</span>
                    </div>
                    {predictedScore !== undefined && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span>Predicted</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TrendForecastChart;
