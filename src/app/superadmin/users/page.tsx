'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  UserPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  EnvelopeIcon,
  UserIcon,
  ShieldCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  trialEndDate: string;
  store?: {
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    isVerified: boolean;
  };
  subscription?: {
    id: string;
    plan: string;
    status: string;
    trialEndDate: string;
    endDate: string;
  };
}

interface UserModalData extends User {
  lastLogin?: string;
  totalOrders?: number;
  totalRevenue?: number;
  storageUsed?: number;
}

interface Filters {
  role: string;
  active: string;
  hasStore: string;
  trialStatus: string;
  subscriptionStatus: string;
}

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedUser, setSelectedUser] = useState<UserModalData | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    role: '',
    active: '',
    hasStore: '',
    trialStatus: '',
    subscriptionStatus: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(filters.role && { role: filters.role }),
        ...(filters.active && { active: filters.active }),
        ...(filters.hasStore && { hasStore: filters.hasStore }),
        ...(filters.trialStatus && { trialStatus: filters.trialStatus }),
        ...(filters.subscriptionStatus && { subscriptionStatus: filters.subscriptionStatus })
      });

      const response = await fetch(`/api/superadmin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/superadmin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
      return null;
    }
  };

  const handleUserAction = async (action: string, userId: string, additionalData?: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/superadmin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          userId,
          ...additionalData
        })
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      const result = await response.json();
      toast.success(result.message);
      fetchUsers();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Action failed');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    setBulkActionLoading(true);
    try {
      const promises = selectedUsers.map(userId =>
        handleUserAction(action, userId)
      );
      await Promise.all(promises);
      setSelectedUsers([]);
      toast.success(`Bulk ${action} completed`);
    } catch (error) {
      toast.error(`Bulk ${action} failed`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const openModal = async (type: 'view' | 'edit' | 'create', user?: User) => {
    setModalType(type);
    if (user && type !== 'create') {
      const userDetails = await fetchUserDetails(user.id);
      if (userDetails) {
        setSelectedUser(userDetails);
      } else {
        setSelectedUser(user as UserModalData);
      }
    } else {
      setSelectedUser(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleConfirmAction = (type: string, message: string, onConfirm: () => void) => {
    setConfirmAction({ type, message, onConfirm });
    setShowConfirmModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrialStatus = (user: User) => {
    if (user.subscription?.status === 'ACTIVE') {
      return { text: 'Active Sub', color: 'text-green-600 bg-green-100' };
    }

    const trialEnd = new Date(user.trialEndDate);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft > 7) {
      return { text: `${daysLeft} days left`, color: 'text-blue-600 bg-blue-100' };
    } else if (daysLeft > 0) {
      return { text: `${daysLeft} days left`, color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'Expired', color: 'text-red-600 bg-red-100' };
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'text-purple-600 bg-purple-100';
      case 'ADMIN': return 'text-blue-600 bg-blue-100';
      case 'USER': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all users in the system</p>
          </div>
          <button
            onClick={() => openModal('create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.active}
              onChange={(e) => setFilters({ ...filters, active: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Store Filter */}
            <select
              value={filters.hasStore}
              onChange={(e) => setFilters({ ...filters, hasStore: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              <option value="true">Has Store</option>
              <option value="false">No Store</option>
            </select>

            {/* Trial Status Filter */}
            <select
              value={filters.trialStatus}
              onChange={(e) => setFilters({ ...filters, trialStatus: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Trials</option>
              <option value="active">Active Trial</option>
              <option value="ending_soon">Ending Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    disabled={bulkActionLoading}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    disabled={bulkActionLoading}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          checked={selectedUsers.length === users.length && users.length > 0}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trial Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => {
                      const trialStatus = getTrialStatus(user);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                {user.role.replace('_', ' ')}
                              </span>
                              <div>
                                {user.isActive ? (
                                  <span className="inline-flex items-center text-xs text-green-600">
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-xs text-red-600">
                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.store ? (
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{user.store.name}</div>
                                <div className="text-gray-500">{user.store.subdomain}.example.com</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  {user.store.isActive && (
                                    <span className="text-xs text-green-600">Active</span>
                                  )}
                                  {user.store.isVerified && (
                                    <span className="text-xs text-blue-600">Verified</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No store</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${trialStatus.color}`}>
                              {trialStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => openModal('view', user)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openModal('edit', user)}
                                className="text-green-600 hover:text-green-800"
                                title="Edit User"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              {user.isActive ? (
                                <button
                                  onClick={() => handleConfirmAction(
                                    'deactivate',
                                    `Are you sure you want to deactivate ${user.name}?`,
                                    () => handleUserAction('deactivate', user.id)
                                  )}
                                  className="text-red-600 hover:text-red-800"
                                  title="Deactivate User"
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction('activate', user.id)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Activate User"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === page
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* User Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {modalType === 'create' ? 'Create User' :
                       modalType === 'edit' ? 'Edit User' : 'User Details'}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {selectedUser && modalType === 'view' && (
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedUser.name}</div>
                                <div className="text-sm text-gray-500">Full Name</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedUser.email}</div>
                                <div className="text-sm text-gray-500">Email Address</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                                  {selectedUser.role.replace('_', ' ')}
                                </span>
                                <div className="text-sm text-gray-500">Role</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</div>
                                <div className="text-sm text-gray-500">Member Since</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Account Status</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Account Status</span>
                              {selectedUser.isActive ? (
                                <span className="inline-flex items-center text-sm text-green-600">
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-sm text-red-600">
                                  <XCircleIcon className="h-4 w-4 mr-1" />
                                  Inactive
                                </span>
                              )}
                            </div>
                            {selectedUser.subscription ? (
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Subscription</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  selectedUser.subscription.status === 'ACTIVE' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                                }`}>
                                  {selectedUser.subscription.plan} - {selectedUser.subscription.status}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Trial Status</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrialStatus(selectedUser).color}`}>
                                  {getTrialStatus(selectedUser).text}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Store Information */}
                      {selectedUser.store && (
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Store Information</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedUser.store.name}</div>
                                <div className="text-sm text-gray-500">Store Name</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedUser.store.subdomain}.example.com</div>
                                <div className="text-sm text-gray-500">Store URL</div>
                              </div>
                              <div>
                                <div className="flex space-x-2">
                                  {selectedUser.store.isActive && (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                                      Active
                                    </span>
                                  )}
                                  {selectedUser.store.isVerified && (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-blue-600 bg-blue-100">
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">Status</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Statistics */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Statistics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedUser.totalOrders || 0}</div>
                            <div className="text-sm text-blue-600">Total Orders</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedUser.totalRevenue || 0)}</div>
                            <div className="text-sm text-green-600">Total Revenue</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{selectedUser.storageUsed || 0} MB</div>
                            <div className="text-sm text-purple-600">Storage Used</div>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                            </div>
                            <div className="text-sm text-yellow-600">Last Login</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                          onClick={() => openModal('edit', selectedUser)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Edit User
                        </button>
                        {!selectedUser.subscription && (
                          <button
                            onClick={() => {
                              const days = prompt('Enter number of days to extend trial:');
                              if (days && !isNaN(parseInt(days))) {
                                handleUserAction('extend_trial', selectedUser.id, { additionalDays: parseInt(days) });
                                closeModal();
                              }
                            }}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                          >
                            Extend Trial
                          </button>
                        )}
                        {selectedUser.isActive ? (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for deactivation (optional):');
                              handleUserAction('deactivate', selectedUser.id, { reason });
                              closeModal();
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleUserAction('activate', selectedUser.id);
                              closeModal();
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && confirmAction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg max-w-md w-full p-6"
              >
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                </div>
                <p className="text-gray-600 mb-6">{confirmAction.message}</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmAction.onConfirm();
                      setShowConfirmModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}