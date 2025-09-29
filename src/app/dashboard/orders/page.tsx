'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  PrinterIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  PhoneIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { printInvoice, downloadInvoiceHTML } from '@/lib/invoice';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
  subtotal: number;
  profit: number;
  variant?: string;
  product: {
    id: string;
    name: string;
    sku?: string;
    images: Array<{
      url: string;
      alt?: string;
    }>;
  };
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  whatsappNumber?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId?: string;
  customer?: Customer;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerWhatsapp?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingPostalCode?: string;
  shippingNotes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  totalCost: number;
  totalProfit: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'WHATSAPP' | 'BANK_TRANSFER' | 'COD' | 'STRIPE' | 'PAYPAL' | 'MIDTRANS';
  transactionId?: string;
  paidAt?: Date | string;
  notes?: string;
  source: 'WEBSITE' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'MANUAL';
  trackingNumber?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Get store ID from context or localStorage (you might need to adjust this)
  const getStoreId = () => {
    // For now, using a mock store ID - in a real app, this would come from auth context
    return 'store-id-123';
  };

  // Fetch orders from API
  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        storeId: getStoreId(),
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (filterStatus !== 'all') {
        params.append('status', filterStatus.toUpperCase());
      }

      if (filterPayment !== 'all') {
        params.append('paymentStatus', filterPayment.toUpperCase());
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/orders?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch orders');
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterPayment, searchQuery]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'SHIPPED':
        return <TruckIcon className="h-5 w-5 text-purple-600" />;
      case 'DELIVERED':
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Orders are already filtered on the server side, so we don't need client-side filtering
  const filteredOrders = orders;

  const handleWhatsAppContact = (order: Order) => {
    const customerName = order.customer?.name || order.customerName;
    const customerPhone = order.customer?.whatsappNumber || order.customerWhatsapp || order.customerPhone;

    const message = `Hi ${customerName}, regarding your order ${order.orderNumber}. How can we help you today?`;
    const phone = customerPhone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSendOrderConfirmation = async (order: Order) => {
    try {
      const response = await fetch('/api/whatsapp/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          storeId: order.storeId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send order confirmation');
      }

      const result = await response.json();

      if (result.success && result.data?.whatsappUrl) {
        // Open WhatsApp with the prepared message
        window.open(result.data.whatsappUrl, '_blank');
        toast.success('WhatsApp message prepared successfully');
      } else {
        throw new Error('Failed to prepare WhatsApp message');
      }
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send order confirmation');
    }
  };

  const handlePrintInvoice = (order: Order) => {
    const mockStore = {
      name: 'My Digital Store',
      email: 'info@mydigitalstore.com',
      whatsappNumber: '+62 812 3456 7890',
      street: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      country: 'Indonesia',
      postalCode: '12345'
    };

    const invoiceOrder = {
      ...order,
      customer: {
        id: order.customerId || '',
        name: order.customerName,
        email: order.customerEmail || undefined,
        phone: order.customerPhone,
        whatsappNumber: order.customerWhatsapp
      }
    };
    printInvoice(invoiceOrder as any, mockStore);
  };

  const handleDownloadInvoice = (order: Order) => {
    const mockStore = {
      name: 'My Digital Store',
      email: 'info@mydigitalstore.com',
      whatsappNumber: '+62 812 3456 7890',
      street: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      country: 'Indonesia',
      postalCode: '12345'
    };

    const invoiceOrder = {
      ...order,
      customer: {
        id: order.customerId || '',
        name: order.customerName,
        email: order.customerEmail || undefined,
        phone: order.customerPhone,
        whatsappNumber: order.customerWhatsapp
      }
    };
    downloadInvoiceHTML(invoiceOrder as any, mockStore);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          status: newStatus.toUpperCase()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }

      const updatedOrder = await response.json();

      // Update the order in the local state
      setOrders(orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ));

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Export Orders
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Manual Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Processing</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(o => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">
            {orders.filter(o => o.status === 'SHIPPED').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by order # or customer..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Payment Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-2" />
            <span className="text-red-600">{error}</span>
            <button
              onClick={() => fetchOrders()}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400">Try adjusting your filters or create a new order</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{order.source}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.customer?.name || order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customer?.phone || order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.length} item(s)
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items[0]?.name}{order.items.length > 1 && '...'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </div>
                        <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.toLowerCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleWhatsAppContact(order)}
                              className="text-green-600 hover:text-green-900"
                              title="Contact via WhatsApp"
                            >
                              <ChatBubbleLeftIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleSendOrderConfirmation(order)}
                              className="text-green-700 hover:text-green-900"
                              title="Send Order Confirmation"
                            >
                              <PhoneIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => handlePrintInvoice(order)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Print Invoice"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Download Invoice"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span> of{' '}
                      <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-gray-600">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedOrder.customer?.name || selectedOrder.customerName}</p>
                  {(selectedOrder.customer?.email || selectedOrder.customerEmail) && (
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email || selectedOrder.customerEmail}</p>
                  )}
                  <p><span className="font-medium">Phone:</span> {selectedOrder.customer?.phone || selectedOrder.customerPhone}</p>
                  {selectedOrder.customerWhatsapp && (
                    <p><span className="font-medium">WhatsApp:</span> {selectedOrder.customerWhatsapp}</p>
                  )}
                  {(selectedOrder.shippingStreet || selectedOrder.shippingCity) && (
                    <p><span className="font-medium">Address:</span>
                      {[selectedOrder.shippingStreet, selectedOrder.shippingCity, selectedOrder.shippingState, selectedOrder.shippingCountry].filter(Boolean).join(', ')}
                      {selectedOrder.shippingPostalCode && ` ${selectedOrder.shippingPostalCode}`}
                    </p>
                  )}
                  {selectedOrder.shippingNotes && (
                    <p><span className="font-medium">Shipping Notes:</span> {selectedOrder.shippingNotes}</p>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.toLowerCase()}
                    </span>
                  </p>
                  <p><span className="font-medium">Payment:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus.toLowerCase()}
                    </span>
                  </p>
                  <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                  <p><span className="font-medium">Source:</span> {selectedOrder.source}</p>
                  {selectedOrder.transactionId && (
                    <p><span className="font-medium">Transaction ID:</span> {selectedOrder.transactionId}</p>
                  )}
                  {selectedOrder.trackingNumber && (
                    <p><span className="font-medium">Tracking Number:</span> {selectedOrder.trackingNumber}</p>
                  )}
                  {selectedOrder.paidAt && (
                    <p><span className="font-medium">Paid At:</span> {formatDate(selectedOrder.paidAt)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm">Item</th>
                      <th className="px-4 py-2 text-center text-sm">Quantity</th>
                      <th className="px-4 py-2 text-right text-sm">Price</th>
                      <th className="px-4 py-2 text-right text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatPrice(item.price)}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-2 text-sm text-right font-medium">Subtotal:</td>
                      <td className="px-4 py-2 text-sm text-right font-medium">
                        {formatPrice(selectedOrder.subtotal)}
                      </td>
                    </tr>
                    {selectedOrder.shipping > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-2 text-sm text-right font-medium">Shipping:</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          {formatPrice(selectedOrder.shipping)}
                        </td>
                      </tr>
                    )}
                    {selectedOrder.tax > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-2 text-sm text-right font-medium">Tax:</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          {formatPrice(selectedOrder.tax)}
                        </td>
                      </tr>
                    )}
                    {selectedOrder.discount > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-2 text-sm text-right font-medium text-green-600">Discount:</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-green-600">
                          -{formatPrice(selectedOrder.discount)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={3} className="px-4 py-2 text-sm text-right">Total:</td>
                      <td className="px-4 py-2 text-sm text-right text-blue-600">
                        {formatPrice(selectedOrder.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleWhatsAppContact(selectedOrder)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                  Contact Customer
                </button>
                <button
                  onClick={() => handleSendOrderConfirmation(selectedOrder)}
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Send Confirmation
                </button>
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print Invoice
                </button>
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
              </div>
              <div className="flex space-x-3">
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}