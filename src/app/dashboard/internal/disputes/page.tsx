'use client';

import { useState, useEffect, useCallback } from 'react';

interface Dispute {
    id: string;
    disputeNumber: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    amount: string | null;
    description?: string;
    createdAt: string;
    vendor: {
        businessName: string;
    };
    order?: {
        orderNumber: string;
    };
}

interface Vendor {
    id: string;
    businessName: string;
}

export default function DisputesPage() {
    const [showRaiseDisputeModal, setShowRaiseDisputeModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        vendorId: '',
        subject: '',
        orderId: '',
        category: '',
        amount: '',
        priority: 'medium',
        description: '',
    });

    const fetchDisputes = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const res = await fetch(`/api/disputes?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setDisputes(data.disputes || []);
            }
        } catch (err) {
            console.error('Failed to fetch disputes:', err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/vendors?limit=100');
            if (res.ok) {
                const data = await res.json();
                setVendors(data.vendors || []);
            }
        } catch (err) {
            console.error('Failed to fetch vendors:', err);
        }
    };

    useEffect(() => {
        fetchDisputes();
        fetchVendors();
    }, [fetchDisputes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: formData.amount ? parseFloat(formData.amount) : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create dispute');
                return;
            }

            setShowRaiseDisputeModal(false);
            setFormData({ vendorId: '', subject: '', orderId: '', category: '', amount: '', priority: 'medium', description: '' });
            fetchDisputes();
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount: string | number | null) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'RESOLVED': case 'CLOSED': return 'bg-green-100 text-green-700';
            case 'OPEN': return 'bg-red-100 text-red-700';
            case 'UNDER_REVIEW': return 'bg-amber-100 text-amber-700';
            case 'ESCALATED': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': case 'HIGH': return 'bg-red-100 text-red-700';
            case 'MEDIUM': return 'bg-amber-100 text-amber-700';
            case 'LOW': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getCategoryStyle = (category: string) => {
        switch (category) {
            case 'QUALITY_ISSUE': return 'bg-orange-100 text-orange-700';
            case 'DELAYED_DELIVERY': return 'bg-amber-100 text-amber-700';
            case 'PAYMENT_DISPUTE': return 'bg-red-100 text-red-700';
            case 'CONTRACT_BREACH': return 'bg-purple-100 text-purple-700';
            case 'PRICING_MISMATCH': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Disputes Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Raise and track vendor disputes</p>
                </div>
                <button
                    onClick={() => setShowRaiseDisputeModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                    <span className="material-icons-round text-xl">add</span>
                    Raise Dispute
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Status:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Disputes</option>
                        <option value="open">Open</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Disputes Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Dispute ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading disputes...</td>
                                </tr>
                            ) : disputes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No disputes found.</td>
                                </tr>
                            ) : (
                                disputes.map((dispute) => (
                                    <tr key={dispute.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{dispute.disputeNumber}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{dispute.vendor.businessName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{dispute.subject}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(dispute.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(dispute.priority)}`}>
                                                {dispute.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(dispute.status)}`}>
                                                {dispute.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => { setSelectedDispute(dispute); setShowDetailsModal(true); }}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                                            >
                                                <span className="material-icons-round text-lg">visibility</span>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Raise Dispute Modal */}
            {showRaiseDisputeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Raise New Dispute</h2>
                            <button onClick={() => setShowRaiseDisputeModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Vendor *</label>
                                <select
                                    value={formData.vendorId}
                                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Choose a vendor</option>
                                    {vendors.map((vendor) => (
                                        <option key={vendor.id} value={vendor.id}>{vendor.businessName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brief title for the dispute"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order ID</label>
                                <input
                                    type="text"
                                    value={formData.orderId}
                                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="PO-2024-XXXX (optional)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select reason</option>
                                    <option value="late_delivery">Late Delivery</option>
                                    <option value="quality_issue">Quality Issue</option>
                                    <option value="incorrect_billing">Incorrect Billing</option>
                                    <option value="incomplete_delivery">Incomplete Delivery</option>
                                    <option value="damaged_goods">Damaged Goods</option>
                                    <option value="payment">Payment Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dispute Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority *</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Provide detailed information..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRaiseDisputeModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Raising...' : 'Raise Dispute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Dispute Details Modal */}
            {showDetailsModal && selectedDispute && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dispute Details</h2>
                            <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Dispute Number</label>
                                    <p className="font-semibold text-red-600">{selectedDispute.disputeNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Status</label>
                                    <p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedDispute.status)}`}>{selectedDispute.status.replace('_', ' ')}</span></p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Vendor</label>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedDispute.vendor.businessName}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Category</label>
                                    <p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(selectedDispute.category)}`}>{selectedDispute.category.replace('_', ' ')}</span></p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Priority</label>
                                    <p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(selectedDispute.priority)}`}>{selectedDispute.priority}</span></p>
                                </div>
                                {selectedDispute.amount && (
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-medium">Amount</label>
                                        <p className="font-bold text-slate-900 dark:text-white">₹{parseFloat(selectedDispute.amount).toLocaleString()}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Created</label>
                                    <p className="text-slate-600 dark:text-slate-300">{new Date(selectedDispute.createdAt).toLocaleDateString()}</p>
                                </div>
                                {selectedDispute.order && (
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-medium">Related Order</label>
                                        <p className="text-blue-600 font-medium">{selectedDispute.order.orderNumber}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">Subject</label>
                                <p className="text-slate-900 dark:text-white font-medium">{selectedDispute.subject}</p>
                            </div>
                            {selectedDispute.description && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <label className="text-xs text-slate-500 uppercase font-medium">Description</label>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedDispute.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
