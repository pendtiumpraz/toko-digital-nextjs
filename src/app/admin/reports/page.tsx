'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface ReportData {
  overview: {
    totalUsers: {
      current: number;
      new: number;
      growth: number;
    };
    totalStores: {
      current: number;
      new: number;
      active: number;
      growth: number;
    };
    orders: {
      total: number;
      growth: number;
    };
    revenue: {
      total: number;
      growth: number;
    };
    subscriptions: {
      total: number;
      active: number;
      conversionRate: number;
    };
  };
  charts: {
    userGrowth: Array<{ date: string; count: number }>;
    storeGrowth: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number }>;
    subscriptions: Array<{ plan: string; status: string; count: number }>;
  };
  topStores: Array<{
    id: string;
    name: string;
    subdomain: string;
    revenue: number;
    sales: number;
    orders: number;
    products: number;
    isActive: boolean;
    owner: {
      name: string;
      email: string;
    };
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    description: string;
    targetType: string;
    targetId: string;
    createdAt: string;
    admin: {
      name: string;
      email: string;
    };
  }>;
  period: {
    start: string;
    end: string;
    days: number;
  };
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [activeTab, setActiveTab] = useState('overview');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let queryParams = `period=${selectedPeriod}`;

      if (selectedPeriod === 'custom' && customDateRange.start && customDateRange.end) {
        queryParams = `startDate=${customDateRange.start}&endDate=${customDateRange.end}`;
      }

      const response = await fetch(`/api/admin/reports?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch report data');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUpIcon : TrendingDownIcon;
  };

  const exportReport = () => {
    if (!reportData) return;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Report Period," + formatDate(reportData.period.start) + " to " + formatDate(reportData.period.end) + "\n\n";

    // Overview metrics
    csvContent += "Metric,Current,New,Growth\n";
    csvContent += `Total Users,${reportData.overview.totalUsers.current},${reportData.overview.totalUsers.new},${formatPercentage(reportData.overview.totalUsers.growth)}\n`;
    csvContent += `Total Stores,${reportData.overview.totalStores.current},${reportData.overview.totalStores.new},${formatPercentage(reportData.overview.totalStores.growth)}\n`;
    csvContent += `Orders,${reportData.overview.orders.total},,${formatPercentage(reportData.overview.orders.growth)}\n`;
    csvContent += `Revenue,${reportData.overview.revenue.total},,${formatPercentage(reportData.overview.revenue.growth)}\n\n`;

    // Top stores
    csvContent += "Top Stores\n";
    csvContent += "Store Name,Subdomain,Revenue,Orders,Products,Owner\n";
    reportData.topStores.forEach(store => {
      csvContent += `${store.name},${store.subdomain},${store.revenue},${store.orders},${store.products},${store.owner.name}\n`;
    });

    // Download file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_report_${selectedPeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Report exported successfully');
  };

  if (loading && !reportData) {
    return (
      <AdminLayout role="ADMIN">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into your platform performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportReport}
              disabled={!reportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Period Selection */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="custom">Custom range</option>
              </select>

              {selectedPeriod === 'custom' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={fetchReportData}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {reportData && (
              <div className="text-sm text-gray-500">
                Report period: {formatDate(reportData.period.start)} to {formatDate(reportData.period.end)} ({reportData.period.days} days)
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'stores', label: 'Top Stores', icon: BuildingStorefrontIcon },
              { id: 'activities', label: 'Recent Activities', icon: EyeIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {reportData && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalUsers.current.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">+{reportData.overview.totalUsers.new} new</p>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className={`flex items-center mt-2 ${getGrowthColor(reportData.overview.totalUsers.growth)}`}>
                      {(() => {
                        const GrowthIcon = getGrowthIcon(reportData.overview.totalUsers.growth);
                        return <GrowthIcon className="h-4 w-4 mr-1" />;
                      })()}
                      <span className="text-sm font-medium">{formatPercentage(reportData.overview.totalUsers.growth)}</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Stores</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalStores.current.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">+{reportData.overview.totalStores.new} new</p>
                      </div>
                      <div className="flex items-center">
                        <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <div className={`flex items-center mt-2 ${getGrowthColor(reportData.overview.totalStores.growth)}`}>
                      {(() => {
                        const GrowthIcon = getGrowthIcon(reportData.overview.totalStores.growth);
                        return <GrowthIcon className="h-4 w-4 mr-1" />;
                      })()}
                      <span className="text-sm font-medium">{formatPercentage(reportData.overview.totalStores.growth)}</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.overview.orders.total.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center">
                        <ChartBarIcon className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className={`flex items-center mt-2 ${getGrowthColor(reportData.overview.orders.growth)}`}>
                      {(() => {
                        const GrowthIcon = getGrowthIcon(reportData.overview.orders.growth);
                        return <GrowthIcon className="h-4 w-4 mr-1" />;
                      })()}
                      <span className="text-sm font-medium">{formatPercentage(reportData.overview.orders.growth)}</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(reportData.overview.revenue.total)}</p>
                      </div>
                      <div className="flex items-center">
                        <BanknotesIcon className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                    <div className={`flex items-center mt-2 ${getGrowthColor(reportData.overview.revenue.growth)}`}>
                      {(() => {
                        const GrowthIcon = getGrowthIcon(reportData.overview.revenue.growth);
                        return <GrowthIcon className="h-4 w-4 mr-1" />;
                      })()}
                      <span className="text-sm font-medium">{formatPercentage(reportData.overview.revenue.growth)}</span>
                    </div>
                  </div>
                </div>

                {/* Subscription Stats */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{reportData.overview.subscriptions.total}</p>
                      <p className="text-sm text-gray-500">Total Subscriptions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{reportData.overview.subscriptions.active}</p>
                      <p className="text-sm text-gray-500">Active Subscriptions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{reportData.overview.subscriptions.conversionRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-500">Conversion Rate</p>
                    </div>
                  </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">Chart visualization would go here</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">Chart visualization would go here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stores' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Top Performing Stores</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.topStores.map((store, index) => (
                        <tr key={store.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium mr-3">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{store.name}</p>
                                  <p className="text-sm text-gray-500">{store.subdomain}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{store.owner.name}</p>
                              <p className="text-sm text-gray-500">{store.owner.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(store.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {store.orders.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {store.products.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              store.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {store.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Recent Admin Activities</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {reportData.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                          <EyeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Action: {activity.action.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              Target: {activity.targetType}
                            </span>
                            <span className="text-xs text-gray-500">
                              By: {activity.admin.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}