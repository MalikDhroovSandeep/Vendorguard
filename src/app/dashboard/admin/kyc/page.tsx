'use client';

import { useState, useEffect } from 'react';
import { RiskScoreBar } from '@/components/ui/RiskScoreBar';
import { Pagination } from '@/components/ui/Pagination';

interface KYCStats {
    totalPending: number;
    highRisk: number;
    approvedToday: number;
}

interface KYCVendor {
    id: string; // Database ID
    name: string;
    submitted: string;
    kycStatus: string;
    riskScore: number;
    riskCategory: string | null;
    documents: { label: string; status: string }[];
    contact?: {
        email: string;
        phone: string;
    };
    isExpanded?: boolean;
}

export default function KYCApprovalsPage() {
    const [vendors, setVendors] = useState<KYCVendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchKYCList = async () => {
        try {
            const res = await fetch('/api/admin/kyc');
            if (res.ok) {
                const data = await res.json();
                setVendors(data.kycList || []);
            }
        } catch (error) {
            console.error('Failed to fetch KYC list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKYCList();
    }, []);

    const handleExpand = (id: string) => {
        setVendors(prev => prev.map(v => ({
            ...v,
            isExpanded: v.id === id ? !v.isExpanded : false
        })));
    };

    const handleAction = async (vendorId: string, action: 'APPROVE' | 'REJECT') => {
        setActionLoading(vendorId);
        try {
            const res = await fetch('/api/admin/kyc', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId,
                    action,
                    rejectionReason: action === 'REJECT' ? rejectionReason : undefined
                })
            });

            if (res.ok) {
                // Remove from list or update local state
                setVendors(prev => prev.filter(v => v.id !== vendorId));
                setRejectionReason('');
                // Optionally show success message
            } else {
                const data = await res.json();
                alert(data.error || 'Action failed');
            }
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading pending KYC requests...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KYC Verification</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and approve vendor KYC submissions</p>
            </div>

            {/* Stat Cards - Todo: Fetch real aggregated stats for these cards */}
            {/* Keeping the layout but static for now for simplicity, data comes from main stats API */}

            {/* KYC Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Vendor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Documents
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    AI Risk Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No pending KYC verifications found.
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr
                                        key={vendor.id}
                                        className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${vendor.riskCategory === 'HIGH' ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                                            } ${vendor.isExpanded ? 'bg-gray-50 dark:bg-slate-700 border-l-4 border-blue-600' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className={`h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold`}>
                                                        {vendor.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{vendor.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {vendor.id.substring(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{new Date(vendor.submitted).toLocaleDateString()}</div>
                                        </td>
                                        {vendor.isExpanded ? (
                                            <td className="px-6 py-4 whitespace-nowrap" colSpan={3}>
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex-1 mr-4">
                                                        <input
                                                            type="text"
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            placeholder="Enter remarks for rejection (required if rejecting)..."
                                                            className="w-full text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleAction(vendor.id, 'APPROVE')}
                                                            disabled={actionLoading === vendor.id}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading === vendor.id ? 'Processing...' : 'Approve'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(vendor.id, 'REJECT')}
                                                            disabled={actionLoading === vendor.id || !rejectionReason.trim()}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleExpand(vendor.id)}
                                                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        {vendor.documents.map((doc, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'missing'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                    }`}
                                                            >
                                                                {doc.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <RiskScoreBar score={vendor.riskScore} showLabel={true} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleExpand(vendor.id)}
                                                            className="text-blue-600 hover:text-blue-700 font-medium underline"
                                                        >
                                                            Review & Action
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {/* <div className="bg-white dark:bg-slate-800 px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <Pagination
                        currentPage={1}
                        totalPages={1}
                        totalItems={vendors.length}
                        itemsPerPage={10}
                        onPageChange={() => { }}
                    />
                </div> */}
            </div>
        </div>
    );
}
