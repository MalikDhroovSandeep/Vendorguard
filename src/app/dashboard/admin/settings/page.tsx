'use client';

import { useState, useEffect } from 'react';

// Tab options
const tabs = ['My Profile', 'Security', 'Notifications', 'Team Members'];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('My Profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Preferences State
    const [preferences, setPreferences] = useState({
        highRiskVendors: true,
        emailAlerts: true, // mapped to global sanctions for now or generic email
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/user/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setProfile({
                            name: data.user.name || '',
                            email: data.user.email || '',
                            phone: data.user.phone || '',
                            role: data.user.role || '',
                            department: data.user.department || '',
                        });
                        if (data.user.preferences) {
                            setPreferences({
                                highRiskVendors: data.user.preferences.highRiskVendors ?? true,
                                emailAlerts: data.user.preferences.emailAlerts ?? true,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    phone: profile.phone,
                    // email is read-only in UI for now as per design, but API supports it
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handlePreferenceUpdate = async (key: string, value: boolean) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);

        // Auto-save preferences
        try {
            await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preferences: newPreferences,
                }),
            });
        } catch (error) {
            console.error('Failed to save preference:', error);
        }
    };

    if (loading) return <div className="p-6 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your profile details, security preferences, and AI alert configurations.</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`border-b-[3px] pb-3 px-1 text-sm font-medium transition-colors ${activeTab === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {activeTab === 'My Profile' && (
                <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Update your photo and personal details here.</p>
                    </div>
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleProfileUpdate} className="space-y-8">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-white shadow-md uppercase">
                                    {profile.name.substring(0, 2) || 'AD'}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-3">
                                        <button type="button" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            Change photo
                                        </button>
                                        <button type="button" className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                                            Remove
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">JPG, GIF or PNG. 1MB Max.</p>
                                </div>
                            </div>

                            {/* Input Fields Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="full-name">Full Name</label>
                                    <input
                                        type="text"
                                        id="full-name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                            <span className="material-icons-outlined text-[20px]">mail</span>
                                        </span>
                                        <input
                                            type="email"
                                            id="email"
                                            value={profile.email}
                                            readOnly
                                            className="block w-full pl-10 rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 shadow-sm sm:text-sm py-2.5 text-slate-500"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Contact IT support to change your email address.</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="role">Role</label>
                                    <input
                                        type="text"
                                        id="role"
                                        value={profile.role}
                                        disabled
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 shadow-sm sm:text-sm py-2.5 text-slate-500 cursor-not-allowed capitalize"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            )}

            {activeTab === 'Security' && (
                <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Password & Security</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password and authentication methods.</p>
                        </div>
                        <span className="material-icons-outlined text-slate-300 text-4xl">lock</span>
                    </div>
                    <div className="p-6 md:p-8">
                        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="current-password">Current Password</label>
                                <input
                                    type="password"
                                    id="current-password"
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="new-password">New Password</label>
                                    <input
                                        type="password"
                                        id="new-password"
                                        placeholder="Enter new password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirm-password">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        placeholder="Confirm new password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                                    />
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                                <span className="material-icons-outlined text-blue-600 shrink-0">info</span>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <p className="font-medium text-slate-900 dark:text-white mb-1">Password Requirements</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Minimum of 6 characters</li>
                                        <li>Ideally use special characters (@$!%*?&)</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-start pt-2">
                                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    {saving ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            )}

            {activeTab === 'Notifications' && (
                <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Risk Analytics Preferences</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Configure how the AI alerts you to potential vendor risks.</p>
                    </div>
                    <div className="p-6">
                        {/* Toggle 1 */}
                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex gap-4">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 h-fit">
                                    <span className="material-icons-outlined">smart_toy</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">High-Risk Anomaly Detection</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">Receive immediate email alerts when the AI detects a risk score spike &gt; 85% for any active vendor.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.highRiskVendors}
                                    onChange={(e) => handlePreferenceUpdate('highRiskVendors', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* Toggle 2 */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex gap-4">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 h-fit">
                                    <span className="material-icons-outlined">email</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Email Alerts</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">Receive weekly summary reports and important notifications via email.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.emailAlerts}
                                    onChange={(e) => handlePreferenceUpdate('emailAlerts', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
