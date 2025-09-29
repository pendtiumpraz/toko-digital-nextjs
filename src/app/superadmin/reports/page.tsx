'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';
import { motion } from 'framer-motion';

interface ReportStats {
  totalUsers: number;
  activeUsers: number;
  totalStores: number;
  activeStores: number;
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface Report {
  id: string;
  title: string;
  type: 'FINANCIAL' | 'USER_ANALYTICS' | 'STORE_ANALYTICS' | 'PERFORMANCE' | 'CUSTOM';
  description: string;
  dateRange: string;
  generatedAt: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  fileSize?: string;
  downloadUrl?: string;
  parameters: Record<string, any>;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'analytics'>('dashboard');
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'month',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Mock data for development
      setStats({
        totalUsers: 2847,
        activeUsers: 1892,
        totalStores: 456,
        activeStores: 398,
        totalRevenue: 1234567890,
        monthlyRevenue: 156789000,
        revenueGrowth: 18.5,
        totalOrders: 8934,
        averageOrderValue: 138200,
        conversionRate: 3.4
      });

      setReports([
        {
          id: '1',
          title: 'Monthly Financial Report',
          type: 'FINANCIAL',
          description: 'Comprehensive financial overview including revenue, expenses, and profit margins',
          dateRange: 'January 2024',
          generatedAt: '2024-01-31T10:30:00Z',
          status: 'COMPLETED',
          fileSize: '2.4 MB',
          downloadUrl: '/reports/financial-january-2024.pdf',
          parameters: {
            includeCharts: true,
            currency: 'IDR',
            breakdown: 'daily'
          }
        },
        {
          id: '2',
          title: 'User Growth Analytics',
          type: 'USER_ANALYTICS',
          description: 'User registration trends, activity patterns, and retention metrics',
          dateRange: 'Q1 2024',
          generatedAt: '2024-01-30T14:15:00Z',
          status: 'COMPLETED',
          fileSize: '1.8 MB',
          downloadUrl: '/reports/user-analytics-q1-2024.pdf',
          parameters: {
            segmentation: 'by_plan',
            includeChurn: true,
            cohortAnalysis: true
          }
        },
        {
          id: '3',
          title: 'Store Performance Report',
          type: 'STORE_ANALYTICS',
          description: 'Store-wise performance metrics, conversion rates, and growth analysis',
          dateRange: 'Last 30 days',
          generatedAt: '2024-01-29T16:45:00Z',
          status: 'GENERATING',
          parameters: {
            topStores: 50,
            includeProducts: true,
            metrics: ['revenue', 'orders', 'conversion']
          }
        },
        {
          id: '4',
          title: 'Platform Performance Metrics',
          type: 'PERFORMANCE',
          description: 'System uptime, API response times, and technical performance indicators',
          dateRange: 'Last 7 days',
          generatedAt: '2024-01-28T09:20:00Z',
          status: 'FAILED',
          parameters: {
            includeErrors: true,
            responseTimeBreakdown: true,
            serverMetrics: true
          }
        }
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      // Mock report generation
      const newReport: Report = {
        id: Date.now().toString(),
        title: `${reportType} Report`,
        type: reportType as Report['type'],
        description: `Generated ${reportType.toLowerCase()} report with current data`,
        dateRange: 'Current',
        generatedAt: new Date().toISOString(),
        status: 'GENERATING',
        parameters: {}
      };

      setReports(prev => [newReport, ...prev]);

      // Simulate generation process
      setTimeout(() => {
        setReports(prev => prev.map(report =>
          report.id === newReport.id
            ? { ...report, status: 'COMPLETED', fileSize: '1.5 MB', downloadUrl: `/reports/${report.id}.pdf` }
            : report
        ));
      }, 3000);

    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const downloadReport = async (report: Report) => {
    if (!report.downloadUrl) return;

    try {
      // In a real app, this would download the actual file
      const link = document.createElement('a');
      link.href = report.downloadUrl;
      link.download = `${report.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'GENERATING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FINANCIAL':
        return 'bg-green-100 text-green-800';
      case 'USER_ANALYTICS':
        return 'bg-blue-100 text-blue-800';
      case 'STORE_ANALYTICS':
        return 'bg-purple-100 text-purple-800';
      case 'PERFORMANCE':
        return 'bg-orange-100 text-orange-800';
      case 'CUSTOM':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Generate and manage comprehensive business reports</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => generateReport('CUSTOM')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <DocumentChartBarIcon className="h-5 w-5 mr-2" />
              Custom Report
            </button>
            <button
              onClick={() => generateReport('FINANCIAL')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { id: 'reports', label: 'Reports', icon: DocumentChartBarIcon },
              { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(stats.totalUsers)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className="text-sm text-green-600 font-medium">
                      {formatNumber(stats.activeUsers)} active
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Stores</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(stats.totalStores)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className="text-sm text-green-600 font-medium">
                      {formatNumber(stats.activeStores)} active
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({((stats.activeStores / stats.totalStores) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {stats.revenueGrowth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.revenueGrowth)}% this month
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <ShoppingCartIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(stats.totalOrders)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Avg Value:</span>
                      <span className="font-medium">{formatCurrency(stats.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion:</span>
                      <span className="font-medium">{stats.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Report Generation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { type: 'FINANCIAL', label: 'Financial Report', icon: CreditCardIcon, color: 'bg-green-500' },
                  { type: 'USER_ANALYTICS', label: 'User Analytics', icon: UsersIcon, color: 'bg-blue-500' },
                  { type: 'STORE_ANALYTICS', label: 'Store Analytics', icon: BuildingStorefrontIcon, color: 'bg-purple-500' },
                  { type: 'PERFORMANCE', label: 'Performance', icon: ArrowTrendingUpIcon, color: 'bg-orange-500' }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.type}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => generateReport(item.type)}
                      className={`p-4 rounded-lg ${item.color} text-white hover:opacity-90 transition-opacity`}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium text-center">{item.label}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="USER_ANALYTICS">User Analytics</option>
                    <option value="STORE_ANALYTICS">Store Analytics</option>
                    <option value="PERFORMANCE">Performance</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="GENERATING">Generating</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Generated Reports</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(report.type)}`}>
                            {report.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {report.dateRange}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Generated {formatDate(report.generatedAt)}
                          </div>
                          {report.fileSize && (
                            <div>Size: {report.fileSize}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.status === 'GENERATING' && (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        )}
                        {report.status === 'COMPLETED' && report.downloadUrl && (
                          <button
                            onClick={() => downloadReport(report)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                            title="Download Report"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Advanced Analytics</h2>
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Advanced analytics dashboard coming soon</p>
              <p className="text-sm text-gray-400">Real-time charts, predictive analytics, and custom dashboards</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}