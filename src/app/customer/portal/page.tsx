'use client';

import { useState } from 'react';
import {
  ShoppingBagIcon,
  TruckIcon,
  HeartIcon,
  MapPinIcon,
  CreditCardIcon,
  UserCircleIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock customer data
  const customer = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+62 812 9876 5432',
    memberSince: '2023-06-15',
    points: 2450,
    tier: 'Gold'
  };

  // Mock orders
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-0156',
      date: '2024-01-18',
      status: 'shipped',
      total: 1875000,
      items: [
        { id: '1', name: 'Wireless Headphones', quantity: 1, price: 1500000 },
        { id: '2', name: 'Phone Case', quantity: 2, price: 187500 }
      ],
      trackingNumber: 'JNE-1234567890',
      estimatedDelivery: '2024-01-22'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-0142',
      date: '2024-01-10',
      status: 'delivered',
      total: 450000,
      items: [
        { id: '3', name: 'USB Cable', quantity: 3, price: 150000 }
      ]
    }
  ];

  // Mock wishlist
  const wishlist = [
    { id: '1', name: 'Gaming Laptop', price: 25000000, image: '/laptop.jpg', inStock: true },
    { id: '2', name: 'Mechanical Keyboard', price: 1500000, image: '/keyboard.jpg', inStock: true },
    { id: '3', name: 'Gaming Mouse', price: 750000, image: '/mouse.jpg', inStock: false }
  ];

  // Mock addresses
  const addresses = [
    {
      id: '1',
      label: 'Home',
      name: 'Sarah Johnson',
      phone: '+62 812 9876 5432',
      address: 'Jl. Sudirman No. 45, RT 05/RW 02',
      city: 'Jakarta Selatan',
      postalCode: '12190',
      isDefault: true
    },
    {
      id: '2',
      label: 'Office',
      name: 'Sarah Johnson',
      phone: '+62 812 9876 5432',
      address: 'Menara BCA Lt. 15',
      city: 'Jakarta Pusat',
      postalCode: '10310',
      isDefault: false
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Order History</h2>

            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow p-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Orders
                </button>

                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedOrder.orderNumber}</h3>
                      <p className="text-gray-500">Ordered on {selectedOrder.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {selectedOrder.trackingNumber && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Tracking Number</p>
                        <p className="font-semibold">{selectedOrder.trackingNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600">Estimated Delivery</p>
                        <p className="font-semibold">{selectedOrder.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold">Items</h4>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gray-200 rounded"></div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Track Order
                  </button>
                  <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Download Invoice
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} x {item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="font-semibold">{formatPrice(order.total)}</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'wishlist':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">My Wishlist</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{item.name}</h3>
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <div className="flex space-x-2">
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <HeartIcon className="h-5 w-5 fill-current" />
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          disabled={!item.inStock}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Saved Addresses</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add New Address
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <span className="font-semibold">{addr.label}</span>
                    </div>
                    {addr.isDefault && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">{addr.name}</p>
                    <p>{addr.phone}</p>
                    <p>{addr.address}</p>
                    <p>{addr.city}, {addr.postalCode}</p>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                    {!addr.isDefault && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">Set as Default</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">My Profile</h2>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                  <p className="text-gray-500">{customer.tier} Member</p>
                  <div className="flex items-center mt-1">
                    <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm">{customer.points} Points</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={customer.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={customer.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={customer.phone}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Change Password
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Loyalty Program</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Tier</span>
                    <span className="font-semibold text-yellow-600">{customer.tier}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">550 points to Platinum</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Your Benefits</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 10% discount on all purchases</li>
                    <li>• Free shipping on orders above Rp 500.000</li>
                    <li>• Early access to sales</li>
                    <li>• Birthday bonus points</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Customer Portal</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back, {customer.name}</span>
              <button className="text-sm text-blue-600 hover:text-blue-700">Sign Out</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-1">
                {[
                  { id: 'orders', label: 'My Orders', icon: ShoppingBagIcon },
                  { id: 'wishlist', label: 'Wishlist', icon: HeartIcon },
                  { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
                  { id: 'profile', label: 'Profile', icon: UserCircleIcon }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-4 mt-4">
              <h3 className="font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Balance</span>
                  <span className="font-medium text-yellow-600">{customer.points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">Jun 2023</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}