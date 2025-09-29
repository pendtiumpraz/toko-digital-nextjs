'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  BuildingStorefrontIcon,
  ArrowLeftIcon,
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
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  UsersIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface StoreDetails {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  description?: string;
  logo?: string;
  banner?: string;
  isActive: boolean;
  isVerified: boolean;
  storageUsed: number;
  storageLimit: number;
  whatsappNumber: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  currency: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: string;
  rating: number;
  totalReviews: number;
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
    subscription?: {
      id: string;
      plan: string;
      status: string;
      startDate: string;
      endDate: string;
      trialEndDate?: string;
      price: number;
    };
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    isActive: boolean;
    createdAt: string;
  }>;
  orders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    customer: {
      name: string;
      email?: string;
    };
  }>;
  analytics: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
    weeklyOrders: number;
    averageOrderValue: number;
    totalProducts: number;
    totalCustomers: number;
    monthlyVisitors: number;
    conversionRate: number;
    topProducts: Array<{
      id: string;
      name: string;
      price: number;
      soldQuantity: number;
      orderCount: number;
      images: Array<{ url: string }>;
    }>;
  };
  settings: {
    currency: string;
    timezone: string;
    language: string;
    allowRegistration: boolean;
    requireVerification: boolean;
    maintenanceMode: boolean;
    theme: string;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    createdAt: string;
    admin: {
      name: string;
      email: string;
    };
  }>;
  _count: {
    products: number;
    orders: number;
    customers: number;
  };
}

