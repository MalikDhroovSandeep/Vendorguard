'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pagination } from '@/components/ui/Pagination';

interface Dispute {
    id: string;
    disputeNumber: string;
    vendor: {
        businessName: string;
        industryCategory: string;
        riskCategory: string | null;
        riskScore: number | null;
    };
    order: {
        orderNumber: string;
    } | null;
    subject: string;
    description?: string;
    category: string;
    priority: string;
    status: string;
    vendorResponse?: string | null;
    vendorRespondedAt?: string | null;
    resolution?: string | null;
    resolvedAt?: string | null;
    createdAt: string;
}

interface DisputeStats {
    total: number;
    open: number;
    resolved: number;
    highPriority: number;
}

interface DisputeDetails extends Dispute {
    amount?: number | null;
    raisedBy?: {
        name: string;
        email: string;
    };
    resolvedBy?: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error';
}

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [stats, setStats] = useState<DisputeStats>({ total: 0, open: 0, resolved: 0, highPriority: 0 });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<DisputeDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [resolveStatus, setResolveStatus] = useState('');
    const [resolution, setResolution] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const fetchDisputes = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const res = await fetch(`/api/disputes?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setDisputes(data.disputes || []);
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleViewDetails = async (disputeId: string) => {
        setLoadingDetails(true);
        setShowModal(true);
        try {
            const res = await fetch(`/api/disputes/${disputeId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedDispute(data.dispute);
                setResolveStatus(data.dispute.status);
                setResolution(data.dispute.resolution || '');
            } else {
                setToast({ message: 'Failed to load dispute details', type: 'error' });
                setShowModal(false);
            }
        } catch (error) {
            setToast({ message: 'Failed to load dispute details', type: 'error' });
            setShowModal(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleResolve called', { selectedDispute, resolveStatus, resolution });

        if (!selectedDispute) {
            console.log('No selected dispute');
            return;
        }

        // Validate resolution notes for final statuses
        if ((resolveStatus === 'RESOLVED' || resolveStatus === 'CLOSED') && !resolution.trim()) {
            console.log('Validation failed: resolution notes required');
            setToast({ message: 'Resolution notes are required', type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            console.log('Sending request to API...');
            const res = await fetch(`/api/disputes/${selectedDispute.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: resolveStatus,
                    resolution: resolution.trim() || null,
                }),
            });

            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);

            if (!res.ok) {
                setToast({ message: data.error || 'Failed to update dispute', type: 'error' });
                return;
            }

            setToast({ message: data.message || 'Dispute updated successfully!', type: 'success' });
            setShowModal(false);
            setSelectedDispute(null);
            setResolution('');
            fetchDisputes();
        } catch (error) {
            console.error('Error in handleResolve:', error);
            setToast({ message: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const statCards = [
        {
            title: 'Total Disputes',
            value: stats.total.toString(),
            icon: 'folder',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-500',
            subtitle: 'All time',
            subtitleColor: 'text-slate-500',
        },
        {
            title: 'Open Cases',
            value: stats.open.toString(),
            icon: 'pending_actions',
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            iconColor: 'text-orange-500',
            subtitle: 'Requiring action',
        },
        {
            title: 'Resolved',
            value: stats.resolved.toString(),
            icon: 'check_circle',
            iconBg: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-500',
            subtitle: 'Total resolved',
        },
        {
            title: 'High Priority',
            value: stats.highPriority.toString(),
            icon: 'warning',
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-500',
            subtitle: 'Escalated items',
            subtitleColor: 'text-red-500',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
            case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300';
            case 'ESCALATED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getRiskColor = (level: string | null) => {
        switch (level) {
            case 'LOW': return 'bg-green-500';
            case 'MEDIUM': return 'bg-yellow-500';
            case 'HIGH': return 'bg-red-500 animate-pulse';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-xl">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Disputes Management</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track and resolve vendor disputes with AI-powered risk assessment</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</h3>
                            <span className={`material-icons-outlined ${card.iconColor} ${card.iconBg} p-1.5 rounded-lg text-sm`}>{card.icon}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{card.value}</p>
                        <p className={`text-xs mt-1 flex items-center gap-1 ${card.subtitleColor || 'text-slate-500 dark:text-slate-400'}`}>
                            {card.subtitle}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="under_review">Under Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <span className="absolute right-3 top-2.5 pointer-events-none text-slate-500">
                            <span className="material-icons-outlined text-sm">expand_more</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-icons-outlined text-sm">download</span>
                        Export
                    </button>
                </div>
            </div>

            {/* Disputes Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dispute ID</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vendor Name</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Order ID</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reason</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date Created</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Risk Score</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Loading disputes...</td>
                                </tr>
                            ) : disputes.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">No disputes found.</td>
                                </tr>
                            ) : (
                                disputes.map((dispute) => (
                                    <tr key={dispute.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-medium">
                                            <span className="font-mono text-blue-600">{dispute.disputeNumber}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-600">
                                                    {dispute.vendor.businessName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{dispute.vendor.businessName}</p>
                                                    <p className="text-xs text-slate-500">{dispute.vendor.industryCategory || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                            {dispute.order?.orderNumber || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{dispute.subject}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                                            {new Date(dispute.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${getRiskColor(dispute.vendor.riskCategory)}`}></span>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {dispute.vendor.riskCategory || 'N/A'} ({dispute.vendor.riskScore || 0}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                                                {dispute.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleViewDetails(dispute.id)}
                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                                            >
                                                View / Resolve
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <Pagination
                        currentPage={1}
                        totalPages={1}
                        totalItems={disputes.length}
                        itemsPerPage={10}
                        onPageChange={() => { }}
                    />
                </div>
            </div>

            {/* Resolve Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Dispute Details
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setSelectedDispute(null); }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="p-8 text-center text-slate-500">
                                <span className="material-icons-round animate-spin text-3xl">refresh</span>
                                <p className="mt-2">Loading details...</p>
                            </div>
                        ) : selectedDispute && (
                            <div className="p-6 space-y-6">
                                {/* Dispute Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Dispute #</p>
                                        <p className="text-sm font-medium text-blue-600">{selectedDispute.disputeNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedDispute.status)}`}>
                                            {selectedDispute.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Vendor</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedDispute.vendor.businessName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Raised By</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{selectedDispute.raisedBy?.name || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Subject & Description */}
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Subject</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedDispute.subject}</p>
                                    {selectedDispute.description && (
                                        <>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mt-3 mb-1">Description</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{selectedDispute.description}</p>
                                        </>
                                    )}
                                </div>

                                {/* Vendor Response */}
                                {selectedDispute.vendorResponse && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-icons-round text-blue-500 text-lg">reply</span>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-medium">Vendor Response</p>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{selectedDispute.vendorResponse}</p>
                                        {selectedDispute.vendorRespondedAt && (
                                            <p className="text-xs text-slate-500 mt-2">
                                                Responded on {new Date(selectedDispute.vendorRespondedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Resolution Form */}
                                <form onSubmit={handleResolve} className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Update Status</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Status *
                                        </label>
                                        <select
                                            value={resolveStatus}
                                            onChange={(e) => setResolveStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="OPEN">Open</option>
                                            <option value="UNDER_REVIEW">Under Review</option>
                                            <option value="RESOLVED">Resolved</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Resolution Notes {(resolveStatus === 'RESOLVED' || resolveStatus === 'CLOSED') && '*'}
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            placeholder="Add resolution notes or comments..."
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setShowModal(false); setSelectedDispute(null); }}
                                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Updating...' : 'Update Dispute'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
