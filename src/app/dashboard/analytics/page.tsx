'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [compareMode, setCompareMode] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: price >= 1000000000 ? 'compact' : 'standard'
    }).format(price);
  };

  // Mock data
  const stats = {
    revenue: { value: 125650000, change: 12.5, previous: 111800000 },
    orders: { value: 342, change: 8.3, previous: 316 },
    avgOrderValue: { value: 367400, change: 4.2, previous: 353800 },
    customers: { value: 289, change: 15.6, previous: 250 },
    conversionRate: { value: 3.2, change: -0.4, previous: 3.6 },
    cartAbandonment: { value: 68.5, change: -2.3, previous: 70.8 }
  };

  const topProducts = [
    { name: 'Laptop Gaming ROG', sales: 45, revenue: 1125000000, growth: 23.5 },
    { name: 'Mechanical Keyboard', sales: 128, revenue: 192000000, growth: 15.2 },
    { name: 'Wireless Mouse', sales: 203, revenue: 71050000, growth: -5.3 },
    { name: 'USB-C Hub', sales: 87, revenue: 43500000, growth: 8.7 },
    { name: 'Monitor 27"', sales: 31, revenue: 124000000, growth: 12.1 }
  ];

  const customerSegments = [
    { segment: 'New Customers', count: 145, revenue: 43500000, avgOrder: 300000 },
    { segment: 'Returning', count: 89, revenue: 53400000, avgOrder: 600000 },
    { segment: 'VIP (>5 orders)', count: 23, revenue: 28750000, avgOrder: 1250000 },
    { segment: 'Inactive (>30 days)', count: 32, revenue: 0, avgOrder: 0 }
  ];

  const trafficSources = [
    { source: 'Direct', visits: 4532, conversion: 4.2, revenue: 38000000 },
    { source: 'WhatsApp', visits: 3211, conversion: 6.8, revenue: 65000000 },
    { source: 'Instagram', visits: 2876, conversion: 2.3, revenue: 16500000 },
    { source: 'Google', visits: 1234, conversion: 3.5, revenue: 6150000 }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Monitor your store performance and financial metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Compare
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            {stats.revenue.change > 0 ? (
              <span className="text-green-600 text-sm flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stats.revenue.change}%
              </span>
            ) : (
              <span className="text-red-600 text-sm flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.revenue.change)}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Revenue</p>
          <p className="text-xl font-bold">{formatPrice(stats.revenue.value)}</p>
          <p className="text-xs text-gray-400 mt-1">vs {formatPrice(stats.revenue.previous)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
            {stats.orders.change > 0 ? (
              <span className="text-green-600 text-sm flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stats.orders.change}%
              </span>
            ) : (
              <span className="text-red-600 text-sm flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.orders.change)}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Orders</p>
          <p className="text-xl font-bold">{stats.orders.value}</p>
          <p className="text-xs text-gray-400 mt-1">vs {stats.orders.previous}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            {stats.avgOrderValue.change > 0 ? (
              <span className="text-green-600 text-sm flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stats.avgOrderValue.change}%
              </span>
            ) : (
              <span className="text-red-600 text-sm flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.avgOrderValue.change)}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Avg Order Value</p>
          <p className="text-xl font-bold">{formatPrice(stats.avgOrderValue.value)}</p>
          <p className="text-xs text-gray-400 mt-1">vs {formatPrice(stats.avgOrderValue.previous)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <UserGroupIcon className="h-8 w-8 text-orange-600" />
            {stats.customers.change > 0 ? (
              <span className="text-green-600 text-sm flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stats.customers.change}%
              </span>
            ) : (
              <span className="text-red-600 text-sm flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.customers.change)}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Customers</p>
          <p className="text-xl font-bold">{stats.customers.value}</p>
          <p className="text-xs text-gray-400 mt-1">vs {stats.customers.previous}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <FunnelIcon className="h-8 w-8 text-teal-600" />
            {stats.conversionRate.change > 0 ? (
              <span className="text-green-600 text-sm flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stats.conversionRate.change}%
              </span>
            ) : (
              <span className="text-red-600 text-sm flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.conversionRate.change)}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Conversion Rate</p>
          <p className="text-xl font-bold">{stats.conversionRate.value}%</p>
          <p className="text-xs text-gray-400 mt-1">vs {stats.conversionRate.previous}%</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCartIcon className="h-8 w-8 text-red-600" />
            {stats.cartAbandonment.change < 0 ? (
              <span className="text-green-600 text-sm flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.cartAbandonment.change)}%
              </span>
            ) : (
              <span className="text-red-600 text-sm flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stats.cartAbandonment.change}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Cart Abandonment</p>
          <p className="text-xl font-bold">{stats.cartAbandonment.value}%</p>
          <p className="text-xs text-gray-400 mt-1">vs {stats.cartAbandonment.previous}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue Trend</h2>
            <select className="text-sm border rounded px-2 py-1">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-400">Revenue chart will be rendered here</p>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Order Status Distribution</h2>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-400">Order status pie chart will be rendered here</p>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Top Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="text-sm text-gray-600">{product.sales}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium">{formatPrice(product.revenue)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {product.growth > 0 ? (
                        <span className="text-green-600 text-sm flex items-center justify-end">
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                          {product.growth}%
                        </span>
                      ) : (
                        <span className="text-red-600 text-sm flex items-center justify-end">
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                          {Math.abs(product.growth)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Customer Segments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customerSegments.map((segment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{segment.segment}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="text-sm text-gray-600">{segment.count}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium">{formatPrice(segment.revenue)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-gray-600">{formatPrice(segment.avgOrder)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Traffic Sources & Conversion</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">View Details</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Visits</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Conversion Rate</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue/Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trafficSources.map((source, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{source.source}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-600">{source.visits.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(source.conversion / 10) * 100}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{source.conversion}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-medium">{formatPrice(source.revenue)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm text-gray-600">{formatPrice(source.revenue / source.visits)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex justify-center space-x-4">
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export to Excel
        </button>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Generate P&L Report
        </button>
        <button className="px-6 py-3 border rounded-lg hover:bg-gray-50 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Schedule Report
        </button>
      </div>
    </div>
  );
}