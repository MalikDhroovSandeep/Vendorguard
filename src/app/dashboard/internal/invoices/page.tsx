'use client';

import { useState, useEffect, useCallback } from 'react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: string;
    taxAmount: string;
    totalAmount: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
    vendor: {
        businessName: string;
    };
    order?: {
        orderNumber: string;
    };
}

export default function InvoicesPage() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        paid: 0,
    });

    const fetchInvoices = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const res = await fetch(`/api/invoices?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setInvoices(data.invoices || []);

                // Calculate stats
                const all = data.invoices || [];
                setStats({
                    total: all.length,
                    pending: all.filter((i: Invoice) => i.status === 'PENDING').length,
                    approved: all.filter((i: Invoice) => i.status === 'APPROVED').length,
                    paid: all.filter((i: Invoice) => i.status === 'PAID').length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleUpdateStatus = async (id: string, status: string) => {
        if (!confirm(`Are you sure you want to mark this invoice as ${status}?`)) return;

        setActionLoading(id);
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                fetchInvoices(); // Refresh list
            } else {
                alert('Failed to update invoice status');
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700';
            case 'APPROVED': return 'bg-blue-100 text-blue-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'OVERDUE': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Track and manage vendor invoices</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Invoices</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="material-icons-round text-blue-600">receipt</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <span className="material-icons-round text-amber-600">pending</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.approved}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="material-icons-round text-blue-600">check_circle</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Paid</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="material-icons-round text-green-600">payments</span>
                        </div>
                    </div>
                </div>
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
                        <option value="all">All Invoices</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading invoices...</td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No invoices found.</td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{invoice.vendor.businessName}</td>
                                        <td className="px-6 py-4 text-sm text-blue-600">{invoice.order?.orderNumber || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(invoice.totalAmount)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {invoice.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(invoice.id, 'APPROVED')}
                                                            title="Approve Invoice"
                                                            disabled={actionLoading === invoice.id}
                                                            className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                                                        >
                                                            <span className="material-icons-round text-lg">check</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(invoice.id, 'REJECTED')}
                                                            title="Reject Invoice"
                                                            disabled={actionLoading === invoice.id}
                                                            className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                                        >
                                                            <span className="material-icons-round text-lg">close</span>
                                                        </button>
                                                    </>
                                                )}
                                                {invoice.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(invoice.id, 'PAID')}
                                                        title="Mark as Paid"
                                                        disabled={actionLoading === invoice.id}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 disabled:opacity-50"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedInvoice(invoice); setShowDetailsModal(true); }}
                                                    className="p-1 text-slate-400 hover:text-blue-600"
                                                    title="View Details"
                                                >
                                                    <span className="material-icons-round text-lg">visibility</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Details Modal */}
            {showDetailsModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invoice Details</h2>
                            <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Invoice Number</label>
                                    <p className="font-semibold text-blue-600">{selectedInvoice.invoiceNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Status</label>
                                    <p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedInvoice.status)}`}>{selectedInvoice.status}</span></p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Vendor</label>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedInvoice.vendor.businessName}</p>
                                </div>
                                {selectedInvoice.order && (
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-medium">Related Order</label>
                                        <p className="text-blue-600 font-medium">{selectedInvoice.order.orderNumber}</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Amount Breakdown</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                        <span className="text-slate-900 dark:text-white">{formatCurrency(selectedInvoice.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Tax</span>
                                        <span className="text-slate-900 dark:text-white">{formatCurrency(selectedInvoice.taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-300 dark:border-slate-700 pt-2">
                                        <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                                        <span className="font-bold text-lg text-green-600">{formatCurrency(selectedInvoice.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Created</label>
                                    <p className="text-slate-600 dark:text-slate-300">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Due Date</label>
                                    <p className="text-slate-600 dark:text-slate-300">{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'Not set'}</p>
                                </div>
                            </div>
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
