'use client';

import { useState } from 'react';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 transition-colors duration-300">
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    <span className="material-icons-round">menu</span>
                </button>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 rounded-full px-3 py-1.5 border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    <span className="material-icons-round text-slate-400 text-sm">search</span>
                    <input
                        type="text"
                        placeholder="Search vendors, POs..."
                        className="bg-transparent border-none text-sm focus:ring-0 focus:outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 w-48 ml-2"
                    />
                </div>

                {/* Dark Mode Toggle */}
                <button
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
                    onClick={toggleDarkMode}
                    aria-label="Toggle dark mode"
                >
                    <span className="material-icons-round">
                        {darkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                {/* Notifications */}
                <NotificationDropdown />
            </div>
        </header>
    );
}

