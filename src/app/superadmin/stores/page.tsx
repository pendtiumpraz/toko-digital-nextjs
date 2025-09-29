'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  LinkIcon,
  CalendarIcon,
  UserIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CloudIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Store {
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  isVerified: boolean;
  storageUsed: number;
  storageLimit: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
  subscription?: {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    trialEndDate?: string;
  };
  analytics?: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    monthlyVisitors: number;
    conversionRate: number;
  };
}

interface StoreModalData extends Store {
  theme?: string;
  settings?: {
    currency: string;
    timezone: string;
    language: string;
    allowRegistration: boolean;
    requireVerification: boolean;
    maintenanceMode: boolean;
  };
}

interface Filters {
  status: string;
  verified: string;
  subscriptionStatus: string;
  storageUsage: string;
  owner: string;
}

export default function SuperAdminStoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'analytics'>('view');
  const [selectedStore, setSelectedStore] = useState<StoreModalData | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    verified: '',
    subscriptionStatus: '',
    storageUsage: '',
    owner: ''
  });

  useEffect(() => {
    fetchStores();
  }, [currentPage, searchQuery, filters]);

  const fetchStores = async () => {
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
        ...(filters.status && { status: filters.status }),
        ...(filters.verified && { verified: filters.verified }),
        ...(filters.subscriptionStatus && { subscriptionStatus: filters.subscriptionStatus }),
        ...(filters.storageUsage && { storageUsage: filters.storageUsage }),
        ...(filters.owner && { owner: filters.owner })
      });

      const response = await fetch(`/api/superadmin/stores?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      setStores(data.stores);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to load stores');
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreDetails = async (storeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/superadmin/stores/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch store details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching store details:', error);
      toast.error('Failed to load store details');
      return null;
    }
  };

  const handleStoreAction = async (action: string, storeId: string, additionalData?: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/superadmin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          storeId,
          ...additionalData
        })
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      const result = await response.json();
      toast.success(result.message);
      fetchStores();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Action failed');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStores.length === 0) {
      toast.error('Please select stores first');
      return;
    }

    setBulkActionLoading(true);
    try {
      const promises = selectedStores.map(storeId =>
        handleStoreAction(action, storeId)
      );
      await Promise.all(promises);
      setSelectedStores([]);
      toast.success(`Bulk ${action} completed`);
    } catch (error) {
      toast.error(`Bulk ${action} failed`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const openModal = async (type: 'view' | 'edit' | 'analytics', store: Store) => {
    setModalType(type);
    const storeDetails = await fetchStoreDetails(store.id);
    if (storeDetails) {
      setSelectedStore(storeDetails);
    } else {
      setSelectedStore(store as StoreModalData);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStore(null);
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

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStorageUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'TRIAL': return 'text-blue-600 bg-blue-100';
      case 'EXPIRED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-600">Manage all stores in the system</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Implement export functionality
                toast('Export functionality coming soon');
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Export Data
            </button>
            <button
              onClick={() => {
                // Implement bulk notification
                toast('Bulk notification functionality coming soon');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Send Notification
            </button>
          </div>
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
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Verification Filter */}
            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>

            {/* Subscription Filter */}
            <select
              value={filters.subscriptionStatus}
              onChange={(e) => setFilters({ ...filters, subscriptionStatus: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subscriptions</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Storage Filter */}
            <select
              value={filters.storageUsage}
              onChange={(e) => setFilters({ ...filters, storageUsage: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Storage</option>
              <option value="high">High Usage (&gt;80%)</option>
              <option value="medium">Medium Usage (50-80%)</option>
              <option value="low">Low Usage (&lt;50%)</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedStores.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedStores.length} store(s) selected
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
                  <button
                    onClick={() => handleBulkAction('verify')}
                    disabled={bulkActionLoading}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stores Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading stores...</p>
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
                              setSelectedStores(stores.map(s => s.id));
                            } else {
                              setSelectedStores([]);
                            }
                          }}
                          checked={selectedStores.length === stores.length && stores.length > 0}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store & Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storage Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stores.map((store) => {
                      const storagePercentage = (store.storageUsed / store.storageLimit) * 100;
                      return (
                        <tr key={store.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedStores.includes(store.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStores([...selectedStores, store.id]);
                                } else {
                                  setSelectedStores(selectedStores.filter(id => id !== store.id));
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                                <BuildingStorefrontIcon className="h-6 w-6 text-white" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{store.name}</div>
                                <div className="text-sm text-gray-500">{store.subdomain}.example.com</div>
                                <div className="text-xs text-gray-400 flex items-center mt-1">
                                  <UserIcon className="h-3 w-3 mr-1" />
                                  {store.owner.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {store.isActive ? (
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
                              <div>
                                {store.isVerified ? (
                                  <span className="inline-flex items-center text-xs text-blue-600">
                                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-xs text-yellow-600">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {store.subscription ? (
                              <div className="text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionStatusColor(store.subscription.status)}`}>
                                  {store.subscription.plan} - {store.subscription.status}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  Ends: {formatDate(store.subscription.endDate)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No subscription</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="flex items-center">
                                <CloudIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <span className={`text-xs font-medium ${storagePercentage >= 90 ? 'text-red-600' : storagePercentage >= 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {formatStorage(store.storageUsed)} / {formatStorage(store.storageLimit)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className={`h-2 rounded-full ${storagePercentage >= 90 ? 'bg-red-500' : storagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  style={{ width: `${Math.min(100, storagePercentage)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {storagePercentage.toFixed(1)}% used
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {store.analytics ? (
                              <div className="text-sm">
                                <div className="text-xs text-gray-600">
                                  <div>{store.analytics.totalOrders} orders</div>
                                  <div>{formatCurrency(store.analytics.totalRevenue)}</div>
                                  <div>{store.analytics.monthlyVisitors} visitors</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No data</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => openModal('view', store)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openModal('analytics', store)}
                                className="text-purple-600 hover:text-purple-800"
                                title="View Analytics"
                              >
                                <ChartBarIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openModal('edit', store)}
                                className="text-green-600 hover:text-green-800"
                                title="Edit Store"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => window.open(`https://${store.subdomain}.example.com`, '_blank')}
                                className="text-gray-600 hover:text-gray-800"
                                title="Visit Store"
                              >
                                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                              </button>
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

        {/* Store Modal */}
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
                className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {modalType === 'view' ? 'Store Details' :
                       modalType === 'edit' ? 'Edit Store' : 'Store Analytics'}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {selectedStore && modalType === 'view' && (
                    <div className="space-y-6">
                      {/* Store Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Store Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedStore.name}</div>
                                <div className="text-sm text-gray-500">Store Name</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedStore.subdomain}.example.com</div>
                                <div className="text-sm text-gray-500">Store URL</div>
                              </div>
                            </div>
                            {selectedStore.domain && (
                              <div className="flex items-center">
                                <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{selectedStore.domain}</div>
                                  <div className="text-sm text-gray-500">Custom Domain</div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{formatDate(selectedStore.createdAt)}</div>
                                <div className="text-sm text-gray-500">Created</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Owner Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedStore.owner.name}</div>
                                <div className="text-sm text-gray-500">Owner Name</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="h-5 w-5 text-gray-400 mr-3">@</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedStore.owner.email}</div>
                                <div className="text-sm text-gray-500">Email</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="h-5 w-5 mr-3 flex items-center justify-center">
                                {selectedStore.owner.isActive ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {selectedStore.owner.isActive ? 'Active' : 'Inactive'}
                                </div>
                                <div className="text-sm text-gray-500">Account Status</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Subscription */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Store Status</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Store Status</span>
                              {selectedStore.isActive ? (
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
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Verification</span>
                              {selectedStore.isVerified ? (
                                <span className="inline-flex items-center text-sm text-blue-600">
                                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-sm text-yellow-600">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Subscription</h4>
                          {selectedStore.subscription ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Plan</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionStatusColor(selectedStore.subscription.status)}`}>
                                  {selectedStore.subscription.plan} - {selectedStore.subscription.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">End Date</span>
                                <span className="text-sm text-gray-900">{formatDate(selectedStore.subscription.endDate)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                              <span className="text-sm text-gray-500">No active subscription</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Storage Usage */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Storage Usage</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Storage Used</span>
                            <span className="text-sm text-gray-900">
                              {formatStorage(selectedStore.storageUsed)} / {formatStorage(selectedStore.storageLimit)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${(selectedStore.storageUsed / selectedStore.storageLimit) * 100 >= 90 ? 'bg-red-500' : (selectedStore.storageUsed / selectedStore.storageLimit) * 100 >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(100, (selectedStore.storageUsed / selectedStore.storageLimit) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((selectedStore.storageUsed / selectedStore.storageLimit) * 100).toFixed(1)}% used
                          </div>
                        </div>
                      </div>

                      {/* Analytics Summary */}
                      {selectedStore.analytics && (
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Performance Overview</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">{selectedStore.analytics.totalOrders}</div>
                              <div className="text-sm text-blue-600">Total Orders</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedStore.analytics.totalRevenue)}</div>
                              <div className="text-sm text-green-600">Revenue</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-purple-600">{selectedStore.analytics.totalProducts}</div>
                              <div className="text-sm text-purple-600">Products</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-yellow-600">{selectedStore.analytics.monthlyVisitors}</div>
                              <div className="text-sm text-yellow-600">Visitors</div>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-indigo-600">{selectedStore.analytics.conversionRate.toFixed(2)}%</div>
                              <div className="text-sm text-indigo-600">Conversion</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                          onClick={() => window.open(`https://${selectedStore.subdomain}.example.com`, '_blank')}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                          Visit Store
                        </button>
                        <button
                          onClick={() => openModal('analytics', selectedStore)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                          View Analytics
                        </button>
                        <button
                          onClick={() => openModal('edit', selectedStore)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Edit Store
                        </button>
                        {!selectedStore.isVerified && (
                          <button
                            onClick={() => {
                              handleStoreAction('verify', selectedStore.id);
                              closeModal();
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Verify Store
                          </button>
                        )}
                        {selectedStore.isActive ? (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for deactivation (optional):');
                              handleStoreAction('deactivate', selectedStore.id, { reason });
                              closeModal();
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleStoreAction('activate', selectedStore.id);
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

                  {selectedStore && modalType === 'analytics' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900">{selectedStore.name} Analytics</h4>
                        <p className="text-gray-600">Detailed performance metrics and insights</p>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
                          <div className="text-3xl font-bold">{selectedStore.analytics?.totalOrders || 0}</div>
                          <div className="text-blue-100">Total Orders</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
                          <div className="text-3xl font-bold">{formatCurrency(selectedStore.analytics?.totalRevenue || 0)}</div>
                          <div className="text-green-100">Revenue</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center">
                          <div className="text-3xl font-bold">{selectedStore.analytics?.monthlyVisitors || 0}</div>
                          <div className="text-purple-100">Monthly Visitors</div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white text-center">
                          <div className="text-3xl font-bold">{selectedStore.analytics?.conversionRate?.toFixed(2) || '0.00'}%</div>
                          <div className="text-yellow-100">Conversion Rate</div>
                        </div>
                      </div>

                      <div className="text-center text-gray-500">
                        <ChartBarIcon className="h-16 w-16 mx-auto mb-4" />
                        <p>Detailed analytics charts and reports would be implemented here</p>
                        <p className="text-sm">This would include traffic trends, sales analytics, customer insights, etc.</p>
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