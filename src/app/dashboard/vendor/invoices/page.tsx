'use client';

import { useState, useEffect } from 'react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    orderNumber: string | null;
    orderTitle: string | null;
    amount: number;
    currency: string;
    status: string;
    dueDate: string | null;
    submittedAt: string | null;
    createdAt: string;
}

interface Order {
    id: string;
    orderNumber: string;
    title: string;
    amount: number;
    currency: string;
    status: string;
}

export default function VendorInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        orderId: '',
        invoiceNumber: '',
        amount: '',
        taxAmount: '',
        dueDate: '',
    });

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/vendor/invoices');
            if (res.ok) {
                const data = await res.json();
                setInvoices(data.invoices || []);
            }
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/vendor/orders');
            if (res.ok) {
                const data = await res.json();
                // Filter only orders that are approved/in-progress/delivered
                const validOrders = data.orders.filter((o: Order) =>
                    ['APPROVED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(o.status)
                );
                setOrders(validOrders || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchInvoices(), fetchOrders()]);
            setLoading(false);
        };
        init();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            APPROVED: 'bg-blue-100 text-blue-700',
            PAID: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
            OVERDUE: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/vendor/invoices/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to submit invoice');
                return;
            }

            // Success
            setIsModalOpen(false);
            setFormData({
                orderId: '',
                invoiceNumber: '',
                amount: '',
                taxAmount: '',
                dueDate: '',
            });
            fetchInvoices(); // Refresh list
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Auto-fill amount when order is selected
    const handleOrderSelect = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        setFormData({
            ...formData,
            orderId,
            amount: order ? order.amount.toString() : '',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                    <span className="material-icons-round">add</span>
                    Submit Invoice
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading invoices...</div>
                ) : invoices.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <span className="material-icons-round text-4xl mb-2 text-slate-300">receipt_long</span>
                        <p>No invoices found. Submit your first invoice!</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4">Invoice #</th>
                                <th className="p-4">Order</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{invoice.invoiceNumber}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">
                                        {invoice.orderNumber || '-'}
                                        <div className="text-xs text-slate-400">{invoice.orderTitle}</div>
                                    </td>
                                    <td className="p-4 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(invoice.amount)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">
                                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4">
                                        <button className="text-sm text-slate-500 hover:text-blue-600 font-medium">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Submit Invoice Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Submit New Invoice</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Select Purchase Order *
                                </label>
                                <select
                                    value={formData.orderId}
                                    onChange={(e) => handleOrderSelect(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">-- Select Order --</option>
                                    {orders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            {order.orderNumber} - {order.title} ({formatCurrency(order.amount)})
                                        </option>
                                    ))}
                                </select>
                                {orders.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">No active orders found to invoice.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Invoice Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="INV-2024-001"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Amount (Base) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Tax Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.taxAmount}
                                        onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Invoice Document (Not Implemented)
                                </label>
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center text-slate-500">
                                    <span className="material-icons-outlined text-2xl mb-1">cloud_upload</span>
                                    <p className="text-sm">Drag & drop or click to upload PDF</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons-round text-sm">send</span>
                                            Submit Invoice
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
