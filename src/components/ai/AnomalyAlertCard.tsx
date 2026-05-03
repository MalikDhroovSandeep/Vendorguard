'use client';

import React from 'react';

interface AnomalyDetail {
    type: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface AnomalyAlertCardProps {
    title: string;
    vendorName?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    details?: AnomalyDetail[];
    timestamp?: string;
    onDismiss?: () => void;
    onInvestigate?: () => void;
}

export function AnomalyAlertCard({
    title,
    vendorName,
    severity,
    message,
    details,
    timestamp,
    onDismiss,
    onInvestigate,
}: AnomalyAlertCardProps) {
    const severityConfig = {
        LOW: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            icon: 'ℹ️',
            textColor: 'text-blue-400',
            badgeBg: 'bg-blue-500/20',
        },
        MEDIUM: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            icon: '⚠️',
            textColor: 'text-yellow-400',
            badgeBg: 'bg-yellow-500/20',
        },
        HIGH: {
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/30',
            icon: '🔶',
            textColor: 'text-orange-400',
            badgeBg: 'bg-orange-500/20',
        },
        CRITICAL: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            icon: '🚨',
            textColor: 'text-red-400',
            badgeBg: 'bg-red-500/20',
        },
    };

    const config = severityConfig[severity];

    const formatTime = (ts: string) => {
        const date = new Date(ts);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            className={`rounded-xl p-4 ${config.bg} border ${config.border} transition-all hover:scale-[1.01]`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">{title}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.badgeBg} ${config.textColor}`}>
                                {severity}
                            </span>
                        </div>
                        {vendorName && (
                            <p className="text-sm text-gray-400">{vendorName}</p>
                        )}
                    </div>
                </div>

                {timestamp && (
                    <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
                )}
            </div>

            <p className="mt-3 text-sm text-gray-300">{message}</p>

            {details && details.length > 0 && (
                <div className="mt-3 space-y-1">
                    {details.map((detail, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-400"
                        >
                            <span className="w-2 h-2 rounded-full bg-gray-500" />
                            <span className="font-medium text-gray-300">{detail.type}:</span>
                            <span>{detail.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {(onDismiss || onInvestigate) && (
                <div className="mt-4 flex gap-2">
                    {onInvestigate && (
                        <button
                            onClick={onInvestigate}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${config.badgeBg} ${config.textColor} hover:opacity-80 transition`}
                        >
                            Investigate
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default AnomalyAlertCard;
