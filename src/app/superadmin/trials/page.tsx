'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowPathIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  BanknotesIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface TrialUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  trialEndDate: string;
  trialStartDate: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  trialExtensions: number;
  store?: {
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    isVerified: boolean;
    totalOrders: number;
    totalRevenue: number;
  };
  subscription?: {
    id: string;
    plan: string;
    status: string;
  };
  usage?: {
    storageUsed: number;
    productsCreated: number;
    ordersProcessed: number;
    customersAcquired: number;
  };
}

interface TrialStats {
  totalTrials: number;
  activeTrials: number;
  expiredTrials: number;
  expiringSoon: number;
  conversionRate: number;
  averageTrialDuration: number;
  totalExtensions: number;
  totalConversions: number;
}

interface Filters {
  status: string;
  daysRemaining: string;
  hasStore: string;
  extensions: string;
  usage: string;
}

export default function SuperAdminTrialsPage() {
  const router = useRouter();
  const [trials, setTrials] = useState<TrialUser[]>([]);
  const [stats, setStats] = useState<TrialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTrials, setSelectedTrials] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'extend' | 'convert'>('view');
  const [selectedTrial, setSelectedTrial] = useState<TrialUser | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    daysRemaining: '',
    hasStore: '',
    extensions: '',
    usage: ''
  });

  useEffect(() => {
    fetchTrials();
    fetchTrialStats();
  }, [currentPage, searchQuery, filters]);

  const fetchTrials = async () => {
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
        ...(filters.daysRemaining && { daysRemaining: filters.daysRemaining }),
        ...(filters.hasStore && { hasStore: filters.hasStore }),
        ...(filters.extensions && { extensions: filters.extensions }),
        ...(filters.usage && { usage: filters.usage })
      });

      const response = await fetch(`/api/superadmin/trials?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch trials');
      }

      const data = await response.json();
      setTrials(data.trials);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching trials:', error);
      setError('Failed to load trials');
      toast.error('Failed to load trials');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/superadmin/trials/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching trial stats:', error);
    }
  };

  const handleTrialAction = async (action: string, userId: string, additionalData?: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/superadmin/trials', {
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
      fetchTrials();
      fetchTrialStats();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Action failed');
    }
  };

  const handleBulkAction = async (action: string, additionalData?: any) => {
    if (selectedTrials.length === 0) {
      toast.error('Please select trials first');
      return;
    }

    setBulkActionLoading(true);
    try {
      const promises = selectedTrials.map(userId =>
        handleTrialAction(action, userId, additionalData)
      );
      await Promise.all(promises);
      setSelectedTrials([]);
      toast.success(`Bulk ${action} completed`);
    } catch (error) {
      toast.error(`Bulk ${action} failed`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const openModal = (type: 'view' | 'extend' | 'convert', trial: TrialUser) => {
    setModalType(type);
    setSelectedTrial(trial);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTrial(null);
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

  const getTrialStatusColor = (trial: TrialUser) => {
    if (trial.subscription?.status === 'ACTIVE') {
      return 'text-green-600 bg-green-100';
    }
    if (trial.isExpired) {
      return 'text-red-600 bg-red-100';
    }
    if (trial.isExpiringSoon) {
      return 'text-yellow-600 bg-yellow-100';
    }
    return 'text-blue-600 bg-blue-100';
  };

  const getTrialStatusText = (trial: TrialUser) => {
    if (trial.subscription?.status === 'ACTIVE') {
      return 'Converted';
    }
    if (trial.isExpired) {
      return 'Expired';
    }
    if (trial.isExpiringSoon) {
      return `${trial.daysRemaining} days left`;
    }
    return `${trial.daysRemaining} days left`;
  };

  const getUsageColor = (used: number, total: number = 100) => {
    const percentage = (used / total) * 100;
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trial Management</h1>
            <p className="text-gray-600">Manage trial accounts and conversions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const days = prompt('Enter number of days to extend for all selected trials:');
                if (days && !isNaN(parseInt(days))) {
                  handleBulkAction('extend_trial', { additionalDays: parseInt(days) });
                }
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Bulk Extend
            </button>
            <button
              onClick={fetchTrials}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Trial Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Trials</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.totalTrials}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.activeTrials}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100">
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.expiredTrials}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.expiringSoon}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-indigo-100">
                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.averageTrialDuration} days</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-orange-100">
                  <PlusIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Extensions</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.totalExtensions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-emerald-100">
                  <CreditCardIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.totalConversions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trials..."
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
              <option value="expired">Expired</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="converted">Converted</option>
            </select>

            {/* Days Remaining Filter */}
            <select
              value={filters.daysRemaining}
              onChange={(e) => setFilters({ ...filters, daysRemaining: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Durations</option>
              <option value="0-3">0-3 days</option>
              <option value="4-7">4-7 days</option>
              <option value="8-14">8-14 days</option>
              <option value="15+">15+ days</option>
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

            {/* Usage Filter */}
            <select
              value={filters.usage}
              onChange={(e) => setFilters({ ...filters, usage: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Usage</option>
              <option value="high">High Usage</option>
              <option value="medium">Medium Usage</option>
              <option value="low">Low Usage</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedTrials.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedTrials.length} trial(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const days = prompt('Enter number of days to extend:');
                      if (days && !isNaN(parseInt(days))) {
                        handleBulkAction('extend_trial', { additionalDays: parseInt(days) });
                      }
                    }}
                    disabled={bulkActionLoading}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Extend Trials
                  </button>
                  <button
                    onClick={() => handleBulkAction('send_reminder')}
                    disabled={bulkActionLoading}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send Reminder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trials Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading trials...</p>
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
                              setSelectedTrials(trials.map(t => t.id));
                            } else {
                              setSelectedTrials([]);
                            }
                          }}
                          checked={selectedTrials.length === trials.length && trials.length > 0}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User & Trial Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trial Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage & Activity
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trials.map((trial) => (
                      <tr key={trial.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTrials.includes(trial.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTrials([...selectedTrials, trial.id]);
                              } else {
                                setSelectedTrials(selectedTrials.filter(id => id !== trial.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {trial.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{trial.name}</div>
                              <div className="text-sm text-gray-500">{trial.email}</div>
                              <div className="text-xs text-gray-400 flex items-center mt-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                Started: {formatDate(trial.trialStartDate)}
                              </div>
                              {trial.trialExtensions > 0 && (
                                <div className="text-xs text-yellow-600 flex items-center">
                                  <PlusIcon className="h-3 w-3 mr-1" />
                                  Extended {trial.trialExtensions} times
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrialStatusColor(trial)}`}>
                              {getTrialStatusText(trial)}
                            </span>
                            <div className="text-xs text-gray-500">
                              Ends: {formatDate(trial.trialEndDate)}
                            </div>
                            {trial.isExpiringSoon && !trial.isExpired && (
                              <div className="flex items-center text-xs text-orange-600">
                                <FireIcon className="h-3 w-3 mr-1" />
                                Urgent
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {trial.store ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 flex items-center">
                                <BuildingStorefrontIcon className="h-4 w-4 mr-1 text-gray-400" />
                                {trial.store.name}
                              </div>
                              <div className="text-xs text-gray-500">{trial.store.subdomain}.example.com</div>
                              <div className="mt-1 space-y-1">
                                <div className="text-xs text-blue-600">
                                  {trial.store.totalOrders} orders
                                </div>
                                <div className="text-xs text-green-600">
                                  {formatCurrency(trial.store.totalRevenue)}
                                </div>
                              </div>
                              <div className="flex space-x-1 mt-1">
                                {trial.store.isActive && (
                                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Active"></span>
                                )}
                                {trial.store.isVerified && (
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" title="Verified"></span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No store created</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {trial.usage ? (
                            <div className="text-sm space-y-1">
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Storage:</span> {trial.usage.storageUsed} MB
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Products:</span> {trial.usage.productsCreated}
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Orders:</span> {trial.usage.ordersProcessed}
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Customers:</span> {trial.usage.customersAcquired}
                              </div>
                              {/* Usage indicator */}
                              <div className="flex items-center mt-2">
                                <div className="w-12 bg-gray-200 rounded-full h-1">
                                  <div
                                    className={`h-1 rounded-full ${trial.usage.productsCreated > 5 ? 'bg-green-500' : trial.usage.productsCreated > 2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(100, (trial.usage.productsCreated / 10) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs text-gray-500">Activity</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No usage data</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => openModal('view', trial)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {!trial.isExpired && !trial.subscription && (
                              <button
                                onClick={() => openModal('extend', trial)}
                                className="text-yellow-600 hover:text-yellow-800"
                                title="Extend Trial"
                              >
                                <ClockIcon className="h-5 w-5" />
                              </button>
                            )}
                            {!trial.subscription && (
                              <button
                                onClick={() => openModal('convert', trial)}
                                className="text-green-600 hover:text-green-800"
                                title="Convert to Paid"
                              >
                                <CreditCardIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleTrialAction('send_reminder', trial.id);
                              }}
                              className="text-purple-600 hover:text-purple-800"
                              title="Send Reminder"
                            >
                              <EnvelopeIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

        {/* Trial Modal */}
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
                      {modalType === 'view' ? 'Trial Details' :
                       modalType === 'extend' ? 'Extend Trial' : 'Convert to Paid'}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {selectedTrial && modalType === 'view' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Info */}
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">User Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedTrial.name}</div>
                                <div className="text-sm text-gray-500">Full Name</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{selectedTrial.email}</div>
                                <div className="text-sm text-gray-500">Email Address</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{formatDate(selectedTrial.createdAt)}</div>
                                <div className="text-sm text-gray-500">Account Created</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trial Info */}
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Trial Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Trial Status</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrialStatusColor(selectedTrial)}`}>
                                {getTrialStatusText(selectedTrial)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Start Date</span>
                              <span className="text-sm text-gray-900">{formatDate(selectedTrial.trialStartDate)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">End Date</span>
                              <span className="text-sm text-gray-900">{formatDate(selectedTrial.trialEndDate)}</span>
                            </div>
                            {selectedTrial.trialExtensions > 0 && (
                              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Extensions</span>
                                <span className="text-sm text-yellow-600">{selectedTrial.trialExtensions} times</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Store Information */}
                      {selectedTrial.store && (
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Store Performance</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{selectedTrial.store.totalOrders}</div>
                                <div className="text-sm text-blue-600">Total Orders</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedTrial.store.totalRevenue)}</div>
                                <div className="text-sm text-green-600">Revenue</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {selectedTrial.store.totalRevenue > 0 ? (selectedTrial.store.totalRevenue / selectedTrial.store.totalOrders).toFixed(0) : 0}
                                </div>
                                <div className="text-sm text-purple-600">Avg Order Value</div>
                              </div>
                              <div className="text-center">
                                <div className="flex justify-center space-x-2">
                                  {selectedTrial.store.isActive && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                                      Active
                                    </span>
                                  )}
                                  {selectedTrial.store.isVerified && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full text-blue-600 bg-blue-100">
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">Status</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Usage Statistics */}
                      {selectedTrial.usage && (
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Usage Statistics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-indigo-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-indigo-600">{selectedTrial.usage.storageUsed}</div>
                              <div className="text-sm text-indigo-600">Storage (MB)</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-orange-600">{selectedTrial.usage.productsCreated}</div>
                              <div className="text-sm text-orange-600">Products</div>
                            </div>
                            <div className="bg-teal-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-teal-600">{selectedTrial.usage.ordersProcessed}</div>
                              <div className="text-sm text-teal-600">Orders</div>
                            </div>
                            <div className="bg-pink-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-pink-600">{selectedTrial.usage.customersAcquired}</div>
                              <div className="text-sm text-pink-600">Customers</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-6 border-t">
                        {!selectedTrial.subscription && !selectedTrial.isExpired && (
                          <button
                            onClick={() => openModal('extend', selectedTrial)}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                          >
                            Extend Trial
                          </button>
                        )}
                        {!selectedTrial.subscription && (
                          <button
                            onClick={() => openModal('convert', selectedTrial)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Convert to Paid
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleTrialAction('send_reminder', selectedTrial.id);
                            closeModal();
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedTrial && modalType === 'extend' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900">Extend Trial for {selectedTrial.name}</h4>
                        <p className="text-gray-600">Current trial ends on {formatDate(selectedTrial.trialEndDate)}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[7, 14, 30, 60].map(days => (
                          <button
                            key={days}
                            onClick={() => {
                              handleTrialAction('extend_trial', selectedTrial.id, { additionalDays: days });
                              closeModal();
                            }}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 text-center"
                          >
                            <div className="text-2xl font-bold text-yellow-600">{days}</div>
                            <div className="text-sm text-gray-600">days</div>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Extension (days)</label>
                        <div className="flex space-x-3">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            placeholder="Enter days"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const days = parseInt((e.target as HTMLInputElement).value);
                                if (days > 0) {
                                  handleTrialAction('extend_trial', selectedTrial.id, { additionalDays: days });
                                  closeModal();
                                }
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                              const days = parseInt(input.value);
                              if (days > 0) {
                                handleTrialAction('extend_trial', selectedTrial.id, { additionalDays: days });
                                closeModal();
                              }
                            }}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                          >
                            Extend
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTrial && modalType === 'convert' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900">Convert {selectedTrial.name} to Paid Plan</h4>
                        <p className="text-gray-600">Choose a subscription plan for this user</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Basic', 'Pro', 'Premium'].map(plan => (
                          <div key={plan} className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 hover:bg-green-50 cursor-pointer">
                            <div className="text-center">
                              <h5 className="text-lg font-semibold text-gray-900">{plan}</h5>
                              <p className="text-gray-600 mt-2">Convert to {plan} plan</p>
                              <button
                                onClick={() => {
                                  handleTrialAction('convert_to_paid', selectedTrial.id, { plan: plan.toLowerCase() });
                                  closeModal();
                                }}
                                className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                              >
                                Convert to {plan}
                              </button>
                            </div>
                          </div>
                        ))}
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