export default function SuperAdminStoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  const [store, setStore] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/superadmin/stores/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch store details');
      }

      const data = await response.json();
      setStore(data);
    } catch (error) {
      console.error('Error fetching store details:', error);
      setError('Failed to load store details');
      toast.error('Failed to load store details');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreAction = async (action: string, additionalData?: any) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      let body: any = { action, storeId };

      if (action === 'deactivate' || action === 'suspend') {
        const reason = prompt('Reason for this action (optional):');
        if (reason !== null) {
          body.reason = reason;
        }
      }

      if (additionalData) {
        body = { ...body, ...additionalData };
      }

      const response = await fetch('/api/superadmin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      const result = await response.json();
      toast.success(result.message);

      // Refresh store details
      await fetchStoreDetails();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
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

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'PROCESSING': return 'text-blue-600 bg-blue-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <AdminLayout role="SUPER_ADMIN">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !store) {
    return (
      <AdminLayout role="SUPER_ADMIN">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Store Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The store you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/superadmin/stores')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Stores
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/superadmin/stores')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <BuildingStorefrontIcon className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-gray-600">{store.subdomain}.example.com</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.open(`https://${store.subdomain}.example.com`, '_blank')}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              <span>Preview Store</span>
            </button>

            {!store.isVerified && (
              <button
                onClick={() => handleStoreAction('verify')}
                disabled={actionLoading}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Verify Store</span>
              </button>
            )}

            {store.isActive ? (
              <button
                onClick={() => handleStoreAction('deactivate')}
                disabled={actionLoading}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircleIcon className="h-4 w-4" />
                <span>Suspend</span>
              </button>
            ) : (
              <button
                onClick={() => handleStoreAction('activate')}
                disabled={actionLoading}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Activate</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center mt-1">
                  {store.isActive ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm font-medium text-red-600">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${getStatusColor(store.isActive)}`}>
                {store.isActive ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <XCircleIcon className="h-6 w-6" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verification</p>
                <div className="flex items-center mt-1">
                  {store.isVerified ? (
                    <>
                      <ShieldCheckIcon className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm font-medium text-blue-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <ClockIcon className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-sm font-medium text-yellow-600">Pending</span>
                    </>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${store.isVerified ? 'text-blue-600 bg-blue-100' : 'text-yellow-600 bg-yellow-100'}`}>
                {store.isVerified ? (
                  <ShieldCheckIcon className="h-6 w-6" />
                ) : (
                  <ClockIcon className="h-6 w-6" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(store.analytics.totalRevenue)}
                </p>
              </div>
              <div className="p-2 rounded-lg text-green-600 bg-green-100">
                <BanknotesIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {store.analytics.totalOrders}
                </p>
              </div>
              <div className="p-2 rounded-lg text-blue-600 bg-blue-100">
                <ShoppingCartIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: EyeIcon },
                { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
                { id: 'products', name: 'Products', icon: TagIcon },
                { id: 'orders', name: 'Orders', icon: ShoppingCartIcon },
                { id: 'settings', name: 'Settings', icon: CogIcon },
                { id: 'activity', name: 'Activity', icon: ClockIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Store Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{store.name}</p>
                          <p className="text-sm text-gray-500">Store Name</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{store.subdomain}.example.com</p>
                          {store.customDomain && (
                            <p className="text-sm font-medium text-gray-900">{store.customDomain}</p>
                          )}
                          <p className="text-sm text-gray-500">Store URL</p>
                        </div>
                      </div>

                      {store.description && (
                        <div className="flex items-start space-x-3">
                          <div className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{store.description}</p>
                            <p className="text-sm text-gray-500">Description</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-3">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{store.whatsappNumber}</p>
                          <p className="text-sm text-gray-500">WhatsApp Number</p>
                        </div>
                      </div>

                      {store.email && (
                        <div className="flex items-start space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{store.email}</p>
                            <p className="text-sm text-gray-500">Email</p>
                          </div>
                        </div>
                      )}

                      {(store.street || store.city) && (
                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {[store.street, store.city, store.state, store.country]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                            <p className="text-sm text-gray-500">Address</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatDate(store.createdAt)}</p>
                          <p className="text-sm text-gray-500">Created</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Owner Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{store.owner.name}</p>
                          <p className="text-sm text-gray-500">Owner Name</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{store.owner.email}</p>
                          <p className="text-sm text-gray-500">Email</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="h-5 w-5 mt-0.5 flex items-center justify-center">
                          {store.owner.isActive ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {store.owner.isActive ? 'Active' : 'Inactive'}
                          </p>
                          <p className="text-sm text-gray-500">Account Status</p>
                        </div>
                      </div>

                      {store.owner.subscription && (
                        <div className="flex items-start space-x-3">
                          <CreditCardIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionStatusColor(store.owner.subscription.status)}`}>
                                {store.owner.subscription.plan} - {store.owner.subscription.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">Subscription</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatDate(store.owner.createdAt)}</p>
                          <p className="text-sm text-gray-500">Joined</p>
                        </div>
                      </div>

                      {store.owner.lastLogin && (
                        <div className="flex items-start space-x-3">
                          <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{formatDate(store.owner.lastLogin)}</p>
                            <p className="text-sm text-gray-500">Last Login</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Storage Usage */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Storage Used</span>
                      <span className="text-sm text-gray-900">
                        {formatStorage(store.storageUsed)} / {formatStorage(store.storageLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          (store.storageUsed / store.storageLimit) * 100 >= 90
                            ? 'bg-red-500'
                            : (store.storageUsed / store.storageLimit) * 100 >= 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (store.storageUsed / store.storageLimit) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((store.storageUsed / store.storageLimit) * 100).toFixed(1)}% used
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
                    <div className="text-3xl font-bold">{store.analytics.totalOrders}</div>
                    <div className="text-blue-100">Total Orders</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
                    <div className="text-3xl font-bold">{formatCurrency(store.analytics.totalRevenue)}</div>
                    <div className="text-green-100">Revenue</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center">
                    <div className="text-3xl font-bold">{store.analytics.monthlyVisitors}</div>
                    <div className="text-purple-100">Monthly Visitors</div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white text-center">
                    <div className="text-3xl font-bold">{store.analytics.conversionRate.toFixed(2)}%</div>
                    <div className="text-yellow-100">Conversion Rate</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                        <span className="text-sm font-medium">{formatCurrency(store.analytics.monthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Weekly Orders</span>
                        <span className="text-sm font-medium">{store.analytics.weeklyOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Order Value</span>
                        <span className="text-sm font-medium">{formatCurrency(store.analytics.averageOrderValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completed Orders</span>
                        <span className="text-sm font-medium">{store.analytics.completedOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending Orders</span>
                        <span className="text-sm font-medium">{store.analytics.pendingOrders}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h4>
                    <div className="space-y-3">
                      {store.analytics.topProducts.map((product) => (
                        <div key={product.id} className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <TagIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.soldQuantity} sold • {formatCurrency(product.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Products ({store._count.products} total)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {store.products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.isActive)}`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(product.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders ({store._count.orders} total)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {store.orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                            {order.customer.email && (
                              <div className="text-sm text-gray-500">{order.customer.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(order.total)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Settings</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Currency</span>
                        <span className="text-sm text-gray-900">{store.currency}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Primary Color</span>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: store.primaryColor }}
                          ></div>
                          <span className="text-sm text-gray-900">{store.primaryColor}</span>
                        </div>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Layout</span>
                        <span className="text-sm text-gray-900">{store.layout}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Font Family</span>
                        <span className="text-sm text-gray-900">{store.fontFamily}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">App Settings</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Timezone</span>
                        <span className="text-sm text-gray-900">{store.settings.timezone}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Language</span>
                        <span className="text-sm text-gray-900">{store.settings.language.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Theme</span>
                        <span className="text-sm text-gray-900">{store.settings.theme}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                        <span className={`text-sm ${store.settings.maintenanceMode ? 'text-red-600' : 'text-green-600'}`}>
                          {store.settings.maintenanceMode ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                {(store.facebook || store.instagram || store.twitter || store.youtube) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {store.facebook && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Facebook:</span>
                          <a href={store.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {store.facebook}
                          </a>
                        </div>
                      )}
                      {store.instagram && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Instagram:</span>
                          <a href={store.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {store.instagram}
                          </a>
                        </div>
                      )}
                      {store.twitter && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Twitter:</span>
                          <a href={store.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {store.twitter}
                          </a>
                        </div>
                      )}
                      {store.youtube && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">YouTube:</span>
                          <a href={store.youtube} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {store.youtube}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Admin Activity</h3>
                <div className="space-y-4">
                  {store.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            By {activity.admin.name} ({activity.admin.email})
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(activity.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}