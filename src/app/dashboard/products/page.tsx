'use client';

import { useState, useEffect } from 'react';
import { PlusCircleIcon, PencilIcon, TrashIcon, PhotoIcon, VideoCameraIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  videos: string[];
  category: string;
  sku: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  views: number;
  sales: number;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data
  useEffect(() => {
    setProducts([
      {
        id: '1',
        name: 'Laptop Gaming ROG',
        description: 'High-performance gaming laptop',
        price: 25000000,
        stock: 5,
        images: ['/placeholder.jpg'],
        videos: [],
        category: 'Electronics',
        sku: 'LAP-001',
        status: 'active',
        views: 1250,
        sales: 23,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 350000,
        stock: 0,
        images: ['/placeholder.jpg'],
        videos: [],
        category: 'Accessories',
        sku: 'MOU-002',
        status: 'out_of_stock',
        views: 890,
        sales: 145,
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 1500000,
        stock: 12,
        images: ['/placeholder.jpg'],
        videos: ['/video.mp4'],
        category: 'Accessories',
        sku: 'KEY-003',
        status: 'active',
        views: 2100,
        sales: 67,
        createdAt: '2024-01-20'
      }
    ]);
  }, []);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'stock-low':
          return a.stock - b.stock;
        case 'best-selling':
          return b.sales - a.sales;
        default:
          return 0;
      }
    });

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

  const handleWhatsAppShare = (product: Product) => {
    const message = `Check out ${product.name} - ${formatPrice(product.price)}\n${product.description}\nOrder now!`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Active Products</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => p.status === 'active').length}
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
          </select>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="stock-low">Stock: Low to High</option>
            <option value="best-selling">Best Selling</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200">
                <div className="absolute top-2 right-2 flex space-x-2">
                  {product.images.length > 0 && (
                    <span className="bg-white p-1 rounded">
                      <PhotoIcon className="h-4 w-4 text-gray-600" />
                    </span>
                  )}
                  {product.videos.length > 0 && (
                    <span className="bg-white p-1 rounded">
                      <VideoCameraIcon className="h-4 w-4 text-gray-600" />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center h-full">
                  <PhotoIcon className="h-16 w-16 text-gray-400" />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex justify-between items-center mb-3">
                  <p className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {product.views} views
                  </span>
                  <span>{product.sales} sold</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleWhatsAppShare(product)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                  >
                    Share
                  </button>
                  <button className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add/Edit Modal Placeholder */}
      {(isAddModalOpen || selectedProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-gray-600 mb-4">Product form will be implemented here</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}