'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Vendor {
    id: string;
    businessName: string;
    businessType: string;
    industryCategory: string;
    kycStatus: string;
    riskCategory: string | null;
    status: string;
    user?: {
        email: string;
        name: string;
    };
    contact?: {
        email: string;
        phone: string;
    };
}

export default function VendorManagementPage() {
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        industryCategory: '',
        contactEmail: '',
        password: '',
    });

    // Fetch vendors from API
    const fetchVendors = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const res = await fetch(`/api/vendors?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setVendors(data.vendors || []);
            }
        } catch (err) {
            console.error('Failed to fetch vendors:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterStatus]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create vendor');
                return;
            }

            // Success - close modal and refresh
            setShowAddVendorModal(false);
            setFormData({ businessName: '', businessType: '', industryCategory: '', contactEmail: '', password: '' });
            fetchVendors();
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getKYCStatusStyle = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
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

    const getStatusStyle = (status: string) => {
        return status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and onboard vendors</p>
                </div>
                <button
                    onClick={() => setShowAddVendorModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <span className="material-icons-round text-xl">add</span>
                    Add New Vendor
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Search by vendor name or industry..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Vendor Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Vendor Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Industry</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">KYC Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Risk Level</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Loading vendors...
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No vendors found. Add your first vendor!
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="material-icons-round text-blue-600">business</span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{vendor.businessName}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{vendor.user?.email || ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{vendor.industryCategory}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKYCStatusStyle(vendor.kycStatus)}`}>
                                                {vendor.kycStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskStyle(vendor.riskCategory)}`}>
                                                {vendor.riskCategory || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(vendor.status)}`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/dashboard/internal/vendors/${vendor.id}`}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                                            >
                                                <span className="material-icons-round text-lg">visibility</span>
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Vendor Modal */}
            {showAddVendorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add New Vendor</h2>
                            <button
                                onClick={() => setShowAddVendorModal(false)}
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
                                    Vendor Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter vendor name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Business Type *
                                </label>
                                <select
                                    value={formData.businessType}
                                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select business type</option>
                                    <option value="INDIVIDUAL">Individual</option>
                                    <option value="PARTNERSHIP">Partnership</option>
                                    <option value="PVT_LTD">Private Limited</option>
                                    <option value="LLP">LLP</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Industry Category *
                                </label>
                                <select
                                    value={formData.industryCategory}
                                    onChange={(e) => setFormData({ ...formData, industryCategory: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Raw Materials">Raw Materials</option>
                                    <option value="Logistics">Logistics</option>
                                    <option value="Automotive">Automotive</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Contact Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="vendor@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Initial Password
                                </label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Leave empty for default (vendor123)"
                                />
                                <p className="text-xs text-slate-500 mt-1">Share this password with the vendor. They can change it later.</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddVendorModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Adding...' : 'Add Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
