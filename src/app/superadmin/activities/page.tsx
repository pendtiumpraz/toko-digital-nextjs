'use client';

import { useState, useEffect } from 'react';
import {
  UserIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';

interface Activity {
  id: string;
  type: 'USER_REGISTRATION' | 'STORE_CREATED' | 'PAYMENT_RECEIVED' | 'ADMIN_ACTION' | 'SYSTEM_ERROR' | 'LOGIN' | 'LOGOUT';
  userId?: string;
  userName?: string;
  userEmail?: string;
  storeId?: string;
  storeName?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    type: 'all',
    dateRange: 'today',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchActivities();
  }, [filter, pagination.page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        type: filter.type,
        dateRange: filter.dateRange,
        search: filter.search
      });

      const response = await fetch(`/api/superadmin/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
      // Mock data for development
      setActivities([
        {
          id: '1',
          type: 'USER_REGISTRATION',
          userId: 'user-123',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          description: 'User registered with email john@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'STORE_CREATED',
          userId: 'user-123',
          userName: 'John Doe',
          storeId: 'store-456',
          storeName: 'John\'s Store',
          description: 'Created new store: John\'s Store',
          ipAddress: '192.168.1.1',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          type: 'PAYMENT_RECEIVED',
          userId: 'user-789',
          userName: 'Jane Smith',
          storeId: 'store-101',
          storeName: 'Jane\'s Shop',
          description: 'Payment received for Professional subscription',
          metadata: { amount: 299000, currency: 'IDR', planType: 'professional' },
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          type: 'ADMIN_ACTION',
          userId: 'admin-1',
          userName: 'Super Admin',
          description: 'Suspended user account for policy violation',
          metadata: { targetUserId: 'user-999', reason: 'spam' },
          ipAddress: '10.0.0.1',
          timestamp: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '5',
          type: 'SYSTEM_ERROR',
          description: 'Database connection timeout in payment processing',
          metadata: { errorCode: 'DB_TIMEOUT', service: 'payment-service' },
          timestamp: new Date(Date.now() - 14400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportActivities = async () => {
    try {
      const params = new URLSearchParams({
        type: filter.type,
        dateRange: filter.dateRange,
        search: filter.search,
        format: 'csv'
      });

      const response = await fetch(`/api/superadmin/activities/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export activities');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activities-${filter.dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting activities:', error);
      alert('Failed to export activities');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTRATION':
      case 'LOGIN':
      case 'LOGOUT':
        return <UserIcon className="h-5 w-5 text-blue-600" />;
      case 'STORE_CREATED':
        return <BuildingStorefrontIcon className="h-5 w-5 text-green-600" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCardIcon className="h-5 w-5 text-purple-600" />;
      case 'ADMIN_ACTION':
        return <ShieldCheckIcon className="h-5 w-5 text-orange-600" />;
      case 'SYSTEM_ERROR':
        return <ClockIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'USER_REGISTRATION':
      case 'LOGIN':
        return 'bg-blue-50 border-blue-200';
      case 'STORE_CREATED':
        return 'bg-green-50 border-green-200';
      case 'PAYMENT_RECEIVED':
        return 'bg-purple-50 border-purple-200';
      case 'ADMIN_ACTION':
        return 'bg-orange-50 border-orange-200';
      case 'SYSTEM_ERROR':
        return 'bg-red-50 border-red-200';
      case 'LOGOUT':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Activities</h1>
            <p className="text-gray-600 mt-1">Monitor all system activities and user actions</p>
          </div>
          <button
            onClick={exportActivities}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Activities
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type
              </label>
              <select
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="USER_REGISTRATION">User Registration</option>
                <option value="STORE_CREATED">Store Created</option>
                <option value="PAYMENT_RECEIVED">Payment Received</option>
                <option value="ADMIN_ACTION">Admin Action</option>
                <option value="SYSTEM_ERROR">System Error</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, store, or description..."
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading activities...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <ClockIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchActivities}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No activities found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`border rounded-lg p-4 ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {formatActivityType(activity.type)}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {activity.userName && (
                              <span>User: {activity.userName}</span>
                            )}
                            {activity.userEmail && (
                              <span>Email: {activity.userEmail}</span>
                            )}
                            {activity.storeName && (
                              <span>Store: {activity.storeName}</span>
                            )}
                            {activity.ipAddress && (
                              <span>IP: {activity.ipAddress}</span>
                            )}
                          </div>
                          {activity.metadata && (
                            <div className="mt-2">
                              <details className="text-xs">
                                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                                  View metadata
                                </summary>
                                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(activity.metadata, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} activities
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
          )}
        </div>
      </div>
    </AdminLayout>
  );
}