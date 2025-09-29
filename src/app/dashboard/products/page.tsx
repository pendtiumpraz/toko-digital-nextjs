'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductModal, { Product } from '@/components/products/ProductModal';

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Modal states
  const [productModal, setProductModal] = useState({
    isOpen: false,
    mode: 'add' as 'add' | 'edit' | 'view',
    product: null as Product | null
  });

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Import/Export states
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);

  const categories = [
    'ELECTRONICS',
    'FASHION',
    'FOOD_BEVERAGES',
    'HEALTH_BEAUTY',
    'HOME_LIVING',
    'BOOKS_STATIONERY',
    'SPORTS_OUTDOORS',
    'TOYS_GAMES',
    'AUTOMOTIVE',
    'SERVICES',
    'DIGITAL_PRODUCTS',
    'OTHER'
  ];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        includeInactive: 'true'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if API fails
      setProducts([
        {
          id: '1',
          name: 'Laptop Gaming ROG',
          description: 'High-performance gaming laptop',
          price: 25000000,
          stock: 5,
          images: [{ url: '/placeholder.jpg', alt: 'Product image', isPrimary: true, source: 'UPLOAD' }],
          videos: [],
          category: 'ELECTRONICS',
          sku: 'LAP-001',
          isActive: true,
          featured: false,
          slug: 'laptop-gaming-rog',
          cost: 20000000,
          trackInventory: true,
          lowStockAlert: 5,
          weightUnit: 'KG',
          dimensionUnit: 'CM',
          visibility: 'VISIBLE',
          publishDate: '2024-01-15',
          tags: ['gaming', 'laptop']
        } as Product
      ]);
      setPagination({ page: 1, limit: 12, total: 1, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, sortBy, sortOrder, searchQuery, filterCategory, filterStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductSave = async (productData: Partial<Product>) => {
    try {
      const method = productModal.mode === 'add' ? 'POST' : 'PUT';
      const url = '/api/products';

      const body = productModal.mode === 'edit'
        ? { ...productData, id: productModal.product?.id }
        : { ...productData, storeId: 'current-store-id' }; // This should come from context/session

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to save product');

      setProductModal({ isOpen: false, mode: 'add', product: null });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete product');

      setProductModal({ isOpen: false, mode: 'add', product: null });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedProducts.length === 0) return;

    try {
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productIds: selectedProducts,
          storeId: 'current-store-id', // This should come from context/session
          updateData: data
        })
      });

      if (!response.ok) throw new Error('Failed to perform bulk action');

      const result = await response.json();
      alert(result.message);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id!));
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/products/bulk?action=export_csv&storeId=current-store-id');
      if (!response.ok) throw new Error('Failed to export products');

      const data = await response.json();

      // Convert to CSV and download
      const csvContent = [
        Object.keys(data.data[0]).join(','),
        ...data.data.map((row: any) => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Failed to export products');
    }
  };

  const handleImportCSV = async () => {
    if (!csvData.length) return;

    try {
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_csv',
          storeId: 'current-store-id', // This should come from context/session
          csvData
        })
      });

      if (!response.ok) throw new Error('Failed to import products');

      const result = await response.json();
      alert(result.message);
      setShowImportModal(false);
      setCsvData([]);
      setCsvFile(null);
      fetchProducts();
    } catch (error) {
      console.error('Error importing products:', error);
      alert('Failed to import products');
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {} as any);
      }).filter(row => row.name); // Filter out empty rows

      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (stock <= 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleWhatsAppShare = (product: Product) => {
    const message = `Check out ${product.name} - ${formatPrice(product.price)}\n${product.description}\nOrder now!`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Import/Export Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Import/Export</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleExportCSV}
                        className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                        Export CSV
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowImportModal(true)}
                        className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Import CSV
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            <button
              onClick={() => setProductModal({ isOpen: true, mode: 'add', product: null })}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-2xl font-bold">{pagination.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Active Products</p>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.isActive).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock === 0).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Low Stock Alert</p>
            <p className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.stock > 0 && p.stock <= 5).length}
            </p>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProducts.length} products selected
                </span>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('update_status', { isActive: true })}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('update_status', { isActive: false })}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('duplicate')}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{formatCategory(cat)}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="low_stock">Low Stock</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Newest First</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="text-sm text-gray-600">Select all products</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const isSelected = selectedProducts.includes(product.id!);

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 relative ${
                      isSelected ? 'ring-2 ring-blue-500 shadow-xl' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectProduct(product.id!)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>

                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-200">
                      <div className="absolute top-2 right-2 flex space-x-2">
                        {product.images && product.images.length > 0 && (
                          <span className="bg-white p-1 rounded">
                            <PhotoIcon className="h-4 w-4 text-gray-600" />
                          </span>
                        )}
                        {product.videos && product.videos.length > 0 && (
                          <span className="bg-white p-1 rounded">
                            <VideoCameraIcon className="h-4 w-4 text-gray-600" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center h-full">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.jpg';
                            }}
                          />
                        ) : (
                          <PhotoIcon className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                          <p className="text-gray-500 text-sm">
                            {product.sku && `SKU: ${product.sku}`}
                            {product.category && ` • ${formatCategory(product.category)}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                          {!product.isActive && (
                            <span className="px-2 py-1 rounded-full text-xs text-gray-600 bg-gray-100">
                              Inactive
                            </span>
                          )}
                          {product.featured && (
                            <span className="px-2 py-1 rounded-full text-xs text-purple-600 bg-purple-100">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <p className="text-sm text-gray-400 line-through">
                              {formatPrice(product.comparePrice)}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {0} views
                        </span>
                        <span>{0} sold</span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setProductModal({
                            isOpen: true,
                            mode: 'view',
                            product
                          })}
                          className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 flex items-center justify-center text-sm"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => setProductModal({
                            isOpen: true,
                            mode: 'edit',
                            product
                          })}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center text-sm"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleWhatsAppShare(product)}
                          className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                        >
                          Share
                        </button>
                        <button
                          onClick={() => handleProductDelete(product.id!)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </Fragment>
                  ))}

                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first product</p>
                <button
                  onClick={() => setProductModal({ isOpen: true, mode: 'add', product: null })}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Product
                </button>
              </div>
            )}
          </>
        )}

        {/* Product Modal */}
        <ProductModal
          isOpen={productModal.isOpen}
          onClose={() => setProductModal({ isOpen: false, mode: 'add', product: null })}
          product={productModal.product}
          onSave={handleProductSave}
          onDelete={handleProductDelete}
          mode={productModal.mode}
        />

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Import Products</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCsvFile(file);
                        parseCSV(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {csvData.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Preview: {csvData.length} products found
                    </p>
                    <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm">
                      {csvData.slice(0, 5).map((row, index) => (
                        <div key={index} className="py-1 border-b last:border-b-0">
                          {row.name} - {formatPrice(parseFloat(row.price) || 0)}
                        </div>
                      ))}
                      {csvData.length > 5 && (
                        <div className="text-gray-500 py-1">
                          ... and {csvData.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportCSV}
                    disabled={!csvData.length}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import Products
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