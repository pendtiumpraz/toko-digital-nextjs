'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChartBarIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ClockIcon,
  CreditCardIcon,
  FunnelIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import AdminLayout from '@/components/layout/AdminLayout'

interface AnalyticsOverview {
  // Platform metrics
  totalUsers: number
  activeUsers: number
  totalStores: number
  activeStores: number
  totalOrders: number
  totalRevenue: number

  // Growth metrics
  userGrowth: {
    thisMonth: number
    lastMonth: number
    growth: number
  }
  storeGrowth: {
    thisMonth: number
    lastMonth: number
    growth: number
  }
  revenueGrowth: {
    thisMonth: number
    lastMonth: number
    growth: number
  }

  // User behavior
  userActivity: {
    daily: Array<{ date: string; activeUsers: number; newUsers: number }>
    topPages: Array<{ page: string; views: number; uniqueUsers: number }>
    sessionDuration: number
    bounceRate: number
  }

  // Store performance
  storeMetrics: {
    averageOrderValue: number
    conversionRate: number
    topCategories: Array<{ category: string; count: number; revenue: number }>
    performanceDistribution: Array<{ range: string; count: number }>
  }

  // Technology insights
  deviceBreakdown: Array<{ device: string; count: number; percentage: number }>
  browserBreakdown: Array<{ browser: string; count: number; percentage: number }>

  // Regional data
  regionData: Array<{ region: string; users: number; stores: number; revenue: number }>

  // Subscription insights
  subscriptionMetrics: {
    conversionRate: number
    churnRate: number
    planDistribution: Array<{ plan: string; count: number; revenue: number }>
    trialToPayment: number
  }
}

interface DateRange {
  start: string
  end: string
}

export default function SuperAdminAnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/superadmin/analytics?start=${dateRange.start}&end=${dateRange.end}&period=${selectedPeriod}`, {
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
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [router, dateRange, selectedPeriod])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }

  const updateDateRange = (period: string) => {
    setSelectedPeriod(period)
    const end = new Date().toISOString().split('T')[0]
    let start = ''

    switch (period) {
      case 'today':
        start = end
        break
      case 'week':
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - 7)
        start = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
        break
      case 'quarter':
        const quarter = Math.floor(new Date().getMonth() / 3)
        start = new Date(new Date().getFullYear(), quarter * 3, 1).toISOString().split('T')[0]
        break
      case 'year':
        start = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
        break
    }

    if (start) {
      setDateRange({ start, end })
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
      <AdminLayout role="SUPER_ADMIN">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into platform performance and user behavior</p>
          </div>
          <div className="flex space-x-3">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPeriod}
              onChange={(e) => updateDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'users', name: 'Users', icon: UsersIcon },
              { id: 'stores', name: 'Stores', icon: BuildingStorefrontIcon },
              { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon },
              { id: 'behavior', name: 'Behavior', icon: EyeIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.totalUsers)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {analytics.userGrowth.growth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${analytics.userGrowth.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(analytics.userGrowth.growth)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Stores</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.activeStores)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {analytics.storeGrowth.growth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${analytics.storeGrowth.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(analytics.storeGrowth.growth)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.totalOrders)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Across all stores</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {analytics.revenueGrowth.growth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${analytics.revenueGrowth.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(analytics.revenueGrowth.growth)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activity Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Trend</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">User activity chart will be rendered here</p>
                    <p className="text-sm text-gray-400 mt-1">Daily active users vs new registrations</p>
                  </div>
                </div>
              </div>

              {/* Revenue Growth Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Revenue growth chart will be rendered here</p>
                    <p className="text-sm text-gray-400 mt-1">Monthly revenue trends</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Device & Browser Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
                <div className="space-y-4">
                  {analytics.deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {device.device === 'Mobile' ? (
                          <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600 mr-3" />
                        ) : device.device === 'Desktop' ? (
                          <ComputerDesktopIcon className="h-5 w-5 text-green-600 mr-3" />
                        ) : (
                          <GlobeAltIcon className="h-5 w-5 text-purple-600 mr-3" />
                        )}
                        <span className="text-sm font-medium text-gray-700">{device.device}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{device.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
                <div className="space-y-4">
                  {analytics.storeMetrics.topCategories.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{category.category.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500">{formatNumber(category.count)} stores</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(category.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subscription Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.subscriptionMetrics.conversionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Trial to Paid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analytics.subscriptionMetrics.churnRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Churn Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(
                    analytics.subscriptionMetrics.planDistribution.reduce((sum, plan) => sum + plan.revenue, 0)
                  )}</div>
                  <div className="text-sm text-gray-600">Subscription Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.subscriptionMetrics.trialToPayment.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Other tabs can be implemented similarly */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analytics</h3>
            <p className="text-gray-600">Detailed {activeTab} analytics will be implemented here</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}