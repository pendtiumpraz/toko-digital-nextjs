'use client';

import { useState, useEffect } from 'react';
import {
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  PaintBrushIcon,
  TrashIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  KeyIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface SystemSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
  preferences: {
    theme: string;
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  targetType: string;
  createdAt: string;
}

interface SettingsData {
  profile: AdminProfile;
  systemSettings: SystemSettings;
  recentActivities: RecentActivity[];
}

export default function AdminSettingsPage() {
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState<SystemSettings['notifications']>({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    monthlyReports: true
  });
  const [securitySettings, setSecuritySettings] = useState<SystemSettings['security']>({
    twoFactorEnabled: false,
    sessionTimeout: 60,
    passwordExpiry: 90
  });
  const [preferences, setPreferences] = useState<SystemSettings['preferences']>({
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY'
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchSettingsData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSettingsData(data);

        // Update form states
        setProfileForm({
          name: data.profile.name,
          email: data.profile.email,
          phone: data.profile.phone
        });
        setNotificationSettings(data.systemSettings.notifications);
        setSecuritySettings(data.systemSettings.security);
        setPreferences(data.systemSettings.preferences);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const updateSettings = async (type: string, data: any) => {
    setActionLoading(type);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, data })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Settings updated successfully');

        if (type === 'profile' && result.profile) {
          setSettingsData(prev => prev ? { ...prev, profile: result.profile } : null);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Error updating settings');
    } finally {
      setActionLoading(null);
    }
  };

  const performAction = async (action: string) => {
    setActionLoading(action);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Error performing ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings('profile', profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    updateSettings('password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    // Clear form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !settingsData) {
    return (
      <AdminLayout role="ADMIN">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your admin profile and system preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'security', label: 'Security', icon: ShieldCheckIcon },
              { id: 'notifications', label: 'Notifications', icon: BellIcon },
              { id: 'preferences', label: 'Preferences', icon: PaintBrushIcon },
              { id: 'system', label: 'System', icon: CogIcon },
              { id: 'activity', label: 'Activity Log', icon: EyeIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {settingsData && (
          <>
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={settingsData.profile.role}
                          disabled
                          className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={actionLoading === 'profile'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === 'profile' ? 'Updating...' : 'Update Profile'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          minLength={8}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={actionLoading === 'password'}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <KeyIcon className="h-4 w-4" />
                        <span>{actionLoading === 'password' ? 'Updating...' : 'Change Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) => {
                          const newSettings = { ...securitySettings, twoFactorEnabled: e.target.checked };
                          setSecuritySettings(newSettings);
                          updateSettings('security', newSettings);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => {
                        const newSettings = { ...securitySettings, sessionTimeout: Number(e.target.value) };
                        setSecuritySettings(newSettings);
                        updateSettings('security', newSettings);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={480}>8 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <select
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => {
                        const newSettings = { ...securitySettings, passwordExpiry: Number(e.target.value) };
                        setSecuritySettings(newSettings);
                        updateSettings('security', newSettings);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                      <option value={365}>1 year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => {
                          const newSettings = { ...notificationSettings, emailNotifications: e.target.checked };
                          setNotificationSettings(newSettings);
                          updateSettings('notifications', newSettings);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => {
                          const newSettings = { ...notificationSettings, pushNotifications: e.target.checked };
                          setNotificationSettings(newSettings);
                          updateSettings('notifications', newSettings);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                      <p className="text-sm text-gray-500">Receive weekly summary reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyReports}
                        onChange={(e) => {
                          const newSettings = { ...notificationSettings, weeklyReports: e.target.checked };
                          setNotificationSettings(newSettings);
                          updateSettings('notifications', newSettings);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Monthly Reports</h4>
                      <p className="text-sm text-gray-500">Receive monthly summary reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.monthlyReports}
                        onChange={(e) => {
                          const newSettings = { ...notificationSettings, monthlyReports: e.target.checked };
                          setNotificationSettings(newSettings);
                          updateSettings('notifications', newSettings);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => performAction('send_test_notification')}
                      disabled={actionLoading === 'send_test_notification'}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <BellIcon className="h-4 w-4" />
                      <span>{actionLoading === 'send_test_notification' ? 'Sending...' : 'Send Test Notification'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => {
                        const newPreferences = { ...preferences, theme: e.target.value };
                        setPreferences(newPreferences);
                        updateSettings('preferences', newPreferences);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => {
                        const newPreferences = { ...preferences, language: e.target.value };
                        setPreferences(newPreferences);
                        updateSettings('preferences', newPreferences);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="id">Indonesian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => {
                        const newPreferences = { ...preferences, timezone: e.target.value };
                        setPreferences(newPreferences);
                        updateSettings('preferences', newPreferences);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => {
                        const newPreferences = { ...preferences, dateFormat: e.target.value };
                        setPreferences(newPreferences);
                        updateSettings('preferences', newPreferences);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => performAction('clear_cache')}
                      disabled={actionLoading === 'clear_cache'}
                      className="flex items-center justify-center space-x-2 p-4 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span>{actionLoading === 'clear_cache' ? 'Clearing...' : 'Clear Cache'}</span>
                    </button>

                    <button
                      onClick={() => performAction('backup_database')}
                      disabled={actionLoading === 'backup_database'}
                      className="flex items-center justify-center space-x-2 p-4 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
                    >
                      <CloudArrowDownIcon className="h-5 w-5" />
                      <span>{actionLoading === 'backup_database' ? 'Creating...' : 'Backup Database'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="text-sm font-medium text-yellow-800">System Information</h4>
                  </div>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>System actions should be performed with caution. Make sure to backup your data before performing any system-level operations.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {settingsData.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                          <EyeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Action: {activity.action.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              Target: {activity.targetType}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}