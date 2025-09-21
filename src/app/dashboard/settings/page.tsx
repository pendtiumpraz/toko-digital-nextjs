'use client';

import { useState } from 'react';
import {
  UserCircleIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+62 812 3456 7890',
    avatar: ''
  });

  const [store, setStore] = useState({
    name: 'John Store',
    description: 'The best online store for quality products',
    subdomain: 'johnstore',
    customDomain: '',
    logo: '',
    favicon: '',
    address: 'Jl. Sudirman No. 123, Jakarta',
    whatsappNumber: '+62 812 3456 7890',
    email: 'store@johnstore.com',
    socialMedia: {
      instagram: '@johnstore',
      facebook: 'johnstore',
      twitter: '@johnstore'
    }
  });

  const [subscription, setSubscription] = useState({
    plan: 'Professional',
    status: 'active',
    nextBilling: '2024-02-20',
    amount: 299000,
    paymentMethod: 'Credit Card ****1234'
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailLowStock: true,
    emailNewCustomer: false,
    pushOrders: true,
    pushLowStock: true,
    whatsappOrders: true,
    whatsappPayment: true
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'store', label: 'Store', icon: BuildingStorefrontIcon },
    { id: 'subscription', label: 'Subscription', icon: CreditCardIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'domain', label: 'Domain', icon: GlobeAltIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
    { id: 'whatsapp', label: 'WhatsApp', icon: ChatBubbleLeftIcon },
    { id: 'api', label: 'API Keys', icon: KeyIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Profile Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Change Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'store':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Store Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={store.name}
                  onChange={(e) => setStore({ ...store, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain
                </label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={store.subdomain}
                    onChange={(e) => setStore({ ...store, subdomain: e.target.value })}
                  />
                  <span className="px-4 py-2 bg-gray-100 border border-l-0 rounded-r-lg">
                    .toko-digital.com
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={store.description}
                  onChange={(e) => setStore({ ...store, description: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Address
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  value={store.address}
                  onChange={(e) => setStore({ ...store, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={store.whatsappNumber}
                  onChange={(e) => setStore({ ...store, whatsappNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={store.email}
                  onChange={(e) => setStore({ ...store, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={store.socialMedia.instagram}
                    onChange={(e) => setStore({
                      ...store,
                      socialMedia: { ...store.socialMedia, instagram: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={store.socialMedia.facebook}
                    onChange={(e) => setStore({
                      ...store,
                      socialMedia: { ...store.socialMedia, facebook: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={store.socialMedia.twitter}
                    onChange={(e) => setStore({
                      ...store,
                      socialMedia: { ...store.socialMedia, twitter: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Subscription & Billing</h2>

            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {subscription.plan} Plan
                  </h3>
                  <p className="text-blue-700">
                    Status: <span className="font-medium capitalize">{subscription.status}</span>
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Next Billing Date</p>
                  <p className="font-semibold text-blue-900">{subscription.nextBilling}</p>
                </div>
                <div>
                  <p className="text-blue-600">Monthly Amount</p>
                  <p className="font-semibold text-blue-900">
                    Rp {subscription.amount.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600">Payment Method</p>
                  <p className="font-semibold text-blue-900">{subscription.paymentMethod}</p>
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upgrade Plan
                </button>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                  Change Payment Method
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Billing History</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 text-sm">2024-01-20</td>
                      <td className="px-4 py-3 text-sm">Professional Plan</td>
                      <td className="px-4 py-3 text-sm">Rp 299.000</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Paid</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-800">Download</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Notification Preferences</h2>

            <div>
              <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={notifications.emailOrders}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      emailOrders: e.target.checked
                    })}
                  />
                  <span className="ml-3">New orders</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={notifications.emailLowStock}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      emailLowStock: e.target.checked
                    })}
                  />
                  <span className="ml-3">Low stock alerts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={notifications.emailNewCustomer}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      emailNewCustomer: e.target.checked
                    })}
                  />
                  <span className="ml-3">New customer registration</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={notifications.pushOrders}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      pushOrders: e.target.checked
                    })}
                  />
                  <span className="ml-3">New orders</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={notifications.pushLowStock}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      pushLowStock: e.target.checked
                    })}
                  />
                  <span className="ml-3">Low stock alerts</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">WhatsApp Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={notifications.whatsappOrders}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      whatsappOrders: e.target.checked
                    })}
                  />
                  <span className="ml-3">Order confirmations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={notifications.whatsappPayment}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      whatsappPayment: e.target.checked
                    })}
                  />
                  <span className="ml-3">Payment reminders</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Security Settings</h2>

            <div>
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Password
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-w-md">
                <p className="text-sm text-gray-600 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Enable 2FA
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Login Sessions</h3>
              <div className="bg-white border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Windows - Chrome</p>
                      <p className="text-sm text-gray-500">Jakarta, Indonesia • Current session</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'domain':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Custom Domain</h2>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Custom domain feature is available for Professional and Enterprise plans only.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Domain
              </label>
              <div className="flex max-w-lg">
                <input
                  type="text"
                  placeholder="www.yourdomain.com"
                  className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={store.customDomain}
                  onChange={(e) => setStore({ ...store, customDomain: e.target.value })}
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700">
                  Verify Domain
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Point your domain DNS to our servers to activate custom domain.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">DNS Configuration</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-mono mb-2">A Record: 76.76.21.21</p>
                <p className="text-sm font-mono">CNAME: cname.toko-digital.com</p>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Store Appearance</h2>

            <div>
              <h3 className="text-lg font-medium mb-4">Theme Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-blue-500 rounded-lg p-4 cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded mb-3"></div>
                  <p className="font-medium">Modern Blue</p>
                  <p className="text-sm text-gray-500">Clean and professional</p>
                </div>
                <div className="border rounded-lg p-4 cursor-pointer hover:border-gray-400">
                  <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 rounded mb-3"></div>
                  <p className="font-medium">Nature Green</p>
                  <p className="text-sm text-gray-500">Fresh and organic</p>
                </div>
                <div className="border rounded-lg p-4 cursor-pointer hover:border-gray-400">
                  <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded mb-3"></div>
                  <p className="font-medium">Royal Purple</p>
                  <p className="text-sm text-gray-500">Elegant and luxurious</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Logo & Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Upload Logo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Upload Favicon
                    </button>
                    <p className="text-xs text-gray-500 mt-2">ICO, PNG 32x32px</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">WhatsApp Integration</h2>

            <div>
              <h3 className="text-lg font-medium mb-4">WhatsApp Business</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Business Number
                  </label>
                  <input
                    type="tel"
                    className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+62 812 3456 7890"
                    value={store.whatsappNumber}
                    onChange={(e) => setStore({ ...store, whatsappNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Message Template
                  </label>
                  <textarea
                    className="w-full max-w-lg px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Hi! Welcome to our store. How can we help you today?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Confirmation Template
                  </label>
                  <textarea
                    className="w-full max-w-lg px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Thank you for your order! We have received your order #[ORDER_ID]..."
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Quick Replies</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    className="flex-1 max-w-md px-4 py-2 border rounded-lg"
                    placeholder="Shortcut"
                  />
                  <input
                    type="text"
                    className="flex-1 max-w-md px-4 py-2 border rounded-lg"
                    placeholder="Message"
                  />
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">API Keys</h2>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Keep your API keys secure. Never share them publicly or commit them to version control.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Your API Keys</h3>
              <div className="space-y-3">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Production API Key</p>
                      <p className="text-sm text-gray-500 font-mono mt-1">sk_live_****************************7d8f</p>
                      <p className="text-xs text-gray-400 mt-2">Created on Jan 15, 2024</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Copy</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Revoke</button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Test API Key</p>
                      <p className="text-sm text-gray-500 font-mono mt-1">sk_test_****************************3a2c</p>
                      <p className="text-xs text-gray-400 mt-2">Created on Jan 10, 2024</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Copy</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Revoke</button>
                    </div>
                  </div>
                </div>
              </div>

              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Generate New API Key
              </button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Webhooks</h3>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Configure webhooks to receive real-time notifications about events in your store.
                </p>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Configure Webhooks
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and store preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {renderTabContent()}

            {/* Save Button */}
            <div className="mt-8 flex justify-end space-x-3">
              <button className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}