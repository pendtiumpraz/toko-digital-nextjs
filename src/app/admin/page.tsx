'use client';

import { useState } from 'react';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BellIcon,
  CommandLineIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalUsers: 1234,
    activeStores: 856,
    totalRevenue: 125650000,
    monthlyGrowth: 23.5,
    systemHealth: 98.5,
    activeSubscriptions: 743,
    pendingIssues: 12,
    serverUptime: 99.9
  };

  const recentActivity = [
    { id: 1, type: 'new_user', message: 'New user registered: john@example.com', time: '2 minutes ago' },
    { id: 2, type: 'new_store', message: 'New store created: Fashion Hub', time: '15 minutes ago' },
    { id: 3, type: 'payment', message: 'Payment received from Store #234', time: '1 hour ago' },
    { id: 4, type: 'issue', message: 'Support ticket #567 resolved', time: '2 hours ago' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(price);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                  <span className="text-green-600 text-sm">+12.5%</span>
                </div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
                  <span className="text-green-600 text-sm">+8.3%</span>
                </div>
                <p className="text-gray-500 text-sm">Active Stores</p>
                <p className="text-2xl font-bold">{stats.activeStores.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <CreditCardIcon className="h-8 w-8 text-green-600" />
                  <span className="text-green-600 text-sm">+{stats.monthlyGrowth}%</span>
                </div>
                <p className="text-gray-500 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                  <span className="text-green-600 text-sm">{stats.serverUptime}%</span>
                </div>
                <p className="text-gray-500 text-sm">System Health</p>
                <p className="text-2xl font-bold">{stats.systemHealth}%</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">User growth chart placeholder</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">Revenue trend chart placeholder</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${
                          activity.type === 'issue' ? 'bg-red-500' :
                          activity.type === 'payment' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}></div>
                        <p className="text-sm">{activity.message}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export Users
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium">User {i}</p>
                          <p className="text-sm text-gray-500">user{i}@example.com</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">Store {i}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Professional
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">Jan {i}, 2024</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'stores':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Store Management</h2>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Search stores..."
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Store {i}</h3>
                      <p className="text-sm text-gray-500">store{i}.toko-digital.com</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Products: {Math.floor(Math.random() * 100)}</p>
                    <p>Orders: {Math.floor(Math.random() * 500)}</p>
                    <p>Revenue: {formatPrice(Math.random() * 10000000)}</p>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button className="flex-1 px-3 py-1 border rounded hover:bg-gray-50 text-sm">
                      View
                    </button>
                    <button className="flex-1 px-3 py-1 border rounded hover:bg-gray-50 text-sm">
                      Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Billing & Subscriptions</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Monthly Recurring Revenue</h3>
                <p className="text-3xl font-bold text-green-600">{formatPrice(89500000)}</p>
                <p className="text-sm text-gray-500 mt-1">+15.2% from last month</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Active Subscriptions</h3>
                <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-sm text-gray-500 mt-1">92% retention rate</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Failed Payments</h3>
                <p className="text-3xl font-bold text-red-600">23</p>
                <p className="text-sm text-gray-500 mt-1">Requires attention</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-sm font-mono">TRX-2024-{1000 + i}</td>
                        <td className="px-4 py-3 text-sm">Store {i}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatPrice(299000)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Success
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">Jan {20 - i}, 2024</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg"
                      defaultValue="Toko Digital"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg"
                      defaultValue="support@toko-digital.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Language
                    </label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Indonesian</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                    <span className="ml-2 text-sm">Require 2FA for admin accounts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                    <span className="ml-2 text-sm">Enable rate limiting</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                    <span className="ml-2 text-sm">Maintenance mode</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session timeout (minutes)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-lg"
                      defaultValue="60"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input type="number" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                  <input type="password" className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <BellIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">A</span>
                </div>
                <span className="text-sm font-medium">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen sticky top-0">
          <nav className="p-4 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'users', label: 'Users', icon: UsersIcon },
              { id: 'stores', label: 'Stores', icon: BuildingStorefrontIcon },
              { id: 'billing', label: 'Billing', icon: CreditCardIcon },
              { id: 'settings', label: 'Settings', icon: CogIcon }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="font-medium">Security</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
                <DocumentTextIcon className="h-5 w-5" />
                <span className="font-medium">Logs</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
                <CommandLineIcon className="h-5 w-5" />
                <span className="font-medium">API</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}