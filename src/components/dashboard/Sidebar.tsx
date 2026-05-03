'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

interface NavItem {
    label: string;
    href: string;
    icon: string;
    badge?: number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const adminNavigation: NavSection[] = [
    {
        title: '',
        items: [
            { label: 'Dashboard', href: '/dashboard/admin', icon: 'dashboard' },
            { label: 'Vendor Management', href: '/dashboard/admin/vendors', icon: 'business' },
            { label: 'KYC Approvals', href: '/dashboard/admin/kyc', icon: 'verified_user' },
            { label: 'Purchase Orders', href: '/dashboard/admin/orders', icon: 'shopping_cart' },
            { label: 'Disputes', href: '/dashboard/admin/disputes', icon: 'gavel' },
            { label: 'Returns', href: '/dashboard/admin/returns', icon: 'assignment_return' },
            { label: 'AI Risk Analytics', href: '/dashboard/admin/risk', icon: 'insights' },
            { label: 'Reports', href: '/dashboard/admin/reports', icon: 'bar_chart' },
            { label: 'Audit Logs', href: '/dashboard/admin/audit', icon: 'history' },
            { label: 'User Management', href: '/dashboard/admin/users', icon: 'people' },
            { label: 'Notifications', href: '/dashboard/notifications', icon: 'notifications' },
        ],
    },
    {
        title: 'SYSTEM',
        items: [
            { label: 'Settings', href: '/dashboard/admin/settings', icon: 'settings' },
        ],
    },
];

const vendorNavigation: NavSection[] = [
    {
        title: '',
        items: [
            { label: 'Dashboard', href: '/dashboard/vendor', icon: 'dashboard' },
            { label: 'My Profile / KYC', href: '/dashboard/vendor/kyc', icon: 'person' },
            { label: 'Orders', href: '/dashboard/vendor/orders', icon: 'shopping_cart' },
            { label: 'Invoices', href: '/dashboard/vendor/invoices', icon: 'receipt' },
            { label: 'Disputes', href: '/dashboard/vendor/disputes', icon: 'gavel' },
            { label: 'Returns', href: '/dashboard/vendor/returns', icon: 'assignment_return' },
            { label: 'Performance', href: '/dashboard/vendor/performance', icon: 'insights' },
            { label: 'Notifications', href: '/dashboard/notifications', icon: 'notifications' },
        ],
    },
    {
        title: 'SYSTEM',
        items: [
            { label: 'Settings', href: '/dashboard/vendor/settings', icon: 'settings' },
        ],
    },
];

const internalUserNavigation: NavSection[] = [
    {
        title: '',
        items: [
            { label: 'Dashboard', href: '/dashboard/internal', icon: 'dashboard' },
            { label: 'Vendor Management', href: '/dashboard/internal/vendors', icon: 'business' },
            { label: 'Purchase Orders', href: '/dashboard/internal/orders', icon: 'shopping_cart' },
            { label: 'Invoices', href: '/dashboard/internal/invoices', icon: 'receipt' },
            { label: 'Disputes', href: '/dashboard/internal/disputes', icon: 'gavel' },
            { label: 'Returns', href: '/dashboard/internal/returns', icon: 'assignment_return' },
            { label: 'AI Insights', href: '/dashboard/internal/insights', icon: 'psychology' },
            { label: 'Reports', href: '/dashboard/internal/reports', icon: 'bar_chart' },
            { label: 'Notifications', href: '/dashboard/notifications', icon: 'notifications' },
        ],
    },
    {
        title: 'SYSTEM',
        items: [
            { label: 'Settings', href: '/dashboard/internal/settings', icon: 'settings' },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Determine navigation based on role
    // We safely access role assuming it might be added at runtime or via custom types
    const userRole = (session?.user as any)?.role;
    const navigation =
        userRole === 'vendor'
            ? vendorNavigation
            : userRole === 'internal'
                ? internalUserNavigation
                : adminNavigation;

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex-col shadow-xl z-20 hidden md:flex transition-all duration-300">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500 rounded-lg">
                        <span className="material-icons-round text-white text-xl">shield</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-wide">VendorGuard</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navigation.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        {section.title && (
                            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">
                                {section.title}
                            </p>
                        )}
                        {section.items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                        ? 'bg-blue-500 text-white'
                                        : 'hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <span
                                        className={`material-icons-round transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                            }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full hover:bg-slate-800 px-3 py-2.5 rounded-lg transition-colors text-left text-slate-400 hover:text-white"
                >
                    <span className="material-icons-round">logout</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
