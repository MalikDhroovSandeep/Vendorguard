interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    iconBgColor: string;
    iconColor: string;
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
        label: string;
    };
    badge?: {
        text: string;
        color: string;
    };
}

export function StatCard({
    title,
    value,
    icon,
    iconBgColor,
    iconColor,
    trend,
    badge,
}: StatCardProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
                </div>
                <div className={`p-2 ${iconBgColor} rounded-lg`}>
                    <span className={`material-icons-round ${iconColor}`}>{icon}</span>
                </div>
            </div>
            <div className="flex items-center text-sm">
                {trend && (
                    <>
                        <span
                            className={`font-medium flex items-center gap-1 ${trend.direction === 'up'
                                    ? 'text-green-500'
                                    : trend.direction === 'down'
                                        ? 'text-red-500'
                                        : 'text-slate-500'
                                }`}
                        >
                            <span className="material-icons-round text-sm">
                                {trend.direction === 'up'
                                    ? 'trending_up'
                                    : trend.direction === 'down'
                                        ? 'arrow_downward'
                                        : 'remove'}
                            </span>
                            {trend.value}
                        </span>
                        <span className="text-slate-400 ml-2">{trend.label}</span>
                    </>
                )}
                {badge && (
                    <span
                        className={`font-medium ${badge.color} px-2 py-0.5 rounded text-xs`}
                    >
                        {badge.text}
                    </span>
                )}
            </div>
        </div>
    );
}
