'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const title = pathname?.includes('/vendor')
        ? 'Vendor Portal'
        : pathname?.includes('/internal')
            ? 'Internal User Portal'
            : 'Admin Dashboard';

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header title={title} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 bg-gray-100 dark:bg-slate-900">
                    {children}
                </main>
            </div>
        </div>
    );
}
