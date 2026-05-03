'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/Pagination';

interface Order {
    id: string;
    orderNumber: string;
    title: string;
    amount: string;
    status: string;
    expectedDelivery: string | null;
    createdAt: string;
    vendor: {
        id: string;
        businessName: string;
        riskCategory: string | null;
    };
}

export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const params = new URLSearchParams();
                if (filterStatus !== 'all') params.append('status', filterStatus);

                const res = await fetch(`/api/orders?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.orders || []);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [filterStatus]);

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
            {/* Breadcrumbs */}
            <nav className="flex text-sm text-slate-500">
                <a href="/dashboard/admin" className="hover:text-blue-600 transition-colors">Dashboard</a>
                <span className="mx-2">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Purchase Orders</span>
            </nav>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase Orders</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                        Monitor all vendor purchase orders. This view is read-only. AI risk assessments are updated in real-time.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm shadow-sm">
                        <span className="material-icons-outlined text-lg">download</span>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex flex-1 gap-3 flex-wrap">
                        {/* Filter: Status */}
                        <div className="relative min-w-[160px]">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending Approval</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <span className="material-icons-outlined text-slate-400 text-lg">expand_more</span>
                            </div>
                        </div>

                        {/* Local Search */}
                        <div className="relative w-full lg:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-icons-outlined text-slate-400">search</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Search Order #"
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
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
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Date</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor Risk</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((po) => (
                                    <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-semibold text-blue-600">{po.orderNumber}</div>
                                            <div className="text-xs text-slate-500">{po.title}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{po.vendor.businessName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                                            {new Date(po.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">
                                            {formatCurrency(po.amount)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskStyle(po.vendor.riskCategory)}`}>
                                                {po.vendor.riskCategory || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyle(po.status)}`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="View Details">
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
                        currentPage={1}
                        totalPages={1}
                        totalItems={orders.length}
                        itemsPerPage={10}
                        onPageChange={() => { }}
                    />
                </div>
            </div>
        </div>
    );
}
