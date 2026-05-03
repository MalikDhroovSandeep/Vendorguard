export function RiskDistributionChart() {
    const riskData = [
        { label: 'Low Risk', percentage: 45, color: 'bg-green-500' },
        { label: 'Medium Risk', percentage: 35, color: 'bg-yellow-500' },
        { label: 'High Risk', percentage: 20, color: 'bg-red-500' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-800 dark:text-white">Vendor Risk Distribution</h4>
                <button className="text-slate-400 hover:text-blue-500">
                    <span className="material-icons-round text-sm">more_horiz</span>
                </button>
            </div>

            <div className="flex flex-col items-center justify-center">
                {/* Donut Chart */}
                <div className="relative w-48 h-48 mb-6">
                    <div
                        className="w-full h-full rounded-full flex items-center justify-center"
                        style={{
                            background: `conic-gradient(
                                #ef4444 0% 20%,
                                #eab308 20% 55%,
                                #22c55e 55% 100%
                            )`,
                        }}
                    >
                        <div className="w-36 h-36 bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center z-10">
                            <span className="text-3xl font-bold text-slate-800 dark:text-white">100%</span>
                            <span className="text-xs text-slate-500 uppercase font-semibold">Risk Scanned</span>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-3">
                    {riskData.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-white">
                                {item.percentage}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
