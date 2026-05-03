'use client';

import { useState, useEffect, useCallback } from 'react';
import { MiniStatCard } from '@/components/dashboard/MiniStatCard';
import { VendorFilters } from '@/components/dashboard/VendorFilters';
import { VendorManagementTable, Vendor } from '@/components/dashboard/VendorManagementTable';
import { Pagination } from '@/components/ui/Pagination';

export default function VendorManagementPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalVendors, setTotalVendors] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: searchTerm,
                status: filterStatus === 'all' ? '' : filterStatus
            });
            const res = await fetch(`/api/vendors?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();

                // Map API response to Vendor interface expected by table
                const mappedVendors: Vendor[] = data.vendors.map((v: any) => ({
                    id: v.id, // Database UUID
                    vendorId: v.id.substring(0, 8).toUpperCase(), // Display ID
                    name: v.businessName,
                    initials: v.businessName.substring(0, 2).toUpperCase(),
                    initialsColor: 'blue', // Default color
                    email: v.user?.email || v.contact?.email || 'N/A',
                    phone: v.contact?.phone || 'N/A',
                    status: v.status.toLowerCase(),
                    riskScore: Number(v.riskScore) || 0,
                    isHighRisk: v.riskCategory === 'HIGH'
                }));

                setVendors(mappedVendors);
                setTotalVendors(data.pagination.total);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filterStatus]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Vendor Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Monitor vendor performance, risk scores, and compliance status.
                    </p>
                </div>
                {/* 
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium flex items-center gap-2 transition-all w-fit">
                    <span className="material-icons-outlined text-[18px]">add</span>
                    Onboard New Vendor
                </button>
                */}
            </div>

            {/* Stats Grid - Todo: fetch real stats for these mini cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <MiniStatCard
                    title="Total Vendors"
                    value={totalVendors.toString()}
                    icon="groups"
                    iconColor="text-blue-500"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/30"
                />
                {/* Other cards placeholders for now */}
            </div>

            {/* Filters + Table */}
            <div>
                {/* Passing dummy props to filter for now as implementation detailed in VendorFilters component is unknown */}
                {/* <VendorFilters /> */}

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading vendors...</div>
                ) : (
                    <VendorManagementTable vendors={vendors} />
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalVendors}
                itemsPerPage={10}
                onPageChange={setPage}
            />
        </div>
    );
}
