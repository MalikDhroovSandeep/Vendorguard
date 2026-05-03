'use client';

import { useState, useEffect } from 'react';

interface Order {
    id: string;
    orderNumber: string;
    title: string;
    amount: number;
    currency: string;
    status: string;
    expectedDelivery: string | null;
    createdAt: string;
}

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/vendor/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
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
            DRAFT: 'bg-slate-100 text-slate-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            APPROVED: 'bg-blue-100 text-blue-700',
            IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
            DELIVERED: 'bg-green-100 text-green-700',
            COMPLETED: 'bg-green-100 text-green-700',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const handleUpdateStatus = async (orderId: string, status: string, date?: string) => {
        setUpdating(orderId);
        try {
            const res = await fetch(`/api/vendor/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, deliveryDate: date }),
            });

            if (res.ok) {
                fetchOrders(); // Refresh list
                setDeliveryModalOpen(false);
            } else {
                alert('Failed to update order status');
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setUpdating(null);
        }
    };

    const openDeliveryModal = (orderId: string) => {
        setSelectedOrder(orderId);
        setDeliveryDate(new Date().toISOString().split('T')[0]);
        setDeliveryModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Purchase Orders</h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <span className="material-icons-round text-4xl mb-2 text-slate-300">shopping_cart</span>
                        <p>No purchase orders found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Title</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Exp. Delivery</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{order.orderNumber}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">{order.title}</td>
                                    <td className="p-4 font-mono text-slate-800 dark:text-slate-200">{formatCurrency(order.amount)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">
                                        {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {order.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'IN_PROGRESS')}
                                                    disabled={updating === order.id}
                                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-200 disabled:opacity-50"
                                                >
                                                    {updating === order.id ? '...' : 'Acknowledge'}
                                                </button>
                                            )}
                                            {order.status === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={() => openDeliveryModal(order.id)}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                            <button className="text-sm text-slate-500 hover:text-blue-600 font-medium ml-2">
                                                Expected Status
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delivery Modal */}
            {deliveryModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Confirm Delivery</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Actual Delivery Date
                            </label>
                            <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeliveryModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedOrder, 'DELIVERED', deliveryDate)}
                                disabled={updating === selectedOrder}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                {updating === selectedOrder ? 'Updating...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
