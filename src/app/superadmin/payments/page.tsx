'use client';

import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  averageTransactionValue: number;
  activeSubscriptions: number;
  churnRate: number;
}

interface Payment {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  storeId?: string;
  storeName?: string;
  amount: number;
  currency: string;
  type: 'SUBSCRIPTION' | 'ONE_TIME' | 'REFUND';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'EWALLET' | 'VIRTUAL_ACCOUNT';
  provider: 'STRIPE' | 'MIDTRANS' | 'XENDIT' | 'PAYPAL';
  description: string;
  metadata?: Record<string, any>;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscriptions'>('overview');
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    provider: 'all',
    dateRange: 'month',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchData();
  }, [filter, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Mock data for development
      setStats({
        totalRevenue: 2456780000,
        monthlyRevenue: 345600000,
        revenueGrowth: 23.5,
        totalTransactions: 15432,
        successfulTransactions: 14891,
        failedTransactions: 421,
        refundedTransactions: 120,
        averageTransactionValue: 159200,
        activeSubscriptions: 743,
        churnRate: 3.2
      });

      setPayments([
        {
          id: '1',
          transactionId: 'TXN-2024-001234',
          userId: 'user-123',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          storeId: 'store-456',
          storeName: 'John\'s Store',
          amount: 299000,
          currency: 'IDR',
          type: 'SUBSCRIPTION',
          status: 'COMPLETED',
          paymentMethod: 'CREDIT_CARD',
          provider: 'STRIPE',
          description: 'Professional Plan - Monthly Subscription',
          metadata: { planType: 'professional', billingCycle: 'monthly' },
          paidAt: '2024-01-16T10:30:00Z',
          createdAt: '2024-01-16T10:25:00Z',
          updatedAt: '2024-01-16T10:30:00Z'
        },
        {
          id: '2',
          transactionId: 'TXN-2024-001235',
          userId: 'user-456',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          amount: 150000,
          currency: 'IDR',
          type: 'ONE_TIME',
          status: 'FAILED',
          paymentMethod: 'BANK_TRANSFER',
          provider: 'MIDTRANS',
          description: 'Store Setup Fee',
          createdAt: '2024-01-16T11:00:00Z',
          updatedAt: '2024-01-16T11:05:00Z'
        },
        {
          id: '3',
          transactionId: 'TXN-2024-001236',
          userId: 'user-789',
          userName: 'Bob Wilson',
          userEmail: 'bob@example.com',
          storeId: 'store-789',
          storeName: 'Bob\'s Electronics',
          amount: 199000,
          currency: 'IDR',
          type: 'SUBSCRIPTION',
          status: 'PROCESSING',
          paymentMethod: 'VIRTUAL_ACCOUNT',
          provider: 'XENDIT',
          description: 'Basic Plan - Monthly Subscription',
          metadata: { planType: 'basic', billingCycle: 'monthly' },
          createdAt: '2024-01-16T12:00:00Z',
          updatedAt: '2024-01-16T12:00:00Z'
        }
      ]);

      setPagination(prev => ({
        ...prev,
        total: 3,
        totalPages: 1
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = async () => {
    try {
      const params = new URLSearchParams({
        ...filter,
        format: 'csv'
      });

      const response = await fetch(`/api/superadmin/payments/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export payments');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${filter.dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting payments:', error);
      alert('Failed to export payments');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'PROCESSING':
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'FAILED':
      case 'CANCELLED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'REFUNDED':
        return <ArrowUpIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'STRIPE':
        return 'bg-purple-100 text-purple-800';
      case 'MIDTRANS':
        return 'bg-blue-100 text-blue-800';
      case 'XENDIT':
        return 'bg-green-100 text-green-800';
      case 'PAYPAL':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
            <p className="text-gray-600 mt-1">Monitor transactions, subscriptions, and revenue</p>
          </div>
          <button
            onClick={exportPayments}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Payments
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'transactions', label: 'Transactions', icon: CreditCardIcon },
              { id: 'subscriptions', label: 'Subscriptions', icon: BanknotesIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    {stats.revenueGrowth}% this month
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <CreditCardIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">
                    Avg: {formatCurrency(stats.averageTransactionValue)}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(stats.totalTransactions)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className="text-green-600 font-medium">
                      {formatNumber(stats.successfulTransactions)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="text-red-600 font-medium">
                      {formatNumber(stats.failedTransactions)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <BanknotesIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(stats.activeSubscriptions)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">
                    Churn Rate: {stats.churnRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">Revenue chart placeholder</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">Payment methods chart placeholder</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="SUBSCRIPTION">Subscription</option>
                    <option value="ONE_TIME">One Time</option>
                    <option value="REFUND">Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <select
                    value={filter.provider}
                    onChange={(e) => setFilter(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Providers</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="MIDTRANS">Midtrans</option>
                    <option value="XENDIT">Xendit</option>
                    <option value="PAYPAL">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filter.dateRange}
                    onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={filter.search}
                      onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.transactionId}</p>
                            <p className="text-sm text-gray-500">{payment.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.userName}</p>
                            <p className="text-sm text-gray-500">{payment.userEmail}</p>
                            {payment.storeName && (
                              <p className="text-xs text-blue-600">{payment.storeName}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <p className="text-xs text-gray-500">{payment.paymentMethod.replace('_', ' ')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {payment.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(payment.status)}
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getProviderColor(payment.provider)}`}>
                            {payment.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {formatDate(payment.paidAt || payment.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} transactions
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Subscription Management</h2>
            <div className="text-center py-12">
              <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Subscription management features coming soon</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}