'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/Pagination';

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    ipAddress: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
        role: string;
    } | null;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=20`);
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs || []);
                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [page]);

    const getStatusColor = (action: string) => {
        if (action.toLowerCase().includes('error') || action.toLowerCase().includes('fail')) {
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        }
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    };

    const getUserAvatarColor = (role: string = 'internal') => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-600 border-purple-200';
            case 'vendor': return 'bg-orange-100 text-orange-600 border-orange-200';
            default: return 'bg-blue-100 text-blue-600 border-blue-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">System Audit Logs</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                        Track and monitor all system activities, user actions, AI risk assessments, and data modifications across the VendorGuard platform.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-icons-outlined text-lg">download</span>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row gap-4 justify-between">
                {/* Search */}
                <div className="w-full lg:w-96 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-icons-outlined text-slate-400 group-focus-within:text-blue-600 transition-colors">search</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                        placeholder="Search by keyword, user, or entity ID..."
                        type="text"
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2 items-center">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span>Date: Last 30 Days</span>
                        <span className="material-icons-outlined text-lg">expand_more</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span>Event Type: All</span>
                        <span className="material-icons-outlined text-lg">expand_more</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-600 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <span className="material-icons-outlined text-lg">filter_list</span>
                        More Filters
                    </button>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading logs...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No logs found.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.action)}`}>
                                                {getStatusColor(log.action).includes('red') ? 'Failed' : 'Success'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {log.user ? (
                                                <div className="flex items-center">
                                                    <div className={`h-8 w-8 rounded-full ${getUserAvatarColor(log.user.role)} flex items-center justify-center text-xs font-bold border flex-shrink-0 uppercase`}>
                                                        {log.user.name.substring(0, 2)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{log.user.name}</div>
                                                        <div className="text-xs text-slate-500">{log.user.email}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-500">System</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                {log.action}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium cursor-pointer hover:underline">
                                            {log.entityType} #{log.entityId ? log.entityId.substring(0, 8) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                            {log.ipAddress || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={logs.length} // Approximate or just show current page
                        itemsPerPage={20}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
}
