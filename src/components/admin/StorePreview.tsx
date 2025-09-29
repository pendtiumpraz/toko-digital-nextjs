'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  TagIcon,
  EyeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  slug: string;
  featured: boolean;
  category: string;
  image?: string | null;
  imageAlt: string;
  tags: string[];
  discount?: number | null;
}

interface StorePreviewData {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  subdomain: string;
  customDomain?: string;
  isActive: boolean;
  isVerified: boolean;
  whatsappNumber: string;
  email?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: string;
    currency: string;
  };
  products: Product[];
  featuredProducts: Product[];
  productsByCategory: Record<string, Product[]>;
  whatsapp?: {
    isEnabled: boolean;
    phoneNumber: string;
    businessName: string;
    greetingMessage: string;
  };
  owner: {
    name: string;
  };
  adminPreview?: boolean;
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalActiveProducts: number;
  };
  storageUsed?: number;
  storageLimit?: number;
  rating?: number;
  totalReviews?: number;
  totalSales?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface StorePreviewProps {
  subdomain: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function StorePreview({ subdomain, isOpen, onClose }: StorePreviewProps) {
  const [storeData, setStoreData] = useState<StorePreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');

  useEffect(() => {
    if (isOpen && subdomain) {
      fetchStorePreview();
    }
  }, [isOpen, subdomain]);

  const fetchStorePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/stores/${subdomain}/preview`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load store preview');
      }

      const data = await response.json();
      setStoreData(data);
    } catch (error) {
      console.error('Error fetching store preview:', error);
      setError(error instanceof Error ? error.message : 'Failed to load store preview');
      toast.error('Failed to load store preview');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getProductsToShow = () => {
    if (!storeData) return [];

    if (activeCategory === 'all') {
      return storeData.products;
    } else if (activeCategory === 'featured') {
      return storeData.featuredProducts;
    } else {
      return storeData.productsByCategory[activeCategory] || [];
    }
  };

  const getCategories = () => {
    if (!storeData) return [];

    const categories = ['all', 'featured', ...Object.keys(storeData.productsByCategory)];
    return categories.filter(cat => {
      if (cat === 'all') return true;
      if (cat === 'featured') return storeData.featuredProducts.length > 0;
      return storeData.productsByCategory[cat]?.length > 0;
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Store Preview</h2>
              {storeData && (
                <span className="text-sm text-gray-500">
                  {storeData.subdomain}.example.com
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {storeData?.adminPreview && (
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setCurrentView('store')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentView === 'store'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Store View
                  </button>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentView === 'admin'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Admin View
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Preview</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchStorePreview}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : storeData ? (
              <>
                {currentView === 'admin' && storeData.adminPreview ? (
                  // Admin View
                  <div className="p-6 space-y-6">
                    {/* Admin Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{storeData.stats?.totalOrders || 0}</div>
                        <div className="text-sm text-blue-600">Total Orders</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(storeData.stats?.totalRevenue || 0, storeData.theme.currency)}
                        </div>
                        <div className="text-sm text-green-600">Total Revenue</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">{storeData.stats?.totalProducts || 0}</div>
                        <div className="text-sm text-purple-600">Total Products</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600">{storeData.stats?.totalActiveProducts || 0}</div>
                        <div className="text-sm text-yellow-600">Active Products</div>
                      </div>
                    </div>

                    {/* Store Status */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Status</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Status: </span>
                          <span className={`font-medium ${storeData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {storeData.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Verified: </span>
                          <span className={`font-medium ${storeData.isVerified ? 'text-blue-600' : 'text-yellow-600'}`}>
                            {storeData.isVerified ? 'Yes' : 'Pending'}
                          </span>
                        </div>
                        {storeData.storageUsed !== undefined && storeData.storageLimit !== undefined && (
                          <div className="col-span-2">
                            <span className="text-sm text-gray-600">Storage: </span>
                            <span className="font-medium">
                              {formatStorage(storeData.storageUsed)} / {formatStorage(storeData.storageLimit)}
                            </span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full ${
                                  (storeData.storageUsed / storeData.storageLimit) * 100 >= 90
                                    ? 'bg-red-500'
                                    : (storeData.storageUsed / storeData.storageLimit) * 100 >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, (storeData.storageUsed / storeData.storageLimit) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Products */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Products</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {storeData.products.slice(0, 6).map((product) => (
                          <div key={product.id} className="border rounded-lg p-4">
                            <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                              {product.image ? (
                                <img src={product.image} alt={product.imageAlt} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <TagIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h4>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(product.price, storeData.theme.currency)}</p>
                            {product.comparePrice && (
                              <p className="text-sm text-gray-500 line-through">{formatCurrency(product.comparePrice, storeData.theme.currency)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Store View (Customer Perspective)
                  <div style={{ fontFamily: storeData.theme.fontFamily }}>
                    {/* Store Header */}
                    <div className="relative">
                      {storeData.banner && (
                        <div className="h-48 bg-gray-200 overflow-hidden">
                          <img src={storeData.banner} alt="Store banner" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="bg-white border-b">
                        <div className="max-w-6xl mx-auto px-4 py-6">
                          <div className="flex items-center space-x-4">
                            {storeData.logo ? (
                              <img src={storeData.logo} alt={storeData.name} className="h-16 w-16 rounded-lg object-cover" />
                            ) : (
                              <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h1 className="text-2xl font-bold" style={{ color: storeData.theme.primaryColor }}>
                                {storeData.name}
                              </h1>
                              {storeData.description && (
                                <p className="text-gray-600 mt-1">{storeData.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>By {storeData.owner.name}</span>
                                {storeData.isVerified && (
                                  <span className="flex items-center text-blue-600">
                                    <StarSolidIcon className="h-4 w-4 mr-1" />
                                    Verified Store
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Store Content */}
                    <div className="max-w-6xl mx-auto px-4 py-6">
                      {/* Contact Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {storeData.whatsappNumber && (
                            <div className="flex items-center space-x-2">
                              <PhoneIcon className="h-4 w-4 text-green-600" />
                              <span>{storeData.whatsappNumber}</span>
                            </div>
                          )}
                          {storeData.email && (
                            <div className="flex items-center space-x-2">
                              <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                              <span>{storeData.email}</span>
                            </div>
                          )}
                          {(storeData.address.city || storeData.address.state) && (
                            <div className="flex items-center space-x-2">
                              <MapPinIcon className="h-4 w-4 text-red-600" />
                              <span>
                                {[storeData.address.city, storeData.address.state].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Categories */}
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {getCategories().map((category) => (
                            <button
                              key={category}
                              onClick={() => setActiveCategory(category)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                activeCategory === category
                                  ? 'text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              style={{
                                ...(activeCategory === category && {
                                  backgroundColor: storeData.theme.primaryColor
                                })
                              }}
                            >
                              {category === 'all' ? 'All Products' :
                               category === 'featured' ? 'Featured' :
                               category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Products Grid */}
                      <div className={`grid gap-6 ${
                        storeData.theme.layout === 'GRID'
                          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                          : 'grid-cols-1'
                      }`}>
                        {getProductsToShow().map((product) => (
                          <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-gray-200 relative overflow-hidden">
                              {product.image ? (
                                <img src={product.image} alt={product.imageAlt} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <TagIcon className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                              {product.featured && (
                                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                                  Featured
                                </div>
                              )}
                              {product.discount && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                  -{product.discount}%
                                </div>
                              )}
                              <div className="absolute bottom-2 right-2 flex space-x-2">
                                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                                  <HeartIcon className="h-4 w-4 text-gray-600" />
                                </button>
                                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                                  <EyeIcon className="h-4 w-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-bold" style={{ color: storeData.theme.primaryColor }}>
                                    {formatCurrency(product.price, storeData.theme.currency)}
                                  </p>
                                  {product.comparePrice && (
                                    <p className="text-sm text-gray-500 line-through">
                                      {formatCurrency(product.comparePrice, storeData.theme.currency)}
                                    </p>
                                  )}
                                </div>
                                <button
                                  className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                                  style={{ backgroundColor: storeData.theme.primaryColor }}
                                >
                                  Add to Cart
                                </button>
                              </div>
                              {product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {product.tags.map((tag, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {getProductsToShow().length === 0 && (
                        <div className="text-center py-12">
                          <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                          <p className="text-gray-600">
                            {activeCategory === 'all'
                              ? 'This store doesn\'t have any products yet.'
                              : `No products found in the ${activeCategory} category.`
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {/* WhatsApp Float Button */}
                    {storeData.whatsapp?.isEnabled && (
                      <div className="fixed bottom-6 right-6 z-10">
                        <button
                          className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                          title={`Chat with ${storeData.whatsapp.businessName || storeData.name}`}
                        >
                          <PhoneIcon className="h-6 w-6" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}