type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'na';

interface RiskScoreBarProps {
    score: number; // 0-100
    showLabel?: boolean;
}

function getRiskLevel(score: number): RiskLevel {
    if (score === 0) return 'na';
    if (score <= 30) return 'low';
    if (score <= 60) return 'medium';
    if (score <= 80) return 'high';
    return 'critical';
}

const riskColors: Record<RiskLevel, { bar: string; text: string }> = {
    low: {
        bar: 'bg-green-500',
        text: 'text-green-600 dark:text-green-400',
    },
    medium: {
        bar: 'bg-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400',
    },
    high: {
        bar: 'bg-orange-500',
        text: 'text-orange-600 dark:text-orange-400',
    },
    critical: {
        bar: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400',
    },
    na: {
        bar: 'bg-gray-400',
        text: 'text-gray-500 dark:text-gray-400',
    },
};

const riskLabels: Record<RiskLevel, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    na: 'N/A',
};

export function RiskScoreBar({ score, showLabel = true }: RiskScoreBarProps) {
    const level = getRiskLevel(score);
    const colors = riskColors[level];

    return (
        <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                    className={`${colors.bar} h-1.5 rounded-full transition-all`}
                    style={{ width: `${score}%` }}
                />
            </div>
            {showLabel && (
                <span className={`text-xs font-medium ${colors.text}`}>
                    {level === 'na' ? 'N/A' : `${riskLabels[level]} (${score}%)`}
                </span>
            )}
        </div>
    );
}
