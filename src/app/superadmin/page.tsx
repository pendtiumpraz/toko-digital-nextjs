'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  UsersIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  CreditCardIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import AdminLayout from '@/components/layout/AdminLayout'

interface DashboardStats {
  users: {
    total: number
    active: number
    inactive: number
    newThisWeek: number
    newThisMonth: number
  }
  stores: {
    total: number
    active: number
    inactive: number
  }
  trials: {
    active: number
    expiringSoon: number
    expired: number
  }
  subscriptions: {
    active: number
    expired: number
  }
  revenue: {
    total: number
    thisMonth: number
  }
}

interface SystemHealth {
  avgResponseTime: number
  errorRate: number
  storageUsage: number
  activeConnections: number
  status: 'healthy' | 'warning' | 'critical'
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/superadmin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (response.status === 403) {
        setError('Access denied. Super admin privileges required.')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setStats(data.stats)
      setSystemHealth(data.systemHealth)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="h-5 w-5" />
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'critical': return <XCircleIcon className="h-5 w-5" />
      default: return <XCircleIcon className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <XCircleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* System Health Status */}
        {systemHealth && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(systemHealth.status)}`}>
                  {getHealthIcon(systemHealth.status)}
                  <span className="ml-1 capitalize">{systemHealth.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{systemHealth.avgResponseTime}ms</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{systemHealth.errorRate.toFixed(2)}%</div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(systemHealth.storageUsage)}</div>
                  <div className="text-sm text-gray-600">Storage Used (bytes)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{systemHealth.activeConnections}</div>
                  <div className="text-sm text-gray-600">Active Connections</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.users.total)}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium text-green-600">{formatNumber(stats.users.active)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive:</span>
                  <span className="font-medium text-red-600">{formatNumber(stats.users.inactive)}</span>
                </div>
                <div className="flex justify-between">
                  <span>New this week:</span>
                  <span className="font-medium">{formatNumber(stats.users.newThisWeek)}</span>
                </div>
              </div>
            </div>

            {/* Stores Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stores</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.stores.total)}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium text-green-600">{formatNumber(stats.stores.active)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive:</span>
                  <span className="font-medium text-red-600">{formatNumber(stats.stores.inactive)}</span>
                </div>
              </div>
            </div>

            {/* Trials Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Trials</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.trials.active)}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Expiring soon:</span>
                  <span className="font-medium text-orange-600">{formatNumber(stats.trials.expiringSoon)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expired:</span>
                  <span className="font-medium text-red-600">{formatNumber(stats.trials.expired)}</span>
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <CreditCardIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.revenue.total)}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>This month:</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats.revenue.thisMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active subs:</span>
                  <span className="font-medium">{formatNumber(stats.subscriptions.active)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/superadmin/users')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                View All Users
              </button>
              <button
                onClick={() => router.push('/superadmin/users?filter=trial_expiring')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Trials Expiring Soon
              </button>
              <button
                onClick={() => router.push('/superadmin/users?filter=trial_expired')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Expired Trials
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Management</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/superadmin/stores')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                View All Stores
              </button>
              <button
                onClick={() => router.push('/superadmin/stores?filter=inactive')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Inactive Stores
              </button>
              <button
                onClick={() => router.push('/superadmin/stores?filter=verification_pending')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Pending Verification
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/superadmin/activities')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Activity Logs
              </button>
              <button
                onClick={() => router.push('/superadmin/notifications')}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Send Notifications
              </button>
              <button
                onClick={fetchDashboardData}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}