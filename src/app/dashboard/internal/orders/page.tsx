'use client';

import { useState, useEffect, useCallback } from 'react';

interface Order {
    id: string;
    orderNumber: string;
    title: string;
    amount: string;
    status: string;
    expectedDelivery: string | null;
    createdAt: string;
    description?: string;
    deliveryStatus?: string;
    vendor: {
        id: string;
        businessName: string;
        riskCategory: string | null;
    };
}

interface Vendor {
    id: string;
    businessName: string;
    riskCategory: string | null;
}

export default function PurchaseOrdersPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        vendorId: '',
        title: '',
        amount: '',
        expectedDelivery: '',
        description: '',
    });

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const res = await fetch(`/api/orders?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    // Fetch vendors for dropdown
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
        fetchOrders();
        fetchVendors();
    }, [fetchOrders]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create order');
                return;
            }

            setShowCreateModal(false);
            setFormData({ vendorId: '', title: '', amount: '', expectedDelivery: '', description: '' });
            fetchOrders();
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;

        setActionLoading(id);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                fetchOrders();
            } else {
                alert('Failed to update order');
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'DELIVERED': return 'bg-cyan-100 text-cyan-700';
            case 'APPROVED': return 'bg-blue-100 text-blue-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getRiskStyle = (risk: string | null) => {
        switch (risk) {
            case 'LOW': return 'bg-green-100 text-green-700';
            case 'MEDIUM': return 'bg-amber-100 text-amber-700';
            case 'HIGH': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Purchase Orders</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and track purchase orders</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchOrders}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        title="Refresh"
                    >
                        <span className="material-icons-round">refresh</span>
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <span className="material-icons-round text-xl">add</span>
                        Create Purchase Order
                    </button>
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
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Risk Level</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No orders found. Create your first order!</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{order.orderNumber}</div>
                                            <div className="text-xs text-slate-500">{order.title}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.vendor.businessName}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(order.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskStyle(order.vendor.riskCategory)}`}>
                                                {order.vendor.riskCategory || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'APPROVED')}
                                                        disabled={actionLoading === order.id}
                                                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {order.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'IN_PROGRESS')}
                                                        disabled={actionLoading === order.id}
                                                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 disabled:opacity-50"
                                                    >
                                                        Start Work
                                                    </button>
                                                )}
                                                {order.status === 'IN_PROGRESS' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                        disabled={actionLoading === order.id}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 disabled:opacity-50"
                                                    >
                                                        Mark Delivered
                                                    </button>
                                                )}
                                                {order.status === 'DELIVERED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                                        disabled={actionLoading === order.id}
                                                        className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-200 disabled:opacity-50"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                                                >
                                                    <span className="material-icons-round text-lg">visibility</span>
                                                    View
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

            {/* Create PO Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Purchase Order</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
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
                                        <option key={vendor.id} value={vendor.id}>
                                            {vendor.businessName} - Risk: {vendor.riskCategory || 'N/A'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Q1 Raw Materials Order"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order Amount *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Delivery</label>
                                <input
                                    type="date"
                                    value={formData.expectedDelivery}
                                    onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe the order items..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Order Details</h2>
                            <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Order Number</label>
                                    <p className="font-semibold text-blue-600">{selectedOrder.orderNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Status</label>
                                    <p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedOrder.status)}`}>{selectedOrder.status.replace('_', ' ')}</span></p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Vendor</label>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.vendor.businessName}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Risk Level</label>
                                    <p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskStyle(selectedOrder.vendor.riskCategory)}`}>{selectedOrder.vendor.riskCategory || 'N/A'}</span></p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Amount</label>
                                    <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedOrder.amount)}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Expected Delivery</label>
                                    <p className="text-slate-600 dark:text-slate-300">{selectedOrder.expectedDelivery ? new Date(selectedOrder.expectedDelivery).toLocaleDateString() : 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-medium">Created</label>
                                    <p className="text-slate-600 dark:text-slate-300">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                </div>
                                {selectedOrder.deliveryStatus && (
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-medium">Delivery Status</label>
                                        <p className="text-slate-600 dark:text-slate-300">{selectedOrder.deliveryStatus}</p>
                                    </div>
                                )}
                            </div>
                            {selectedOrder.description && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <label className="text-xs text-slate-500 uppercase font-medium">Description</label>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedOrder.description}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">Title</label>
                                <p className="text-slate-900 dark:text-white">{selectedOrder.title}</p>
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
