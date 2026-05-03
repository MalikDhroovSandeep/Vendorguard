interface Vendor {
    id: string;
    businessName: string;
    industryCategory: string;
    riskScore: string | number | null; // API might return Decimal string or number
    riskCategory: string | null;
    status: string;
}

function getRiskBadgeStyles(level: string | null) {
    switch (level) {
        case 'LOW':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'MEDIUM':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'HIGH':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default:
            return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'ACTIVE': return 'bg-green-500';
        case 'INACTIVE': return 'bg-slate-500';
        case 'BLACKLISTED': return 'bg-red-500';
        default: return 'bg-yellow-500';
    }
}

interface VendorTableProps {
    vendors?: Vendor[];
}

export function VendorTable({ vendors = [] }: VendorTableProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 dark:text-white">Recent Vendor Onboarding</h4>
                <button className="text-sm text-blue-500 font-medium hover:text-blue-700">
                    View All
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Vendor Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Risk Score</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {vendors.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No recent vendors found.
                                </td>
                            </tr>
                        ) : (
                            vendors.map((vendor) => (
                                <tr
                                    key={vendor.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                                        {vendor.businessName}
                                    </td>
                                    <td className="px-6 py-4">{vendor.industryCategory}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeStyles(
                                                vendor.riskCategory
                                            )}`}
                                        >
                                            {vendor.riskScore || 'N/A'}/100 ({vendor.riskCategory || 'N/A'})
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(vendor.status)}`}></div>
                                            <span>{vendor.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-blue-500">
                                            <span className="material-icons-round">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
