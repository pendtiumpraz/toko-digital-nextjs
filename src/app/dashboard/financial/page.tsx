'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface FinancialStats {
  thisMonth: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    transactionCount: number
  }
  lastMonth: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    transactionCount: number
  }
  thisYear: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    transactionCount: number
  }
  growth: {
    income: number
    expenses: number
    profit: number
  }
  recentTransactions: Array<{
    id: string
    type: 'INCOME' | 'EXPENSE'
    category: string
    amount: number
    description: string
    transactionDate: string
  }>
  topExpenseCategories: Array<{
    category: string
    total: number
    count: number
    percentage: number
  }>
  topIncomeCategories: Array<{
    category: string
    total: number
    count: number
    percentage: number
  }>
}

export default function FinancialDashboard() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/financial/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch financial data')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching financial data:', error)
      setError('Failed to load financial data')
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

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <ArrowUpIcon className="h-4 w-4" />
    if (value < 0) return <ArrowDownIcon className="h-4 w-4" />
    return null
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
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFinancialData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/70 backdrop-blur-xl shadow-2xl shadow-black/5 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Financial Dashboard</h1>
              <p className="text-gray-600 mt-2 text-lg">Track your income, expenses, and profitability with modern insights</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex space-x-4"
            >
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:to-green-700 flex items-center shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Transaction
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 flex items-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Reports
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Income */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 p-8 border border-white/20"
            >
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200">
                  <BanknotesIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Monthly Income</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {formatCurrency(stats.thisMonth.totalIncome)}
                  </p>
                </div>
              </div>
              <div className={`flex items-center mt-6 text-sm font-medium px-3 py-2 rounded-full ${getGrowthColor(stats.growth.income)} ${stats.growth.income >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                {getGrowthIcon(stats.growth.income)}
                <span className="ml-2">{formatPercentage(stats.growth.income)} from last month</span>
              </div>
            </motion.div>

            {/* Expenses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-red-500/10 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 p-8 border border-white/20"
            >
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-100 to-red-200">
                  <CreditCardIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Monthly Expenses</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    {formatCurrency(stats.thisMonth.totalExpenses)}
                  </p>
                </div>
              </div>
              <div className={`flex items-center mt-6 text-sm font-medium px-3 py-2 rounded-full ${getGrowthColor(-stats.growth.expenses)} ${stats.growth.expenses <= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                {getGrowthIcon(-stats.growth.expenses)}
                <span className="ml-2">{formatPercentage(stats.growth.expenses)} from last month</span>
              </div>
            </motion.div>

            {/* Net Profit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl transition-all duration-500 p-8 border border-white/20 ${
                stats.thisMonth.netProfit >= 0
                  ? 'shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20'
                  : 'shadow-red-500/10 hover:shadow-2xl hover:shadow-red-500/20'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-4 rounded-2xl ${
                  stats.thisMonth.netProfit >= 0
                    ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                    : 'bg-gradient-to-br from-red-100 to-red-200'
                }`}>
                  <ChartBarIcon className={`h-8 w-8 ${stats.thisMonth.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Net Profit</p>
                  <p className={`text-3xl font-bold ${
                    stats.thisMonth.netProfit >= 0
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent'
                  }`}>
                    {formatCurrency(stats.thisMonth.netProfit)}
                  </p>
                </div>
              </div>
              <div className={`flex items-center mt-6 text-sm font-medium px-3 py-2 rounded-full ${getGrowthColor(stats.growth.profit)} ${
                stats.growth.profit >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {getGrowthIcon(stats.growth.profit)}
                <span className="ml-2">{formatPercentage(stats.growth.profit)} from last month</span>
              </div>
            </motion.div>
          </div>

          {/* Year Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Year to Date Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.thisYear.totalIncome)}</div>
                <div className="text-sm text-gray-600">Total Income</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.thisYear.totalExpenses)}</div>
                <div className="text-sm text-gray-600">Total Expenses</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${stats.thisYear.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.thisYear.netProfit)}
                </div>
                <div className="text-sm text-gray-600">Net Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.thisYear.transactionCount}</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {stats.recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'INCOME' ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories This Month</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Top Expense Categories</h4>
                  <div className="space-y-2">
                    {stats.topExpenseCategories.slice(0, 3).map(category => (
                      <div key={category.category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{category.category.replace(/_/g, ' ')}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-red-600">{formatCurrency(category.total)}</span>
                          <span className="text-xs text-gray-500 ml-2">({category.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Top Income Categories</h4>
                  <div className="space-y-2">
                    {stats.topIncomeCategories.slice(0, 3).map(category => (
                      <div key={category.category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{category.category.replace(/_/g, ' ')}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-green-600">{formatCurrency(category.total)}</span>
                          <span className="text-xs text-gray-500 ml-2">({category.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  )
}