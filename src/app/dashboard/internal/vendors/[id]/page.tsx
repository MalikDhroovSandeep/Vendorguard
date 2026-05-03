'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface VendorData {
    id: string;
    businessName: string;
    businessType: string;
    industryCategory: string;
    businessDescription: string | null;
    yearEstablished: number | null;
    kycStatus: string;
    riskScore: number | null;
    riskCategory: string | null;
    status: string;
    createdAt: string;
    email: string;
    contactName: string;
}

interface ContactData {
    contactName: string;
    designation: string | null;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
}

interface OrderData {
    id: string;
    orderNumber: string;
    title: string;
    amount: number;
    status: string;
    expectedDelivery: string | null;
    actualDelivery: string | null;
    createdAt: string;
}

interface StatsData {
    totalOrders: number;
    deliveredOrders: number;
    activeDisputes: number;
    onTimeRate: number;
}

export default function VendorDetailsPage() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [vendor, setVendor] = useState<VendorData | null>(null);
    const [contact, setContact] = useState<ContactData | null>(null);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const res = await fetch(`/api/vendors/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setVendor(data.vendor);
                    setContact(data.contact);
                    setOrders(data.orders || []);
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Failed to fetch vendor:', err);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) {
            fetchVendor();
        }
    }, [params.id]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'info' },
        { id: 'contact', label: 'Contact Details', icon: 'contact_mail' },
        { id: 'orders', label: 'Orders History', icon: 'shopping_cart' },
        { id: 'risk', label: 'Risk Summary', icon: 'assessment' },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-700',
            INACTIVE: 'bg-slate-100 text-slate-700',
            BLACKLISTED: 'bg-red-100 text-red-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            SUBMITTED: 'bg-blue-100 text-blue-700',
            VERIFIED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
            LOW: 'bg-green-100 text-green-700',
            MEDIUM: 'bg-yellow-100 text-yellow-700',
            HIGH: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">Loading vendor details...</div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <span className="material-icons-round text-6xl text-slate-300 mb-4">error_outline</span>
                <p className="text-slate-500 text-lg">Vendor not found</p>
                <Link href="/dashboard/internal/vendors" className="mt-4 text-blue-600 hover:underline">
                    Back to Vendors
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/internal/vendors"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <span className="material-icons-round text-slate-600 dark:text-slate-400">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{vendor.businessName}</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{vendor.industryCategory} • {vendor.businessType.replace('_', ' ')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(vendor.kycStatus)}`}>
                        KYC: {vendor.kycStatus}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(vendor.riskCategory || 'LOW')}`}>
                        Risk: {vendor.riskCategory || 'N/A'}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="flex gap-1 px-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="material-icons-round text-xl">{tab.icon}</span>
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Tab 1: Overview */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Business Name</h3>
                                    <p className="text-slate-900 dark:text-white font-medium">{vendor.businessName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Business Type</h3>
                                    <p className="text-slate-900 dark:text-white">{vendor.businessType.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Industry</h3>
                                    <p className="text-slate-900 dark:text-white">{vendor.industryCategory}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Contact Email</h3>
                                    <p className="text-slate-900 dark:text-white">{vendor.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Year Established</h3>
                                    <p className="text-slate-900 dark:text-white">{vendor.yearEstablished || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Registration Date</h3>
                                    <p className="text-slate-900 dark:text-white">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Vendor Status</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                                        {vendor.status}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">KYC Status</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.kycStatus)}`}>
                                        {vendor.kycStatus}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Risk Score</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.riskCategory || 'LOW')}`}>
                                            {vendor.riskCategory || 'N/A'}
                                        </span>
                                        {vendor.riskScore && <span className="text-sm text-slate-600 dark:text-slate-400">Score: {vendor.riskScore}/100</span>}
                                    </div>
                                </div>
                            </div>

                            {vendor.businessDescription && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Business Description</h3>
                                    <p className="text-slate-900 dark:text-white">{vendor.businessDescription}</p>
                                </div>
                            )}

                            {/* Quick Stats */}
                            {stats && (
                                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 mt-4">
                                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">Quick Stats</h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOrders}</p>
                                            <p className="text-sm text-slate-500">Total Orders</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
                                            <p className="text-sm text-slate-500">Delivered</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.onTimeRate}%</p>
                                            <p className="text-sm text-slate-500">On-Time Rate</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-red-600">{stats.activeDisputes}</p>
                                            <p className="text-sm text-slate-500">Active Disputes</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Contact Details */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            {contact ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">Contact Person</h3>
                                        <p className="text-slate-900 dark:text-white font-medium">{contact.contactName}</p>
                                        {contact.designation && <p className="text-sm text-slate-500">{contact.designation}</p>}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">Email</h3>
                                        <p className="text-slate-900 dark:text-white">{contact.email}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">Phone</h3>
                                        <p className="text-slate-900 dark:text-white">{contact.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">Address</h3>
                                        <p className="text-slate-900 dark:text-white">
                                            {contact.address || 'N/A'}
                                            {contact.city && `, ${contact.city}`}
                                            {contact.state && `, ${contact.state}`}
                                            {contact.pinCode && ` - ${contact.pinCode}`}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <span className="material-icons-round text-4xl mb-2 text-slate-300">contact_mail</span>
                                    <p>No contact details available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Orders History */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Purchase Orders History</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Recent orders with this vendor</p>
                            </div>

                            {orders.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <span className="material-icons-round text-4xl mb-2 text-slate-300">shopping_cart</span>
                                    <p>No orders found</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Order ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Title</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Amount</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {orders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                        <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">{order.orderNumber}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{order.title}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(order.amount)}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {stats && (
                                        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                                            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Order Summary</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOrders}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">Delivered</p>
                                                    <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">On-Time Rate</p>
                                                    <p className="text-2xl font-bold text-blue-600">{stats.onTimeRate}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Tab 4: Risk Summary */}
                    {activeTab === 'risk' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Assessment</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">AI-generated risk analysis</p>
                            </div>

                            {/* Overall Risk Score */}
                            <div className={`rounded-lg p-6 ${vendor.riskCategory === 'LOW' ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200' :
                                    vendor.riskCategory === 'MEDIUM' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200' :
                                        'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${vendor.riskCategory === 'LOW' ? 'text-green-700' :
                                                vendor.riskCategory === 'MEDIUM' ? 'text-yellow-700' : 'text-red-700'
                                            }`}>Overall Risk Score</p>
                                        <p className={`text-4xl font-bold mt-2 ${vendor.riskCategory === 'LOW' ? 'text-green-900' :
                                                vendor.riskCategory === 'MEDIUM' ? 'text-yellow-900' : 'text-red-900'
                                            }`}>{vendor.riskScore || 'N/A'}/100</p>
                                        <p className={`text-sm mt-1 ${vendor.riskCategory === 'LOW' ? 'text-green-700' :
                                                vendor.riskCategory === 'MEDIUM' ? 'text-yellow-700' : 'text-red-700'
                                            }`}>Risk Level: <span className="font-semibold">{vendor.riskCategory || 'Not Assessed'}</span></p>
                                    </div>
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${vendor.riskCategory === 'LOW' ? 'bg-green-500' :
                                            vendor.riskCategory === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                        <span className="material-icons-round text-white text-5xl">
                                            {vendor.riskCategory === 'LOW' ? 'verified' : vendor.riskCategory === 'MEDIUM' ? 'warning' : 'error'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Disputes Warning */}
                            {stats && stats.activeDisputes > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <span className="material-icons-round text-red-600">warning</span>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-red-900">Active Disputes</h4>
                                            <p className="text-sm text-red-700 mt-1">
                                                This vendor has {stats.activeDisputes} active dispute(s) that require attention.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(!stats || stats.activeDisputes === 0) && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <span className="material-icons-round text-green-600">check_circle</span>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-green-900">No Active Issues</h4>
                                            <p className="text-sm text-green-700 mt-1">No critical risk indicators or disputes detected.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                <span className="material-icons-round text-blue-600">info</span>
                                <div className="flex-1">
                                    <p className="text-sm text-blue-900 font-medium">AI Advisory Information</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Risk scores are AI-generated and used for decision support only.
                                        Final procurement decisions remain human-driven.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
