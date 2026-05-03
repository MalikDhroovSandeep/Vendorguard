interface MiniStatCardProps {
    title: string;
    value: string | number;
    icon: string;
    iconColor: string;
    iconBgColor: string;
    trend?: {
        value: string;
        type: 'positive' | 'negative' | 'neutral' | 'warning';
        icon?: string;
    };
    subtitle?: string;
}

const trendStyles = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400',
    warning: 'text-red-600 dark:text-red-400',
};

export function MiniStatCard({
    title,
    value,
    icon,
    iconColor,
    iconBgColor,
    trend,
    subtitle,
}: MiniStatCardProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {title}
                </span>
                <span
                    className={`material-icons-outlined ${iconColor} ${iconBgColor} p-1 rounded-md text-lg`}
                >
                    {icon}
                </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            {trend && (
                <div className={`text-xs mt-1 flex items-center gap-1 ${trendStyles[trend.type]}`}>
                    {trend.icon && (
                        <span className="material-icons-outlined text-[14px]">{trend.icon}</span>
                    )}
                    {trend.value}
                </div>
            )}
            {subtitle && !trend && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>
            )}
        </div>
    );
}
