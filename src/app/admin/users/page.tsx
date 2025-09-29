'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
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
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  trialEndDate: string;
  lastLogin?: string;
  store?: {
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    totalOrders: number;
    totalRevenue: number;
  };
  subscription?: {
    plan: string;
    status: string;
    trialEndDate: string;
    endDate?: string;
  };
}

interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  role: 'all' | 'STORE_OWNER' | 'CUSTOMER';
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    role: 'all'
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.role !== 'all' && { role: filters.role })
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setPagination(data.pagination);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [filters]);

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend') => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action,
          userId,
          reason: action === 'suspend' ? 'Suspended from admin panel' : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchUsers(pagination.page);
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Error ${action}ing user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(price);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'STORE_OWNER':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrialStatus = (user: User) => {
    if (user.subscription?.status === 'ACTIVE') {
      return { text: 'Subscribed', color: 'text-green-600' };
    }

    const trialEnd = new Date(user.trialEndDate);
    const now = new Date();

    if (trialEnd < now) {
      return { text: 'Trial Expired', color: 'text-red-600' };
    }

    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) {
      return { text: `${daysLeft} days left`, color: 'text-orange-600' };
    }

    return { text: `${daysLeft} days left`, color: 'text-green-600' };
  };

  return (
    <AdminLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Total: {pagination.total} users
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as any }))}
            >
              <option value="all">All Roles</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="CUSTOMER">Customer</option>
            </select>

            <button
              onClick={() => fetchUsers(1)}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trial Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => {
                      const trialStatus = getTrialStatus(user);

                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                                  {user.role.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.store ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.store.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.store.subdomain}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No store</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? (
                                <>
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircleIcon className="h-3 w-3 mr-1" />
                                  Suspended
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${trialStatus.color}`}>
                              {trialStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>

                            {user.isActive ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                disabled={actionLoading === user.id}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, 'activate')}
                                disabled={actionLoading === user.id}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchUsers(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 border rounded bg-blue-50 text-blue-600">
                        {pagination.page}
                      </span>
                      <button
                        onClick={() => fetchUsers(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages || loading}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <p className="text-sm text-gray-900">{selectedUser.role.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className={`text-sm font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                {selectedUser.store && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Store Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Store Name</label>
                        <p className="text-sm text-gray-900">{selectedUser.store.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Subdomain</label>
                        <p className="text-sm text-gray-900">{selectedUser.store.subdomain}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Orders</label>
                        <p className="text-sm text-gray-900">{selectedUser.store.totalOrders}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Revenue</label>
                        <p className="text-sm text-gray-900">{formatPrice(selectedUser.store.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.subscription && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Subscription Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Plan</label>
                        <p className="text-sm text-gray-900">{selectedUser.subscription.plan}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <p className="text-sm text-gray-900">{selectedUser.subscription.status}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Trial End</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.subscription.trialEndDate)}</p>
                      </div>
                      {selectedUser.subscription.endDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Subscription End</label>
                          <p className="text-sm text-gray-900">{formatDate(selectedUser.subscription.endDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}