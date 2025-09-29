'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'
import AdminLayout from '@/components/layout/AdminLayout'

interface FinancialOverview {
  totalRevenue: number
  totalProfit: number
  totalTransactions: number
  activeStores: number
  monthlyRevenue: number
  monthlyProfit: number
  monthlyGrowth: {
    revenue: number
    profit: number
    transactions: number
  }
  yearlyRevenue: number
  yearlyProfit: number
  paymentMethodBreakdown: {
    method: string
    amount: number
    count: number
    percentage: number
  }[]
  topPerformingStores: {
    storeId: string
    storeName: string
    revenue: number
    profit: number
    orders: number
    growth: number
  }[]
  recentTransactions: {
    id: string
    storeId: string
    storeName: string
    type: 'INCOME' | 'EXPENSE'
    category: string
    amount: number
    description: string
    date: string
  }[]
  categoryBreakdown: {
    category: string
    type: 'INCOME' | 'EXPENSE'
    amount: number
    count: number
    percentage: number
  }[]
}

interface DateRange {
  start: string
  end: string
}

export default function SuperAdminFinancePage() {
  const router = useRouter()
  const [overview, setOverview] = useState<FinancialOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [exporting, setExporting] = useState(false)

  const fetchFinancialData = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/superadmin/finance?start=${dateRange.start}&end=${dateRange.end}&period=${selectedPeriod}`, {
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
        throw new Error('Failed to fetch financial data')
      }

      const data = await response.json()
      setOverview(data)
    } catch (error) {
      console.error('Error fetching financial data:', error)
      setError('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }, [router, dateRange, selectedPeriod])

  useEffect(() => {
    fetchFinancialData()
  }, [fetchFinancialData])

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

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }

  const exportFinancialReport = async (format: 'excel' | 'pdf') => {
    setExporting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/superadmin/finance/export?format=${format}&start=${dateRange.start}&end=${dateRange.end}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financial-report-${dateRange.start}-${dateRange.end}.${format === 'excel' ? 'xlsx' : 'pdf'}`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      setError('Failed to export report')
    } finally {
      setExporting(false)
    }
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
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFinancialData}
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
            <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
            <p className="text-gray-600 mt-1">Monitor platform-wide financial performance and revenue metrics</p>
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
            <button
              onClick={() => exportFinancialReport('excel')}
              disabled={exporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        {overview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {overview.monthlyGrowth.revenue > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${overview.monthlyGrowth.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(overview.monthlyGrowth.revenue)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>

              {/* Total Profit */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <BanknotesIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Profit</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(overview.totalProfit)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {overview.monthlyGrowth.profit > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${overview.monthlyGrowth.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(overview.monthlyGrowth.profit)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>

              {/* Total Transactions */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(overview.totalTransactions)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {overview.monthlyGrowth.transactions > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${overview.monthlyGrowth.transactions > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(overview.monthlyGrowth.transactions)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>

              {/* Active Stores */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <BuildingStorefrontIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Stores</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(overview.activeStores)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Contributing to revenue</span>
                </div>
              </div>
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Method Breakdown */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Distribution</h3>
                <div className="space-y-4">
                  {overview.paymentMethodBreakdown.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(method.amount)}</p>
                        <p className="text-xs text-gray-500">{method.percentage.toFixed(1)}% ({method.count} transactions)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Categories</h3>
                <div className="space-y-4">
                  {overview.categoryBreakdown.slice(0, 6).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          category.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.type}
                        </div>
                        <span className="text-sm font-medium text-gray-700 ml-3">{category.category.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(category.amount)}</p>
                        <p className="text-xs text-gray-500">{category.count} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Stores */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Stores</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overview.topPerformingStores.map((store, index) => (
                      <tr key={store.storeId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{store.storeName}</p>
                            <p className="text-sm text-gray-500">ID: {store.storeId.substring(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {formatCurrency(store.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {formatCurrency(store.profit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {formatNumber(store.orders)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            store.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {store.growth > 0 ? (
                              <TrendingUpIcon className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDownIcon className="h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(store.growth)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/superadmin/stores/${store.storeId}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button
                  onClick={() => router.push('/superadmin/finance/transactions')}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overview.recentTransactions.map((transaction, index) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.storeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.category.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}