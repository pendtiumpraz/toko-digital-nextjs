'use client';

import { useState, useEffect } from 'react';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  CubeIcon,
  ShoppingCartIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface Store {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  totalRevenue: number;
  totalSales: number;
  owner: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  subscription?: {
    plan: string;
    status: string;
    trialEndDate: string;
    endDate?: string;
  };
  analytics: {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
  };
}

interface StoreFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  verified: 'all' | 'true' | 'false';
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [filters, setFilters] = useState<StoreFilters>({
    search: '',
    status: 'all',
    verified: 'all'
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
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

  const fetchStores = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.verified !== 'all' && { verified: filters.verified })
      });

      const response = await fetch(`/api/admin/stores?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
        setPagination(data.pagination);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error loading stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(1);
  }, [filters]);

  const handleStoreAction = async (storeId: string, action: 'activate' | 'suspend' | 'verify') => {
    setActionLoading(storeId);
    try {
      const response = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action,
          storeId,
          reason: action === 'suspend' ? 'Suspended from admin panel' : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchStores(pagination.page);
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} store`);
      }
    } catch (error) {
      console.error(`Error ${action}ing store:`, error);
      toast.error(`Error ${action}ing store`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    setShowStoreModal(true);
  };

  const openStoreInNewTab = (store: Store) => {
    const url = `https://${store.subdomain}.yourdomain.com`; // Replace with actual domain
    window.open(url, '_blank');
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

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (!isVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Suspended';
    if (!isVerified) return 'Unverified';
    return 'Active';
  };

  return (
    <AdminLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-600">Manage stores and monitor their performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Total: {pagination.total} stores
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
                placeholder="Search stores..."
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
              <option value="inactive">Suspended</option>
            </select>

            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.verified}
              onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value as any }))}
            >
              <option value="all">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>

            <button
              onClick={() => fetchStores(1)}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {stores.length === 0 ? (
                <div className="text-center py-12">
                  <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No stores found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {stores.map((store) => (
                    <div key={store.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      {/* Store Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {store.name}
                          </h3>
                          <p className="text-sm text-gray-500">{store.subdomain}.yourdomain.com</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(store.isActive, store.isVerified)}`}>
                              {getStatusText(store.isActive, store.isVerified)}
                            </span>
                            {store.isVerified && (
                              <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">Owner</span>
                        </div>
                        <p className="text-sm text-gray-900">{store.owner.name}</p>
                        <p className="text-xs text-gray-500">{store.owner.email}</p>
                      </div>

                      {/* Analytics */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <CubeIcon className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                          <p className="text-lg font-semibold text-gray-900">
                            {store.analytics.totalProducts}
                          </p>
                          <p className="text-xs text-gray-500">Products</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <ShoppingCartIcon className="h-5 w-5 mx-auto text-green-600 mb-1" />
                          <p className="text-lg font-semibold text-gray-900">
                            {store.analytics.totalOrders}
                          </p>
                          <p className="text-xs text-gray-500">Orders</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <UserIcon className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                          <p className="text-lg font-semibold text-gray-900">
                            {store.analytics.totalCustomers}
                          </p>
                          <p className="text-xs text-gray-500">Customers</p>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                          <BanknotesIcon className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                          <p className="text-xs font-semibold text-gray-900">
                            {formatPrice(store.analytics.totalRevenue)}
                          </p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewStore(store)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => openStoreInNewTab(store)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                          <BuildingStorefrontIcon className="h-4 w-4" />
                          <span>Visit</span>
                        </button>

                        {/* Action Button */}
                        {!store.isVerified && store.isActive && (
                          <button
                            onClick={() => handleStoreAction(store.id, 'verify')}
                            disabled={actionLoading === store.id}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            <ShieldCheckIcon className="h-4 w-4" />
                          </button>
                        )}

                        {store.isActive ? (
                          <button
                            onClick={() => handleStoreAction(store.id, 'suspend')}
                            disabled={actionLoading === store.id}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStoreAction(store.id, 'activate')}
                            disabled={actionLoading === store.id}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Created Date */}
                      <p className="text-xs text-gray-400 mt-3 text-center">
                        Created {formatDate(store.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

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
                        onClick={() => fetchStores(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 border rounded bg-blue-50 text-blue-600">
                        {pagination.page}
                      </span>
                      <button
                        onClick={() => fetchStores(pagination.page + 1)}
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

        {/* Store Detail Modal */}
        {showStoreModal && selectedStore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Store Details</h3>
                  <button
                    onClick={() => setShowStoreModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Store Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Store Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Store Name</label>
                      <p className="text-sm text-gray-900">{selectedStore.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subdomain</label>
                      <p className="text-sm text-gray-900">{selectedStore.subdomain}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className={`text-sm font-medium ${selectedStore.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedStore.isActive ? 'Active' : 'Suspended'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Verified</label>
                      <p className={`text-sm font-medium ${selectedStore.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedStore.isVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedStore.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Revenue</label>
                      <p className="text-sm text-gray-900">{formatPrice(selectedStore.analytics.totalRevenue)}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Owner Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">{selectedStore.owner.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedStore.owner.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <p className="text-sm text-gray-900">{selectedStore.owner.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className={`text-sm font-medium ${selectedStore.owner.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedStore.owner.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Store Analytics</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedStore.analytics.totalProducts}</p>
                      <p className="text-sm text-gray-500">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedStore.analytics.totalOrders}</p>
                      <p className="text-sm text-gray-500">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedStore.analytics.totalCustomers}</p>
                      <p className="text-sm text-gray-500">Customers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{formatPrice(selectedStore.analytics.totalRevenue)}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                {selectedStore.subscription && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Subscription Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Plan</label>
                        <p className="text-sm text-gray-900">{selectedStore.subscription.plan}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <p className="text-sm text-gray-900">{selectedStore.subscription.status}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Trial End</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedStore.subscription.trialEndDate)}</p>
                      </div>
                      {selectedStore.subscription.endDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Subscription End</label>
                          <p className="text-sm text-gray-900">{formatDate(selectedStore.subscription.endDate)}</p>
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