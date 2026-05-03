'use client';

import { useState, useEffect, useCallback } from 'react';
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
    createdAt: string;
    vendor: {
        id: string;
        businessName: string;
    };
    order: {
        id: string;
        orderNumber: string;
        title: string;
    };
    createdBy: {
        id: string;
        name: string;
    };
    items: Array<{
        id: string;
        itemName: string;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
        reason: string;
    }>;
}

interface Order {
    id: string;
    orderNumber: string;
    title: string;
    amount: string;
    vendor: {
        id: string;
        businessName: string;
    };
}

interface ReturnItem {
    itemName: string;
    quantity: number;
    unitPrice: number;
    reason: string;
    description?: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error';
}

const RETURN_REASONS = [
    { value: 'DEFECTIVE', label: 'Defective' },
    { value: 'DAMAGED_IN_TRANSIT', label: 'Damaged in Transit' },
    { value: 'WRONG_ITEM', label: 'Wrong Item' },
    { value: 'QUALITY_ISSUE', label: 'Quality Issue' },
    { value: 'QUANTITY_MISMATCH', label: 'Quantity Mismatch' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'NOT_AS_DESCRIBED', label: 'Not as Described' },
    { value: 'OTHER', label: 'Other' },
];

export default function InternalReturnsPage() {
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [toast, setToast] = useState<Toast | null>(null);

    // Create Return form state
    const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [returnReason, setReturnReason] = useState('DEFECTIVE');
    const [returnDescription, setReturnDescription] = useState('');
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([{ itemName: '', quantity: 1, unitPrice: 0, reason: 'DEFECTIVE' }]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);
            params.append('page', page.toString());
            params.append('limit', '10');

            const res = await fetch(`/api/returns?${params.toString()}`);
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
    }, [filterStatus, page]);

    const fetchDeliveredOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await fetch('/api/orders?status=DELIVERED&limit=100');
            if (res.ok) {
                const data = await res.json();
                setDeliveredOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

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
        const found = RETURN_REASONS.find(r => r.value === reason);
        return found ? found.label : reason;
    };

    const handleOpenCreateModal = () => {
        fetchDeliveredOrders();
        setSelectedOrderId('');
        setReturnReason('DEFECTIVE');
        setReturnDescription('');
        setReturnItems([{ itemName: '', quantity: 1, unitPrice: 0, reason: 'DEFECTIVE' }]);
        setShowCreateModal(true);
    };

    const handleAddItem = () => {
        setReturnItems([...returnItems, { itemName: '', quantity: 1, unitPrice: 0, reason: returnReason }]);
    };

    const handleRemoveItem = (index: number) => {
        if (returnItems.length > 1) {
            setReturnItems(returnItems.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, field: keyof ReturnItem, value: string | number) => {
        const updated = [...returnItems];
        (updated[index] as any)[field] = value;
        setReturnItems(updated);
    };

    const calculateTotal = () => {
        return returnItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const handleCreateReturn = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOrderId) {
            setToast({ message: 'Please select an order', type: 'error' });
            return;
        }

        const validItems = returnItems.filter(item => item.itemName.trim() && item.quantity > 0);
        if (validItems.length === 0) {
            setToast({ message: 'Please add at least one valid item', type: 'error' });
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch('/api/returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedOrderId,
                    reason: returnReason,
                    description: returnDescription,
                    items: validItems.map(item => ({
                        itemName: item.itemName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        reason: item.reason || returnReason,
                    })),
                }),
            });

            if (res.ok) {
                setToast({ message: 'Return created successfully', type: 'success' });
                setShowCreateModal(false);
                fetchReturns();
            } else {
                const data = await res.json();
                setToast({ message: data.error || 'Failed to create return', type: 'error' });
            }
        } catch {
            setToast({ message: 'Failed to create return', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    // Stats counts
    const pendingCount = returns.filter(r => r.status === 'PENDING').length;
    const underReviewCount = returns.filter(r => r.status === 'VENDOR_REVIEW').length;
    const approvedCount = returns.filter(r => r.status === 'APPROVED').length;
    const creditIssuedCount = returns.filter(r => r.status === 'CREDIT_ISSUED').length;

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
                <a href="/dashboard/internal" className="hover:text-blue-600 transition-colors">Dashboard</a>
                <span className="mx-2">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Returns Management</span>
            </nav>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Returns & Claims</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                        Create and manage product returns for vendor orders.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <span className="material-icons-round text-xl">add</span>
                    Create Return
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-500">Pending</div>
                    <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-500">Under Review</div>
                    <div className="text-2xl font-bold text-blue-600">{underReviewCount}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-500">Approved</div>
                    <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="text-sm font-medium text-slate-500">Credit Issued</div>
                    <div className="text-2xl font-bold text-emerald-600">{creditIssuedCount}</div>
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
                                <option value="CLOSED">Closed</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <span className="material-icons-outlined text-slate-400 text-lg">expand_more</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchReturns()}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        title="Refresh"
                    >
                        <span className="material-icons-round">refresh</span>
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Return #</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
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
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-icons-outlined text-4xl text-slate-300">assignment_return</span>
                                            <p>No returns found.</p>
                                            <button
                                                onClick={handleOpenCreateModal}
                                                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Create your first return
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                returns.map((ret) => (
                                    <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-semibold text-blue-600">{ret.returnNumber}</div>
                                            <div className="text-xs text-slate-500">{new Date(ret.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{ret.vendor.businessName}</span>
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
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => { setSelectedReturn(ret); setShowModal(true); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <span className="material-icons-outlined text-xl">visibility</span>
                                            </button>
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
                                            <label className="text-xs text-slate-500 uppercase">Vendor</label>
                                            <p className="font-medium text-slate-900 dark:text-white">{selectedReturn.vendor.businessName}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase">Order</label>
                                            <p className="text-slate-600 dark:text-slate-300">{selectedReturn.order.orderNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase">Reason</label>
                                            <p className="text-slate-600 dark:text-slate-300">{getReasonLabel(selectedReturn.reason)}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase">Total Amount</label>
                                            <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedReturn.totalAmount)}</p>
                                        </div>
                                    </div>

                                    {selectedReturn.description && (
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <label className="text-xs text-slate-500 uppercase">Description</label>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedReturn.description}</p>
                                        </div>
                                    )}

                                    {selectedReturn.vendorResponse && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                            <label className="text-xs text-blue-600 uppercase font-medium">Vendor Response</label>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedReturn.vendorResponse}</p>
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Return Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowCreateModal(false)}>
                            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
                        </div>
                        <div className="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleCreateReturn}>
                                <div className="px-6 pt-5 pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Return Request</h3>
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-500">
                                            <span className="material-icons-outlined">close</span>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Order Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Select Order <span className="text-red-500">*</span>
                                            </label>
                                            {ordersLoading ? (
                                                <div className="py-2 text-slate-500">Loading delivered orders...</div>
                                            ) : (
                                                <select
                                                    value={selectedOrderId}
                                                    onChange={(e) => setSelectedOrderId(e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Choose a delivered order</option>
                                                    {deliveredOrders.map((order) => (
                                                        <option key={order.id} value={order.id}>
                                                            {order.orderNumber} - {order.vendor.businessName} - {formatCurrency(order.amount)}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {deliveredOrders.length === 0 && !ordersLoading && (
                                                <p className="mt-1 text-sm text-amber-600">No delivered orders available for return.</p>
                                            )}
                                        </div>

                                        {/* Return Reason */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Reason <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={returnReason}
                                                onChange={(e) => setReturnReason(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                {RETURN_REASONS.map((reason) => (
                                                    <option key={reason.value} value={reason.value}>{reason.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={returnDescription}
                                                onChange={(e) => setReturnDescription(e.target.value)}
                                                rows={3}
                                                placeholder="Provide additional details about the return..."
                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Return Items */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Items to Return <span className="text-red-500">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleAddItem}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                >
                                                    <span className="material-icons-round text-lg">add</span>
                                                    Add Item
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {returnItems.map((item, index) => (
                                                    <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Item name"
                                                                value={item.itemName}
                                                                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="w-20">
                                                            <input
                                                                type="number"
                                                                placeholder="Qty"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                min="1"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="w-28">
                                                            <input
                                                                type="number"
                                                                placeholder="Unit Price"
                                                                value={item.unitPrice}
                                                                onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                min="0"
                                                                step="0.01"
                                                                required
                                                            />
                                                        </div>
                                                        {returnItems.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                            >
                                                                <span className="material-icons-round text-xl">delete</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">Total Return Amount</span>
                                                <span className="text-xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading || deliveredOrders.length === 0}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading ? 'Creating...' : 'Create Return'}
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
