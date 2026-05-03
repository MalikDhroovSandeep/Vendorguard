'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskScoreBar } from '@/components/ui/RiskScoreBar';

type VendorStatus = 'approved' | 'pending' | 'rejected' | 'suspended' | 'inactive';

export interface Vendor {
    id: string;
    vendorId: string;
    name: string;
    initials: string;
    initialsColor: string;
    email: string;
    phone: string;
    status: VendorStatus;
    riskScore: number;
    isHighRisk?: boolean;
}

interface VendorManagementTableProps {
    vendors: Vendor[];
    onSelectAll?: (selected: boolean) => void;
    onSelectVendor?: (vendorId: string, selected: boolean) => void;
    onVendorAction?: (vendorId: string, action: string) => void;
}

const initialsColors: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    red: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
    teal: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
    green: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
};

export function VendorManagementTable({
    vendors,
    onSelectAll,
    onSelectVendor,
    onVendorAction,
}: VendorManagementTableProps) {
    return (
        <div className="bg-white dark:bg-slate-800 border-x border-b border-slate-100 dark:border-slate-700 rounded-b-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                            <input
                                type="checkbox"
                                onChange={(e) => onSelectAll?.(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Vendor Name
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Contact
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            AI Risk Score
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {vendors.map((vendor) => (
                        <tr
                            key={vendor.id}
                            className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${vendor.isHighRisk ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                                }`}
                        >
                            <td className="px-6 py-4">
                                <input
                                    type="checkbox"
                                    onChange={(e) => onSelectVendor?.(vendor.id, e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div
                                        className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs mr-3 ${initialsColors[vendor.initialsColor] || initialsColors.blue
                                            }`}
                                    >
                                        {vendor.initials}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {vendor.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: {vendor.vendorId}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">{vendor.email}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{vendor.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={vendor.status} />
                            </td>
                            <td className="px-6 py-4">
                                <RiskScoreBar score={vendor.riskScore} />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onVendorAction?.(vendor.id, 'menu')}
                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <span className="material-icons-outlined text-xl">more_vert</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
