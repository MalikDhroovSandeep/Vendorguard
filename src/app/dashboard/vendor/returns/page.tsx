'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/Pagination';

interface Return {
    id: string;
    returnNumber: string;
    reason: string;
    status: string;
    description: string | null;
    totalQuantity: number;
    totalAmount: string;
    vendorResponse: string | null;
    vendorRespondedAt: string | null;
    createdAt: string;
    order: {
        id: string;
        orderNumber: string;
        title: string;
    };
    items: Array<{
        id: string;
        itemName: string;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
        reason: string;
        description: string | null;
    }>;
    creditNote: {
        id: string;
        creditNumber: string;
        amount: string;
        issuedAt: string;
    } | null;
}

interface Toast {
    message: string;
    type: 'success' | 'error';
}

export default function VendorReturnsPage() {
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showRespondModal, setShowRespondModal] = useState(false);
    const [response, setResponse] = useState('');
    const [accept, setAccept] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [toast, setToast] = useState<Toast | null>(null);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);
            params.append('page', page.toString());
            params.append('limit', '10');

            const res = await fetch(`/api/vendor/returns?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setReturns(data.returns || []);
                setPagination(data.pagination || { total: 0, totalPages: 1 });
            }
        } catch (error) {
            console.error('Failed to fetch returns:', error);
            setToast({ message: 'Failed to load returns', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [filterStatus, page]);

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'VENDOR_REVIEW': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            case 'IN_TRANSIT': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'RECEIVED': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            case 'CREDIT_ISSUED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            'DEFECTIVE': 'Defective',
            'DAMAGED_IN_TRANSIT': 'Damaged in Transit',
            'WRONG_ITEM': 'Wrong Item',
            'QUALITY_ISSUE': 'Quality Issue',
            'QUANTITY_MISMATCH': 'Quantity Mismatch',
            'EXPIRED': 'Expired',
            'NOT_AS_DESCRIBED': 'Not as Described',
            'OTHER': 'Other'
        };
        return labels[reason] || reason;
    };

    const handleRespond = async () => {
        if (!selectedReturn || !response.trim()) {
            setToast({ message: 'Please provide a response', type: 'error' });
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/vendor/returns/${selectedReturn.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response, accept })
            });
            if (res.ok) {
                setToast({ message: 'Response submitted successfully', type: 'success' });
                setShowRespondModal(false);
                setShowModal(false);
                setResponse('');
                setAccept(false);
                fetchReturns();
            } else {
                const data = await res.json();
                setToast({ message: data.error || 'Failed to submit response', type: 'error' });
            }
        } catch {
            setToast({ message: 'Failed to submit response', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-xl">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            <nav className="flex text-sm text-slate-500">
                <a href="/dashboard/vendor" className="hover:text-blue-600 transition-colors">Dashboard</a>
                <span className="mx-2">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Returns</span>
            </nav>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Returns & Claims</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                        View and respond to return requests from buyers.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-500">Pending Response</div>
                    <div className="text-2xl font-bold text-amber-600">{returns.filter(r => r.status === 'PENDING' && !r.vendorResponse).length}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-500">Under Review</div>
                    <div className="text-2xl font-bold text-blue-600">{returns.filter(r => r.status === 'VENDOR_REVIEW').length}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-500">Approved</div>
                    <div className="text-2xl font-bold text-green-600">{returns.filter(r => r.status === 'APPROVED' || r.status === 'CREDIT_ISSUED').length}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-500">Total Credits</div>
                    <div className="text-2xl font-bold text-emerald-600">{returns.filter(r => r.creditNote).length}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex flex-1 gap-3 flex-wrap">
                        <div className="relative min-w-[160px]">
                            <select
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                                className="appearance-none w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="VENDOR_REVIEW">Vendor Review</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="CREDIT_ISSUED">Credit Issued</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <span className="material-icons-outlined text-slate-400 text-lg">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Return #</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Responded</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading returns...</td>
                                </tr>
                            ) : returns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No returns found.</td>
                                </tr>
                            ) : (
                                returns.map((ret) => (
                                    <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-semibold text-blue-600">{ret.returnNumber}</div>
                                            <div className="text-xs text-slate-500">{new Date(ret.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-slate-600 dark:text-slate-300">{ret.order.orderNumber}</div>
                                            <div className="text-xs text-slate-500">{ret.order.title}</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                                            {getReasonLabel(ret.reason)}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">
                                            {formatCurrency(ret.totalAmount)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyle(ret.status)}`}>
                                                {ret.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {ret.vendorResponse ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                                    <span className="material-icons-outlined text-base">check_circle</span>
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                                                    <span className="material-icons-outlined text-base">pending</span>
                                                    No
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right flex gap-1 justify-end">
                                            <button
                                                onClick={() => { setSelectedReturn(ret); setShowModal(true); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <span className="material-icons-outlined text-xl">visibility</span>
                                            </button>
                                            {!ret.vendorResponse && ret.status === 'PENDING' && (
                                                <button
                                                    onClick={() => { setSelectedReturn(ret); setShowRespondModal(true); }}
                                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                                                    title="Respond"
                                                >
                                                    <span className="material-icons-outlined text-xl">reply</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <Pagination
                        currentPage={page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={10}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                </div>
            </div>

            {/* Return Details Modal */}
            {showModal && selectedReturn && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
                            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
                        </div>
                        <div className="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="px-6 pt-5 pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Return Details</h3>
                                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-500">
                                        <span className="material-icons-outlined">close</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase">Return Number</label>
                                            <p className="font-semibold text-blue-600">{selectedReturn.returnNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase">Status</label>
                                            <p><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyle(selectedReturn.status)}`}>{selectedReturn.status.replace('_', ' ')}</span></p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase">Order</label>
                                            <p className="text-slate-600 dark:text-slate-300">{selectedReturn.order.orderNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase">Total Amount</label>
                                            <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedReturn.totalAmount)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-slate-500 uppercase">Reason</label>
                                            <p className="text-slate-600 dark:text-slate-300">{getReasonLabel(selectedReturn.reason)}</p>
                                        </div>
                                        {selectedReturn.description && (
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase">Description</label>
                                                <p className="text-slate-600 dark:text-slate-300">{selectedReturn.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedReturn.vendorResponse && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                            <label className="text-xs text-blue-600 uppercase font-medium">Your Response</label>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedReturn.vendorResponse}</p>
                                        </div>
                                    )}

                                    {selectedReturn.creditNote && (
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                            <label className="text-xs text-green-600 uppercase font-medium">Credit Note Issued</label>
                                            <p className="text-sm font-semibold text-green-700 dark:text-green-300 mt-1">
                                                {selectedReturn.creditNote.creditNumber} - {formatCurrency(selectedReturn.creditNote.amount)}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">
                                                Issued on {new Date(selectedReturn.creditNote.issuedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {/* Return Items */}
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase mb-2 block">Items</label>
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 dark:bg-slate-900">
                                                    <tr>
                                                        <th className="py-2 px-3 text-left text-xs font-medium text-slate-500">Item</th>
                                                        <th className="py-2 px-3 text-center text-xs font-medium text-slate-500">Qty</th>
                                                        <th className="py-2 px-3 text-right text-xs font-medium text-slate-500">Price</th>
                                                        <th className="py-2 px-3 text-right text-xs font-medium text-slate-500">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                    {selectedReturn.items.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="py-2 px-3 text-slate-900 dark:text-white">{item.itemName}</td>
                                                            <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-300">{item.quantity}</td>
                                                            <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(item.unitPrice)}</td>
                                                            <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(item.totalPrice)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Close
                                </button>
                                {!selectedReturn.vendorResponse && selectedReturn.status === 'PENDING' && (
                                    <button
                                        onClick={() => { setShowModal(false); setShowRespondModal(true); }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Respond
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Respond Modal */}
            {showRespondModal && selectedReturn && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowRespondModal(false)}>
                            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
                        </div>
                        <div className="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="px-6 pt-5 pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Respond to Return</h3>
                                    <button onClick={() => setShowRespondModal(false)} className="text-slate-400 hover:text-slate-500">
                                        <span className="material-icons-outlined">close</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <p className="text-sm"><strong>Return:</strong> {selectedReturn.returnNumber}</p>
                                        <p className="text-sm"><strong>Amount:</strong> {formatCurrency(selectedReturn.totalAmount)}</p>
                                        <p className="text-sm"><strong>Reason:</strong> {getReasonLabel(selectedReturn.reason)}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Your Response <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            rows={4}
                                            placeholder="Provide your response or explanation..."
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                        <input
                                            type="checkbox"
                                            id="accept"
                                            checked={accept}
                                            onChange={(e) => setAccept(e.target.checked)}
                                            className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                        />
                                        <label htmlFor="accept" className="text-sm text-slate-700 dark:text-slate-300">
                                            I accept this return request
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowRespondModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRespond}
                                    disabled={actionLoading || !response.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'Submitting...' : 'Submit Response'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
