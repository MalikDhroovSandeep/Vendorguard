'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [filterRead, setFilterRead] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '15');
            if (filterRead === 'unread') params.append('unreadOnly', 'true');

            const res = await fetch(`/api/notifications?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                let filtered = data.notifications || [];

                // Client-side type filter
                if (filterType !== 'all') {
                    filtered = filtered.filter((n: Notification) => n.type.startsWith(filterType));
                }

                setNotifications(filtered);
                setTotalPages(data.pagination?.totalPages || 1);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [page, filterRead, filterType]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'PUT' });
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        if (!confirm('Delete this notification?')) return;
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            KYC_SUBMITTED: 'description',
            KYC_APPROVED: 'verified',
            KYC_REJECTED: 'cancel',
            ORDER_CREATED: 'shopping_cart',
            ORDER_APPROVED: 'check_circle',
            ORDER_DELIVERED: 'local_shipping',
            INVOICE_SUBMITTED: 'receipt',
            INVOICE_APPROVED: 'thumb_up',
            INVOICE_PAID: 'payments',
            INVOICE_REJECTED: 'thumb_down',
            DISPUTE_CREATED: 'report_problem',
            DISPUTE_RESOLVED: 'gavel',
            SYSTEM_ALERT: 'info',
        };
        return icons[type] || 'notifications';
    };

    const getTypeColor = (type: string) => {
        if (type.includes('APPROVED') || type.includes('PAID') || type.includes('RESOLVED')) {
            return 'bg-green-100 text-green-600';
        }
        if (type.includes('REJECTED')) {
            return 'bg-red-100 text-red-600';
        }
        if (type.includes('CREATED') || type.includes('SUBMITTED')) {
            return 'bg-blue-100 text-blue-600';
        }
        return 'bg-amber-100 text-amber-600';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <span className="material-icons-round text-sm">done_all</span>
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Type:</span>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="KYC">KYC</option>
                            <option value="ORDER">Orders</option>
                            <option value="INVOICE">Invoices</option>
                            <option value="DISPUTE">Disputes</option>
                            <option value="SYSTEM">System</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
                        <select
                            value={filterRead}
                            onChange={(e) => setFilterRead(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="unread">Unread Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-icons-round text-5xl text-slate-300 mb-3">notifications_off</span>
                        <p className="text-slate-500 text-lg">No notifications found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-4 transition-colors ${notification.isRead
                                        ? 'bg-white dark:bg-slate-800'
                                        : 'bg-blue-50/50 dark:bg-slate-700/30'
                                    } hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                                        <span className="material-icons-round text-lg">
                                            {getTypeIcon(notification.type)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={`font-medium ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    {formatDate(notification.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <span className="material-icons-round text-lg">check</span>
                                                    </button>
                                                )}
                                                {notification.link && (
                                                    <Link
                                                        href={notification.link}
                                                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                                                        title="View details"
                                                    >
                                                        <span className="material-icons-round text-lg">open_in_new</span>
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <span className="material-icons-round text-lg">delete_outline</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
