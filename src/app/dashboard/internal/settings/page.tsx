'use client';

import { useState, useEffect } from 'react';

interface UserPreferences {
    emailAlerts: boolean;
    highRiskVendors: boolean;
    disputeUpdates: boolean;
    invoiceReminders: boolean;
    weeklyReports: boolean;
}

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    department: string | null;
    role: string;
    status: string;
    preferences: UserPreferences;
    createdAt: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
    });
    const [preferences, setPreferences] = useState<UserPreferences>({
        emailAlerts: true,
        highRiskVendors: true,
        disputeUpdates: true,
        invoiceReminders: false,
        weeklyReports: true,
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/user/settings');
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data.user);
                    setFormData({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        phone: data.user.phone || '',
                        department: data.user.department || '',
                    });
                    setPreferences(data.user.preferences);
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setUserData(data.user);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Preferences saved successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save preferences' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }
        setSaving(true);
        setMessage(null);
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
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'person' },
        { id: 'security', label: 'Security', icon: 'lock' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Loading your settings...</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
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
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <span className="material-icons-round text-xl">{tab.icon}</span>
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {message && (
                                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                                    'bg-red-100 text-red-700 border border-red-300'
                                    }`}>
                                    {message.text}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {message && (
                                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                                    'bg-red-100 text-red-700 border border-red-300'
                                    }`}>
                                    {message.text}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Change Password</h3>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={isPasswordVisible ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <span className="material-icons-round text-xl">
                                                    {isPasswordVisible ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type={isPasswordVisible ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type={isPasswordVisible ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Updating...' : 'Update Password'}
                                </button>
                                <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mt-6">
                                <span className="material-icons-round text-blue-600">info</span>
                                <div className="flex-1">
                                    <p className="text-sm text-blue-900 font-medium">Password Requirements</p>
                                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                        <li>• At least 8 characters long</li>
                                        <li>• Include uppercase and lowercase letters</li>
                                        <li>• Include at least one number</li>
                                        <li>• Include at least one special character</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            {message && (
                                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                                    'bg-red-100 text-red-700 border border-red-300'
                                    }`}>
                                    {message.text}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notification Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Email Alerts</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive email notifications for important updates</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.emailAlerts}
                                                onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">High-Risk Vendor Alerts</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Get notified when AI flags high-risk vendors</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.highRiskVendors}
                                                onChange={(e) => setPreferences({ ...preferences, highRiskVendors: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Dispute Updates</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Notifications about dispute status changes</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.disputeUpdates}
                                                onChange={(e) => setPreferences({ ...preferences, disputeUpdates: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Invoice Reminders</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Reminders for pending invoice reviews</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.invoiceReminders}
                                                onChange={(e) => setPreferences({ ...preferences, invoiceReminders: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Weekly Reports</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive weekly summary reports via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences.weeklyReports}
                                                onChange={(e) => setPreferences({ ...preferences, weeklyReports: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={handleSavePreferences}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </button>
                                <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* System Info */}
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Account Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-600 dark:text-slate-400">Role</p>
                        <p className="font-medium text-slate-900 dark:text-white">{userData?.role || 'Internal User'}</p>
                    </div>
                    <div>
                        <p className="text-slate-600 dark:text-slate-400">Account Status</p>
                        <p className="font-medium text-green-600">{userData?.status || 'Active'}</p>
                    </div>
                    <div>
                        <p className="text-slate-600 dark:text-slate-400">Last Login</p>
                        <p className="font-medium text-slate-900 dark:text-white">Today</p>
                    </div>
                    <div>
                        <p className="text-slate-600 dark:text-slate-400">Member Since</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
