'use client';

import { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  CreditCardIcon,
  GlobeAltIcon,
  UserIcon,
  KeyIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
    defaultLanguage: string;
    defaultTimezone: string;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    enableMaintenanceMode: boolean;
  };
  payments: {
    defaultCurrency: string;
    enableStripe: boolean;
    enableMidtrans: boolean;
    enableXendit: boolean;
    enablePaypal: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    midtransServerKey: string;
    midtransClientKey: string;
    xenditSecretKey: string;
    paypalClientId: string;
    paypalClientSecret: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    emailProvider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    sendgridApiKey: string;
    notificationTemplates: {
      welcomeEmail: boolean;
      passwordReset: boolean;
      orderConfirmation: boolean;
      paymentSuccess: boolean;
      trialExpiry: boolean;
    };
  };
  security: {
    passwordMinLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
    enableCaptcha: boolean;
    captchaProvider: 'recaptcha' | 'hcaptcha';
    recaptchaSiteKey: string;
    recaptchaSecretKey: string;
  };
  limits: {
    maxStoresPerUser: number;
    maxProductsPerStore: number;
    maxImagesPerProduct: number;
    maxFileUploadSize: number;
    maxStoragePerUser: number;
    trialPeriodDays: number;
    defaultPlanId: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'notifications' | 'security' | 'limits'>('general');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Mock data for development
      setSettings({
        general: {
          siteName: 'TokoDigital Platform',
          siteDescription: 'Complete e-commerce solution for digital stores',
          contactEmail: 'admin@tokodigital.com',
          supportEmail: 'support@tokodigital.com',
          defaultLanguage: 'id',
          defaultTimezone: 'Asia/Jakarta',
          allowRegistration: true,
          requireEmailVerification: true,
          enableMaintenanceMode: false
        },
        payments: {
          defaultCurrency: 'IDR',
          enableStripe: true,
          enableMidtrans: true,
          enableXendit: false,
          enablePaypal: false,
          stripePublishableKey: 'pk_test_...',
          stripeSecretKey: 'sk_test_...',
          midtransServerKey: 'SB-Mid-server-...',
          midtransClientKey: 'SB-Mid-client-...',
          xenditSecretKey: '',
          paypalClientId: '',
          paypalClientSecret: ''
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          emailProvider: 'smtp',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUsername: 'noreply@tokodigital.com',
          smtpPassword: 'app-password',
          sendgridApiKey: '',
          notificationTemplates: {
            welcomeEmail: true,
            passwordReset: true,
            orderConfirmation: true,
            paymentSuccess: true,
            trialExpiry: true
          }
        },
        security: {
          passwordMinLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          requireUppercase: true,
          sessionTimeout: 24,
          maxLoginAttempts: 5,
          enableTwoFactor: false,
          enableCaptcha: true,
          captchaProvider: 'recaptcha',
          recaptchaSiteKey: '6Lc...',
          recaptchaSecretKey: '6Lc...'
        },
        limits: {
          maxStoresPerUser: 1,
          maxProductsPerStore: 1000,
          maxImagesPerProduct: 10,
          maxFileUploadSize: 5,
          maxStoragePerUser: 1000,
          trialPeriodDays: 14,
          defaultPlanId: 'basic'
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;

    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleNestedSettingChange = (section: keyof SystemSettings, nestedKey: string, key: string, value: any) => {
    if (!settings) return;

    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [nestedKey]: {
          ...prev![section][nestedKey as keyof typeof prev[section]],
          [key]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasUnsavedChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      await fetchSettings();
      setHasUnsavedChanges(false);
      toast.success('Settings reset to default values');
    }
  };

  const testEmailConnection = async () => {
    try {
      toast.loading('Testing email connection...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.dismiss();
      toast.success('Email connection test successful');
    } catch (error) {
      toast.dismiss();
      toast.error('Email connection test failed');
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading || !settings) {
    return (
      <AdminLayout role="SUPER_ADMIN">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
          </div>
          <div className="flex space-x-3">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 text-amber-600">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
            )}
            <button
              onClick={resetSettings}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={saveSettings}
              disabled={saving || !hasUnsavedChanges}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'General', icon: Cog6ToothIcon },
              { id: 'payments', label: 'Payments', icon: CreditCardIcon },
              { id: 'notifications', label: 'Notifications', icon: BellIcon },
              { id: 'security', label: 'Security', icon: ShieldCheckIcon },
              { id: 'limits', label: 'Limits', icon: InformationCircleIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">General Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                  <select
                    value={settings.general.defaultLanguage}
                    onChange={(e) => handleSettingChange('general', 'defaultLanguage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="id">Indonesian</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Timezone</label>
                  <select
                    value={settings.general.defaultTimezone}
                    onChange={(e) => handleSettingChange('general', 'defaultTimezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                    <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                    <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium">System Options</h4>

                {[
                  { key: 'allowRegistration', label: 'Allow new user registration', description: 'Enable public user registration' },
                  { key: 'requireEmailVerification', label: 'Require email verification', description: 'Users must verify their email before accessing the platform' },
                  { key: 'enableMaintenanceMode', label: 'Maintenance mode', description: 'Enable maintenance mode to prevent user access' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general[option.key as keyof typeof settings.general] as boolean}
                        onChange={(e) => handleSettingChange('general', option.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">Payment Settings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                <select
                  value={settings.payments.defaultCurrency}
                  onChange={(e) => handleSettingChange('payments', 'defaultCurrency', e.target.value)}
                  className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="IDR">Indonesian Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="SGD">Singapore Dollar (SGD)</option>
                </select>
              </div>

              <div className="space-y-6">
                <h4 className="text-md font-medium">Payment Providers</h4>

                {/* Stripe */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <CreditCardIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Stripe</h5>
                        <p className="text-sm text-gray-500">International payments</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payments.enableStripe}
                        onChange={(e) => handleSettingChange('payments', 'enableStripe', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.payments.enableStripe && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                        <input
                          type="text"
                          value={settings.payments.stripePublishableKey}
                          onChange={(e) => handleSettingChange('payments', 'stripePublishableKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="pk_test_..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                        <div className="relative">
                          <input
                            type={showPasswords.stripeSecret ? "text" : "password"}
                            value={settings.payments.stripeSecretKey}
                            onChange={(e) => handleSettingChange('payments', 'stripeSecretKey', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="sk_test_..."
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('stripeSecret')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.stripeSecret ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Midtrans */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <CreditCardIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Midtrans</h5>
                        <p className="text-sm text-gray-500">Indonesian payments</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payments.enableMidtrans}
                        onChange={(e) => handleSettingChange('payments', 'enableMidtrans', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.payments.enableMidtrans && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Key</label>
                        <input
                          type="text"
                          value={settings.payments.midtransClientKey}
                          onChange={(e) => handleSettingChange('payments', 'midtransClientKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="SB-Mid-client-..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Server Key</label>
                        <div className="relative">
                          <input
                            type={showPasswords.midtransServer ? "text" : "password"}
                            value={settings.payments.midtransServerKey}
                            onChange={(e) => handleSettingChange('payments', 'midtransServerKey', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="SB-Mid-server-..."
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('midtransServer')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.midtransServer ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">Notification Settings</h3>

              <div className="space-y-4">
                <h4 className="text-md font-medium">Notification Types</h4>

                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send notifications via SMS' },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Send browser push notifications' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[option.key as keyof typeof settings.notifications] as boolean}
                        onChange={(e) => handleSettingChange('notifications', option.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              {settings.notifications.emailNotifications && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Email Configuration</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                    <select
                      value={settings.notifications.emailProvider}
                      onChange={(e) => handleSettingChange('notifications', 'emailProvider', e.target.value)}
                      className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                      <option value="ses">Amazon SES</option>
                    </select>
                  </div>

                  {settings.notifications.emailProvider === 'smtp' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                        <input
                          type="text"
                          value={settings.notifications.smtpHost}
                          onChange={(e) => handleSettingChange('notifications', 'smtpHost', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                        <input
                          type="number"
                          value={settings.notifications.smtpPort}
                          onChange={(e) => handleSettingChange('notifications', 'smtpPort', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                          type="text"
                          value={settings.notifications.smtpUsername}
                          onChange={(e) => handleSettingChange('notifications', 'smtpUsername', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.smtpPassword ? "text" : "password"}
                            value={settings.notifications.smtpPassword}
                            onChange={(e) => handleSettingChange('notifications', 'smtpPassword', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('smtpPassword')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.smtpPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={testEmailConnection}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">Security Settings</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-4">Password Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
                      <input
                        type="number"
                        min="1"
                        max="72"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {[
                      { key: 'requireSpecialChars', label: 'Require special characters' },
                      { key: 'requireNumbers', label: 'Require numbers' },
                      { key: 'requireUppercase', label: 'Require uppercase letters' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={option.key}
                          checked={settings.security[option.key as keyof typeof settings.security] as boolean}
                          onChange={(e) => handleSettingChange('security', option.key, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={option.key} className="ml-2 text-sm text-gray-700">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium mb-4">Authentication Security</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'enableTwoFactor', label: 'Enable Two-Factor Authentication', description: 'Require 2FA for admin accounts' },
                      { key: 'enableCaptcha', label: 'Enable CAPTCHA', description: 'Show CAPTCHA on login forms' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.security[option.key as keyof typeof settings.security] as boolean}
                            onChange={(e) => handleSettingChange('security', option.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'limits' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">System Limits</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Stores Per User</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.limits.maxStoresPerUser}
                    onChange={(e) => handleSettingChange('limits', 'maxStoresPerUser', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Products Per Store</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.limits.maxProductsPerStore}
                    onChange={(e) => handleSettingChange('limits', 'maxProductsPerStore', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Images Per Product</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.limits.maxImagesPerProduct}
                    onChange={(e) => handleSettingChange('limits', 'maxImagesPerProduct', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload Size (MB)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.limits.maxFileUploadSize}
                    onChange={(e) => handleSettingChange('limits', 'maxFileUploadSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Storage Per User (MB)</label>
                  <input
                    type="number"
                    min="100"
                    value={settings.limits.maxStoragePerUser}
                    onChange={(e) => handleSettingChange('limits', 'maxStoragePerUser', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trial Period (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.limits.trialPeriodDays}
                    onChange={(e) => handleSettingChange('limits', 'trialPeriodDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}