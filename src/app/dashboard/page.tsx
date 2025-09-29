'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface UserStore {
  subdomain?: string;
  name?: string;
  id?: string;
}

interface DashboardStats {
  totalRevenue: {
    value: string;
    change: string;
    trend: 'up' | 'down';
    rawValue: number;
  };
  totalOrders: {
    value: string;
    change: string;
    trend: 'up' | 'down';
    rawValue: number;
  };
  totalCustomers: {
    value: string;
    change: string;
    trend: 'up' | 'down';
    rawValue: number;
  };
  conversionRate: {
    value: string;
    change: string;
    trend: 'up' | 'down';
    rawValue: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    total: string;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    name: string;
    sold: number;
    revenue: number;
    stock: number;
  }>;
}

interface LoadingState {
  stats: boolean;
  charts: boolean;
}

interface ErrorState {
  stats: string | null;
  charts: string | null;
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [userStore, setUserStore] = useState<UserStore | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    stats: true,
    charts: true
  });
  const [error, setError] = useState<ErrorState>({
    stats: null,
    charts: null
  });

  useEffect(() => {
    // Get user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserStore(user.store);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));

      const response = await fetch(`/api/dashboard/stats?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setDashboardStats(data);
    } catch (err) {
      setError(prev => ({ ...prev, stats: err instanceof Error ? err.message : 'Failed to load dashboard stats' }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Create stats array from dashboardStats
  const stats = dashboardStats ? [
    {
      name: 'Total Revenue',
      value: dashboardStats.totalRevenue.value,
      change: dashboardStats.totalRevenue.change,
      trend: dashboardStats.totalRevenue.trend,
      icon: CurrencyDollarIcon
    },
    {
      name: 'Total Orders',
      value: dashboardStats.totalOrders.value,
      change: dashboardStats.totalOrders.change,
      trend: dashboardStats.totalOrders.trend,
      icon: ShoppingBagIcon
    },
    {
      name: 'Total Customers',
      value: dashboardStats.totalCustomers.value,
      change: dashboardStats.totalCustomers.change,
      trend: dashboardStats.totalCustomers.trend,
      icon: UserGroupIcon
    },
    {
      name: 'Conversion Rate',
      value: dashboardStats.conversionRate.value,
      change: dashboardStats.conversionRate.change,
      trend: dashboardStats.conversionRate.trend,
      icon: ChartBarIcon
    },
  ] : [];

  const recentOrders = dashboardStats?.recentOrders || [];
  const topProducts = dashboardStats?.topProducts || [];

  // Format currency for top products
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          {/* View Store Button */}
          {userStore && (
            <Link
              href={`/store/${userStore.subdomain || 'toko-praz'}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <GlobeAltIcon className="h-5 w-5" />
              <span>Lihat Toko</span>
            </Link>
          )}
        </div>

        {/* Period Selector */}
        <select
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="border-gray-300 rounded-md text-sm px-3 py-2 bg-white shadow-sm"
          disabled={loading.stats}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
        {/* Enhanced Stats Grid */}
        {error.stats ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading statistics</h3>
                <p className="text-sm text-red-600">{error.stats}</p>
              </div>
              <button
                onClick={fetchDashboardStats}
                className="ml-auto px-3 py-2 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading.stats ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-500/10 p-6 border border-white/20 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gray-200 w-16 h-16"></div>
                    <div className="px-2 py-1 rounded-full bg-gray-200 w-16 h-6"></div>
                  </div>
                  <div>
                    <div className="h-8 bg-gray-200 rounded mb-2 w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))
            ) : (
              stats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${
                      stat.name.includes('Revenue') ? 'bg-gradient-to-br from-green-100 to-green-200' :
                      stat.name.includes('Orders') ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                      stat.name.includes('Customers') ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
                      'bg-gradient-to-br from-yellow-100 to-yellow-200'
                    }`}>
                      <stat.icon className={`h-7 w-7 ${
                        stat.name.includes('Revenue') ? 'text-green-600' :
                        stat.name.includes('Orders') ? 'text-blue-600' :
                        stat.name.includes('Customers') ? 'text-purple-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                      stat.trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600 font-medium">{stat.name}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Enhanced Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-500/10 p-8 border border-white/20"
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Revenue Overview</h2>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center border border-blue-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 font-medium">Interactive Chart Coming Soon</p>
                <p className="text-sm text-gray-500 mt-1">Revenue analytics will be displayed here</p>
              </div>
            </div>
          </motion.div>

          {/* Order Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-500/10 p-8 border border-white/20"
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Order Status</h2>
            <div className="h-64 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl flex items-center justify-center border border-green-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 font-medium">Order Analytics Coming Soon</p>
                <p className="text-sm text-gray-500 mt-1">Order distribution charts will be displayed here</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading.stats ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        </td>
                      </tr>
                    ))
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                <Link href="/dashboard/products" className="text-sm text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading.stats ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </td>
                      </tr>
                    ))
                  ) : topProducts.length > 0 ? (
                    topProducts.map((product) => (
                      <tr key={product.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${
                            product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-500'
                          }`}>
                            {product.stock}
                            {product.stock < 10 && ' (Low)'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No products data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/products/new" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <div className="text-gray-600">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add Product</span>
              </div>
            </Link>
            <Link href="/dashboard/orders" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <div className="text-gray-600">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm font-medium">View Orders</span>
              </div>
            </Link>
            <Link href="/dashboard/analytics" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <div className="text-gray-600">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium">Analytics</span>
              </div>
            </Link>
            <Link href="/dashboard/customers" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <div className="text-gray-600">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Customers</span>
              </div>
            </Link>
          </div>
        </div>
    </DashboardLayout>
  );
}