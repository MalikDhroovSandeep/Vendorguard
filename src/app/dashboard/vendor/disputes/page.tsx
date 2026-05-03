'use client';

import { useState, useEffect, useCallback } from 'react';

interface Dispute {
    id: string;
    disputeNumber: string;
    subject: string;
    description: string | null;
    category: string;
    priority: string;
    status: string;
    amount: number | null;
    orderNumber: string | null;
    raisedBy: string | null;
    vendorResponse: string | null;
    vendorRespondedAt: string | null;
    createdAt: string;
    resolvedAt: string | null;
}

interface Toast {
    message: string;
    type: 'success' | 'error';
}

export default function VendorDisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [response, setResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const fetchDisputes = useCallback(async () => {
        try {
            const res = await fetch('/api/vendor/disputes');
            if (res.ok) {
                const data = await res.json();
                setDisputes(data.disputes || []);
            }
        } catch (err) {
            console.error('Failed to fetch disputes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

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

    const handleOpenModal = (dispute: Dispute) => {
        setSelectedDispute(dispute);
        setResponse('');
        setShowModal(true);
    };

    const handleSubmitResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDispute || !response.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/vendor/disputes/${selectedDispute.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: response.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setToast({ message: data.error || 'Failed to submit response', type: 'error' });
                return;
            }

            setToast({ message: 'Response submitted successfully!', type: 'success' });
            setShowModal(false);
            setSelectedDispute(null);
            setResponse('');
            fetchDisputes();
        } catch (err) {
            setToast({ message: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            OPEN: 'bg-red-100 text-red-700',
            UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
            ESCALATED: 'bg-orange-100 text-orange-700',
            RESOLVED: 'bg-green-100 text-green-700',
            CLOSED: 'bg-slate-100 text-slate-700',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            LOW: 'text-slate-500',
            MEDIUM: 'text-yellow-600',
            HIGH: 'text-orange-600',
            CRITICAL: 'text-red-600',
        };
        return colors[priority] || 'text-slate-500';
    };

    const canRespond = (dispute: Dispute) => {
        return dispute.status === 'OPEN' && !dispute.vendorResponse;
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

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Disputes</h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading disputes...</div>
                ) : disputes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <span className="material-icons-round text-4xl mb-2 text-slate-300">gavel</span>
                        <p>No active disputes. Keep up the good work!</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4">Dispute #</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {disputes.map((dispute) => (
                                <tr key={dispute.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{dispute.disputeNumber}</td>
                                    <td className="p-4 text-slate-800 dark:text-slate-200">
                                        <div>
                                            <p className="font-medium">{dispute.subject}</p>
                                            {dispute.orderNumber && (
                                                <p className="text-xs text-slate-500">Order: {dispute.orderNumber}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">{dispute.category}</td>
                                    <td className={`p-4 font-medium ${getPriorityColor(dispute.priority)}`}>
                                        {dispute.priority}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(dispute.status)}`}>
                                            {dispute.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">
                                        {new Date(dispute.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {canRespond(dispute) ? (
                                            <button
                                                onClick={() => handleOpenModal(dispute)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                            >
                                                <span className="material-icons-round text-base">reply</span>
                                                Respond
                                            </button>
                                        ) : dispute.vendorResponse ? (
                                            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                                <span className="material-icons-round text-base">check</span>
                                                Responded
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Response Modal */}
            {showModal && selectedDispute && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Respond to Dispute
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Dispute Details */}
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Dispute #</span>
                                    <span className="text-sm font-medium text-blue-600">{selectedDispute.disputeNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Subject</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedDispute.subject}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Category</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{selectedDispute.category}</span>
                                </div>
                                {selectedDispute.description && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                                        <p className="text-sm text-slate-500 mb-1">Description</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{selectedDispute.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Response Form */}
                            <form onSubmit={handleSubmitResponse}>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Your Response *
                                </label>
                                <textarea
                                    rows={4}
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="Provide your explanation or clarification regarding this dispute..."
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Note: You can only respond once to each dispute.
                                </p>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !response.trim()}
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Response'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
