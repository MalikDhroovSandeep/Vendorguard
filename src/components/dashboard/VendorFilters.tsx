'use client';

interface VendorFiltersProps {
    onSearch?: (query: string) => void;
    onStatusChange?: (status: string) => void;
    onRiskLevelChange?: (level: string) => void;
}

export function VendorFilters({
    onSearch,
    onStatusChange,
    onRiskLevelChange,
}: VendorFiltersProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-t-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Status:
                    </label>
                    <select
                        onChange={(e) => onStatusChange?.(e.target.value)}
                        className="bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:outline-none text-gray-700 dark:text-gray-300"
                    >
                        <option value="">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Risk Level:
                    </label>
                    <select
                        onChange={(e) => onRiskLevelChange?.(e.target.value)}
                        className="bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:outline-none text-gray-700 dark:text-gray-300"
                    >
                        <option value="">All Levels</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>

                <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 transition-colors">
                    <span className="material-icons-outlined text-[18px]">filter_list</span>
                    More Filters
                </button>
            </div>
        </div>
    );
}
