'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    phone: string | null;
    department: string | null;
    createdAt: string;
    vendor?: {
        businessName: string;
    } | null;
}

interface Stats {
    total: number;
    active: number;
    admins: number;
    internalUsers: number;
    vendors: number;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, active: 0, admins: 0, internalUsers: 0, vendors: 0 });
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'INTERNAL_USER',
        phone: '',
        department: '',
        status: 'ACTIVE',
    });
    const [newPassword, setNewPassword] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (filterRole !== 'all') params.append('role', filterRole);
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setStats(data.stats || { total: 0, active: 0, admins: 0, internalUsers: 0, vendors: 0 });
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, [page, filterRole, filterStatus, searchQuery]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setActionLoading(true);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to create user');
                return;
            }

            setShowAddModal(false);
            setFormData({ name: '', email: '', password: '', role: 'INTERNAL_USER', phone: '', department: '', status: 'ACTIVE' });
            fetchUsers();
        } catch {
            setError('An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setError('');
        setActionLoading(true);

        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    status: formData.status,
                    phone: formData.phone,
                    department: formData.department,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to update user');
                return;
            }

            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch {
            setError('An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setError('');
        setActionLoading(true);

        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to reset password');
                return;
            }

            setShowPasswordModal(false);
            setSelectedUser(null);
            setNewPassword('');
            alert('Password reset successfully!');
        } catch {
            setError('An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
            const data = await res.json();


            if (!res.ok) {
                alert(data.error || 'Failed to delete user');
                return;
            }

            fetchUsers();
        } catch {
            alert('An error occurred');
        }
    };

    const handleStatusChange = async (user: User, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchUsers();
            }
        } catch {
            alert('Failed to update status');
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            status: user.status,
            phone: user.phone || '',
            department: user.department || '',
        });
        setError('');
        setShowEditModal(true);
    };

    const openPasswordModal = (user: User) => {
        setSelectedUser(user);
        setNewPassword('');
        setError('');
        setShowPasswordModal(true);
    };

    const getRoleStyle = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700';
            case 'INTERNAL_USER': return 'bg-blue-100 text-blue-700';
            case 'VENDOR': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'INACTIVE': return 'bg-slate-100 text-slate-700';
            case 'SUSPENDED': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage all system users</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', email: '', password: '', role: 'INTERNAL_USER', phone: '', department: '', status: 'ACTIVE' });
                        setError('');
                        setShowAddModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
                >
                    <span className="material-icons-round text-sm">add</span>
                    Add User
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Admins</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{stats.admins}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Internal Users</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.internalUsers}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Vendors</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.vendors}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Role:</span>
                        <select
                            value={filterRole}
                            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="internal_user">Internal User</option>
                            <option value="vendor">Vendor</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="w-full max-w-xs px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No users found</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                                {user.vendor && <p className="text-xs text-blue-600">{user.vendor.businessName}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleStyle(user.role)}`}>
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {user.department || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                                    title="Edit"
                                                >
                                                    <span className="material-icons-round text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => openPasswordModal(user)}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-100 rounded"
                                                    title="Reset Password"
                                                >
                                                    <span className="material-icons-round text-lg">key</span>
                                                </button>
                                                {user.status === 'ACTIVE' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(user, 'INACTIVE')}
                                                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                                                        title="Deactivate"
                                                    >
                                                        <span className="material-icons-round text-lg">block</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusChange(user, 'ACTIVE')}
                                                        className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                                                        title="Activate"
                                                    >
                                                        <span className="material-icons-round text-lg">check_circle</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                                    title="Delete"
                                                >
                                                    <span className="material-icons-round text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add New User</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                                    <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role *</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600">
                                        <option value="ADMIN">Admin</option>
                                        <option value="INTERNAL_USER">Internal User</option>
                                        <option value="VENDOR">Vendor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                                    <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {actionLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit User</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditUser} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600">
                                        <option value="ADMIN">Admin</option>
                                        <option value="INTERNAL_USER">Internal User</option>
                                        <option value="VENDOR">Vendor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600">
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="SUSPENDED">Suspended</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                                    <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {actionLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Reset Password</h2>
                            <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Reset password for <strong>{selectedUser.name}</strong> ({selectedUser.email})
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password *</label>
                                <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                    placeholder="Minimum 6 characters" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">
                                    {actionLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
