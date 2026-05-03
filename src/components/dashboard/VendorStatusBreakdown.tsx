interface BreakdownProps {
    breakdown?: {
        active: number;
        inactive: number;
        blacklisted: number;
        pendingApproval: number;
        onboardingIncomplete: number;
    };
    totalVendors?: number;
}

export function VendorStatusBreakdown({ breakdown, totalVendors = 1 }: BreakdownProps) {
    const total = totalVendors || 1; // Prevent division by zero

    const statusData = breakdown ? [
        {
            label: 'Active Vendors',
            count: breakdown.active,
            percentage: Math.round((breakdown.active / total) * 100),
            color: 'bg-blue-500'
        },
        {
            label: 'Pending Approval',
            count: breakdown.pendingApproval,
            percentage: Math.round((breakdown.pendingApproval / total) * 100),
            color: 'bg-yellow-400'
        },
        {
            label: 'Onboarding Incomplete',
            count: breakdown.onboardingIncomplete,
            percentage: Math.round((breakdown.onboardingIncomplete / total) * 100),
            color: 'bg-orange-400'
        },
        {
            label: 'Blacklisted / Inactive',
            count: breakdown.blacklisted + breakdown.inactive,
            percentage: Math.round(((breakdown.blacklisted + breakdown.inactive) / total) * 100),
            color: 'bg-slate-400'
        },
    ] : [];

    if (!breakdown) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-800 dark:text-white">Vendor Status Breakdown</h4>
                <button className="text-xs font-medium text-blue-500 hover:underline">
                    View Report
                </button>
            </div>

            <div className="space-y-6">
                {statusData.map((item) => (
                    <div key={item.label}>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                {item.label}
                            </span>
                            <span className="text-slate-500">
                                {item.count} ({item.percentage}%)
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div
                                className={`${item.color} h-3 rounded-full transition-all duration-500`}
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Anomaly Alert */}
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg flex items-start gap-3">
                <span className="material-icons-round text-red-500 mt-0.5">notification_important</span>
                <div className="flex-1">
                    <h5 className="text-sm font-bold text-red-800 dark:text-red-300">Anomaly Detected</h5>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        AI detected unusual procurement activity from &quot;TechGlobal Inc.&quot; in the last 24 hours. Review recommended.
                    </p>
                </div>
                <button className="text-xs bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors whitespace-nowrap">
                    Review
                </button>
            </div>
        </div>
    );
}
