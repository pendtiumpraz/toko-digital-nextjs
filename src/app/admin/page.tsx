'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    subdomain: string;
  };
  subscription?: {
    plan: string;
    status: string;
  };
}

interface Store {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  isVerified: boolean;
  owner: {
    name: string;
    email: string;
  };
  analytics: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
}

interface BillingData {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  failedPayments: number;
  recentTransactions: Array<{
    id: string;
    storeId: string;
    storeName: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

interface Stats {
  totalUsers: number;
  activeStores: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Fetch data on component mount and tab change
  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stores') {
      fetchStores();
    } else if (activeTab === 'billing') {
      fetchBillingData();
    }
  }, [activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users?limit=20', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stores?limit=20', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
      } else {
        toast.error('Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error loading stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/billing', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setBillingData(data.data || data);
      } else {
        toast.error('Failed to fetch billing data');
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Error loading billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    setSelectedUserId(userId);
    try {
      const apiAction = action === 'deactivate' ? 'suspend' : 'activate';
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: apiAction,
          userId,
          reason: action === 'deactivate' ? 'Admin action from dashboard' : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || `User ${action}d successfully`);
        fetchUsers(); // Refresh users list
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Error ${action}ing user`);
    } finally {
      setSelectedUserId(null);
    }
  };

  const handleStoreAction = async (storeId: string, action: 'activate' | 'deactivate' | 'suspend') => {
    setSelectedStoreId(storeId);
    try {
      const response = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action,
          storeId,
          reason: action !== 'activate' ? 'Admin action from dashboard' : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || `Store ${action}d successfully`);
        fetchStores(); // Refresh stores list
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} store`);
      }
    } catch (error) {
      console.error(`Error ${action}ing store:`, error);
      toast.error(`Error ${action}ing store`);
    } finally {
      setSelectedStoreId(null);
    }
  };

  const handleViewStore = (store: Store) => {
    // For development, you might want to use localhost:3000
    // For production, use your actual domain
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://toko-digital.com';

    const storeUrl = `${baseUrl}/store/${store.subdomain}`;
    window.open(storeUrl, '_blank');

    // Alternative: Navigate in the same tab
    // router.push(`/store/${store.subdomain}`);
  };

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
                  <span className="text-green-600 text-sm">+{stats?.monthlyGrowth || 0}%</span>
                </div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
                  <span className="text-green-600 text-sm">+{stats?.monthlyGrowth || 0}%</span>
                </div>
                <p className="text-gray-500 text-sm">Active Stores</p>
                <p className="text-2xl font-bold">{stats?.activeStores?.toLocaleString() || 0}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <CreditCardIcon className="h-8 w-8 text-green-600" />
                  <span className="text-green-600 text-sm">+{stats?.monthlyGrowth || 0}%</span>
                </div>
                <p className="text-gray-500 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                  <span className="text-green-600 text-sm">99.9%</span>
                </div>
                <p className="text-gray-500 text-sm">System Health</p>
                <p className="text-2xl font-bold">98.5%</p>
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

            {/* System Status */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">System Status</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-gray-500">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24ms</div>
                    <div className="text-sm text-gray-500">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats?.activeStores || 0}</div>
                    <div className="text-sm text-gray-500">Active Stores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats?.totalUsers || 0}</div>
                    <div className="text-sm text-gray-500">Total Users</div>
                  </div>
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
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Users'}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading users...</p>
                </div>
              ) : (
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
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user.store ? user.store.name : 'No store'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {user.subscription?.plan || 'FREE'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {user.isActive ? (
                                <button
                                  onClick={() => handleUserAction(user.id, 'deactivate')}
                                  disabled={selectedUserId === user.id}
                                  className="flex items-center text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                                >
                                  {selectedUserId === user.id ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                  ) : (
                                    <XCircleIcon className="w-4 h-4 mr-1" />
                                  )}
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  disabled={selectedUserId === user.id}
                                  className="flex items-center text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                                >
                                  {selectedUserId === user.id ? (
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                  ) : (
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                  )}
                                  Activate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case 'stores':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Store Management</h2>
              <button
                onClick={fetchStores}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Stores'}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-2 text-gray-500">Loading stores...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">No stores found</p>
                  </div>
                ) : (
                  stores.map((store) => (
                    <div key={store.id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{store.name}</h3>
                          <p className="text-sm text-gray-500">{store.subdomain}.toko-digital.com</p>
                          <p className="text-xs text-gray-400 mt-1">Owner: {store.owner.name}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          store.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {store.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Products: {store.analytics.totalProducts}</p>
                        <p>Orders: {store.analytics.totalOrders}</p>
                        <p>Revenue: {formatPrice(store.analytics.totalRevenue)}</p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleViewStore(store)}
                          className="flex-1 flex items-center justify-center px-3 py-1 border rounded hover:bg-gray-50 text-sm"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>
                        {store.isActive ? (
                          <button
                            onClick={() => handleStoreAction(store.id, 'suspend')}
                            disabled={selectedStoreId === store.id}
                            className="flex-1 flex items-center justify-center px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50 text-sm disabled:opacity-50"
                          >
                            {selectedStoreId === store.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                            ) : (
                              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                            )}
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStoreAction(store.id, 'activate')}
                            disabled={selectedStoreId === store.id}
                            className="flex-1 flex items-center justify-center px-3 py-1 border border-green-300 text-green-700 rounded hover:bg-green-50 text-sm disabled:opacity-50"
                          >
                            {selectedStoreId === store.id ? (
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                            ) : (
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                            )}
                            Activate
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Billing & Subscriptions</h2>
              <button
                onClick={fetchBillingData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-2 text-gray-500">Loading billing data...</p>
              </div>
            ) : billingData ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold mb-2">Monthly Recurring Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">{formatPrice(billingData.revenue?.thisMonth || 0)}</p>
                    <p className="text-sm text-gray-500 mt-1">Current month</p>
                    {billingData.revenue?.growth && (
                      <p className={`text-sm mt-1 ${
                        billingData.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {billingData.revenue.growth >= 0 ? '+' : ''}{billingData.revenue.growth.toFixed(1)}% from last month
                      </p>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold">{formatPrice(billingData.revenue?.total || 0)}</p>
                    <p className="text-sm text-gray-500 mt-1">All time</p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold mb-2">Active Subscriptions</h3>
                    <p className="text-3xl font-bold text-blue-600">{billingData.subscriptions?.active || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Currently active</p>
                    {billingData.subscriptions?.conversionRate && (
                      <p className="text-sm text-gray-600 mt-1">
                        {billingData.subscriptions.conversionRate.toFixed(1)}% conversion rate
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Recent Payments</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subscription ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {billingData.recentPayments && billingData.recentPayments.length > 0 ? (
                          billingData.recentPayments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-4 py-3 text-sm font-mono">SUB-{payment.id.slice(-8)}</td>
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <p className="font-medium">{payment.userName}</p>
                                  <p className="text-xs text-gray-500">{payment.userEmail}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">{formatPrice(payment.amount)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  payment.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : payment.status === 'TRIAL'
                                    ? 'bg-blue-100 text-blue-800'
                                    : payment.status === 'EXPIRED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(payment.date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                              No recent payments found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load billing data</p>
              </div>
            )}
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
    <AdminLayout role="ADMIN">
      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
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
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </AdminLayout>
  );
}