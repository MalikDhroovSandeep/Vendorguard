'use client';

import { useState, useEffect, useRef } from 'react';
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

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch('/api/notifications/unread-count');
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications?limit=5');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            return 'text-green-500';
        }
        if (type.includes('REJECTED')) {
            return 'text-red-500';
        }
        if (type.includes('CREATED') || type.includes('SUBMITTED')) {
            return 'text-blue-500';
        }
        return 'text-amber-500';
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
            >
                <span className="material-icons-round">notifications_none</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="material-icons-round text-4xl text-slate-300 mb-2">notifications_off</span>
                                <p className="text-slate-500 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => {
                                        if (!notification.isRead) markAsRead(notification.id);
                                        if (notification.link) window.location.href = notification.link;
                                    }}
                                    className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 cursor-pointer transition-colors ${notification.isRead
                                            ? 'bg-white dark:bg-slate-800'
                                            : 'bg-blue-50 dark:bg-slate-700/50'
                                        } hover:bg-slate-50 dark:hover:bg-slate-700`}
                                >
                                    <div className="flex gap-3">
                                        <span className={`material-icons-round text-lg ${getTypeColor(notification.type)}`}>
                                            {getTypeIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <Link
                            href="/dashboard/notifications"
                            className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
