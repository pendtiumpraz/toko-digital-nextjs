'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  CloudArrowUpIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  TagIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export interface Product {
  id?: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  comparePrice?: number;
  cost: number;
  sku?: string;
  barcode?: string;
  stock: number;
  trackInventory: boolean;
  lowStockAlert: number;
  weight?: number;
  weightUnit: 'G' | 'KG' | 'LB' | 'OZ';
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit: 'CM' | 'M' | 'IN' | 'FT';
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  visibility: 'VISIBLE' | 'HIDDEN' | 'SCHEDULED';
  publishDate: string;
  featured: boolean;
  isActive: boolean;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
    source: 'UPLOAD' | 'DRIVE' | 'EXTERNAL';
  }>;
  videos: Array<{
    url: string;
    title?: string;
    source: 'YOUTUBE' | 'VIMEO' | 'UPLOAD';
    thumbnail?: string;
  }>;
  tags: string[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Partial<Product>) => void;
  onDelete?: (productId: string) => void;
  mode: 'add' | 'edit' | 'view';
}

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

const weightUnits = ['G', 'KG', 'LB', 'OZ'];
const dimensionUnits = ['CM', 'M', 'IN', 'FT'];
const visibilityOptions = ['VISIBLE', 'HIDDEN', 'SCHEDULED'];

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onSave,
  onDelete,
  mode
}: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: 'OTHER',
    subCategory: '',
    price: 0,
    comparePrice: 0,
    cost: 0,
    sku: '',
    barcode: '',
    stock: 0,
    trackInventory: true,
    lowStockAlert: 5,
    weight: 0,
    weightUnit: 'KG',
    length: 0,
    width: 0,
    height: 0,
    dimensionUnit: 'CM',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    visibility: 'VISIBLE',
    publishDate: new Date().toISOString().split('T')[0],
    featured: false,
    isActive: true,
    images: [],
    videos: [],
    tags: []
  });

  const [currentTab, setCurrentTab] = useState('basic');
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product && mode !== 'add') {
      setFormData({
        ...product,
        publishDate: product.publishDate ? new Date(product.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        description: '',
        category: 'OTHER',
        subCategory: '',
        price: 0,
        comparePrice: 0,
        cost: 0,
        sku: '',
        barcode: '',
        stock: 0,
        trackInventory: true,
        lowStockAlert: 5,
        weight: 0,
        weightUnit: 'KG',
        length: 0,
        width: 0,
        height: 0,
        dimensionUnit: 'CM',
        slug: '',
        metaTitle: '',
        metaDescription: '',
        visibility: 'VISIBLE',
        publishDate: new Date().toISOString().split('T')[0],
        featured: false,
        isActive: true,
        images: [],
        videos: [],
        tags: []
      });
    }
  }, [product, mode, isOpen]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && formData.name.length > 0) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.tags && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [
          ...(prev.images || []),
          {
            url: newImageUrl,
            alt: '',
            isPrimary: (prev.images?.length || 0) === 0,
            source: 'EXTERNAL' as const
          }
        ]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddVideo = () => {
    if (newVideoUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        videos: [
          ...(prev.videos || []),
          {
            url: newVideoUrl,
            title: '',
            source: newVideoUrl.includes('youtube') ? 'YOUTUBE' : 'VIMEO' as const,
            thumbnail: ''
          }
        ]
      }));
      setNewVideoUrl('');
    }
  };

  const handleRemoveVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos?.filter((_, i) => i !== index) || []
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Handle file drop logic here
    console.log('Files dropped:', e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (product?.id && onDelete && window.confirm('Are you sure you want to delete this product?')) {
      setIsLoading(true);
      try {
        await onDelete(product.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const calculateProfitMargin = () => {
    if (formData.price && formData.cost) {
      return formData.price > 0 ? (((formData.price - formData.cost) / formData.price) * 100).toFixed(2) : 0;
    }
    return 0;
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: TagIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'inventory', name: 'Inventory', icon: ChartBarIcon },
    { id: 'media', name: 'Media', icon: PhotoIcon },
    { id: 'seo', name: 'SEO', icon: EyeIcon },
  ];

  const getTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Product';
      case 'edit': return 'Edit Product';
      case 'view': return 'Product Details';
      default: return 'Product';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                    {getTitle()}
                  </Dialog.Title>
                  <div className="flex items-center space-x-2">
                    {mode === 'edit' && onDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          currentTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info Tab */}
                  {currentTab === 'basic' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            disabled={mode === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter product name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            value={formData.category || ''}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            disabled={mode === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            required
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>
                                {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          disabled={mode === 'view'}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          placeholder="Enter product description"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sub Category
                          </label>
                          <input
                            type="text"
                            value={formData.subCategory || ''}
                            onChange={(e) => handleInputChange('subCategory', e.target.value)}
                            disabled={mode === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter sub category"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={formData.slug || ''}
                            onChange={(e) => handleInputChange('slug', e.target.value)}
                            disabled={mode === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="product-slug"
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags?.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                              {mode !== 'view' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        {mode !== 'view' && (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Add tag"
                            />
                            <button
                              type="button"
                              onClick={handleAddTag}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing Tab */}
                  {currentTab === 'pricing' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price *
                          </label>
                          <input
                            type="number"
                            value={formData.price || 0}
                            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                            disabled={mode === 'view'}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Compare Price
                          </label>
                          <input
                            type="number"
                            value={formData.comparePrice || 0}
                            onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
                            disabled={mode === 'view'}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cost
                          </label>
                          <input
                            type="number"
                            value={formData.cost || 0}
                            onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                            disabled={mode === 'view'}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>

                      {/* Profit Calculation */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Profit Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Profit: </span>
                            <span className="font-medium">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format((formData.price || 0) - (formData.cost || 0))}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Margin: </span>
                            <span className="font-medium">{calculateProfitMargin()}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inventory Tab */}
                  {currentTab === 'inventory' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={formData.sku || ''}
                            onChange={(e) => handleInputChange('sku', e.target.value)}
                            disabled={mode === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter SKU"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Barcode
                          </label>
                          <input
                            type="text"
                            value={formData.barcode || ''}
                            onChange={(e) => handleInputChange('barcode', e.target.value)}
                            disabled={mode === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="Enter barcode"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            value={formData.stock || 0}
                            onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                            disabled={mode === 'view'}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Low Stock Alert
                          </label>
                          <input
                            type="number"
                            value={formData.lowStockAlert || 5}
                            onChange={(e) => handleInputChange('lowStockAlert', parseInt(e.target.value) || 5)}
                            disabled={mode === 'view'}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="trackInventory"
                          checked={formData.trackInventory || false}
                          onChange={(e) => handleInputChange('trackInventory', e.target.checked)}
                          disabled={mode === 'view'}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:opacity-50"
                        />
                        <label htmlFor="trackInventory" className="text-sm font-medium text-gray-700">
                          Track inventory
                        </label>
                      </div>

                      {/* Physical Properties */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-4">Physical Properties</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Weight
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                value={formData.weight || 0}
                                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                                disabled={mode === 'view'}
                                min="0"
                                step="0.01"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                              <select
                                value={formData.weightUnit || 'KG'}
                                onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                                disabled={mode === 'view'}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              >
                                {weightUnits.map(unit => (
                                  <option key={unit} value={unit}>{unit}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Length
                            </label>
                            <input
                              type="number"
                              value={formData.length || 0}
                              onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
                              disabled={mode === 'view'}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Width
                            </label>
                            <input
                              type="number"
                              value={formData.width || 0}
                              onChange={(e) => handleInputChange('width', parseFloat(e.target.value) || 0)}
                              disabled={mode === 'view'}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Height
                            </label>
                            <input
                              type="number"
                              value={formData.height || 0}
                              onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                              disabled={mode === 'view'}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unit
                            </label>
                            <select
                              value={formData.dimensionUnit || 'CM'}
                              onChange={(e) => handleInputChange('dimensionUnit', e.target.value)}
                              disabled={mode === 'view'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                              {dimensionUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media Tab */}
                  {currentTab === 'media' && (
                    <div className="space-y-6">
                      {/* Images */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Product Images
                        </label>

                        {/* Image Upload Area */}
                        {mode !== 'view' && (
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center ${
                              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Drag and drop images here, or{' '}
                              <button type="button" className="text-blue-600 hover:text-blue-500">
                                browse
                              </button>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}

                        {/* Add Image URL */}
                        {mode !== 'view' && (
                          <div className="flex space-x-2 mt-4">
                            <input
                              type="url"
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Add image URL"
                            />
                            <button
                              type="button"
                              onClick={handleAddImage}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Add
                            </button>
                          </div>
                        )}

                        {/* Image List */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {formData.images?.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={image.url}
                                  alt={image.alt || `Product image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                  }}
                                />
                              </div>
                              {image.isPrimary && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                  Primary
                                </div>
                              )}
                              {mode !== 'view' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Videos */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Product Videos
                        </label>

                        {/* Add Video URL */}
                        {mode !== 'view' && (
                          <div className="flex space-x-2">
                            <input
                              type="url"
                              value={newVideoUrl}
                              onChange={(e) => setNewVideoUrl(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Add YouTube or Vimeo URL"
                            />
                            <button
                              type="button"
                              onClick={handleAddVideo}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Add
                            </button>
                          </div>
                        )}

                        {/* Video List */}
                        <div className="space-y-3 mt-4">
                          {formData.videos?.map((video, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                              <div className="flex-1">
                                <p className="font-medium">{video.title || 'Untitled Video'}</p>
                                <p className="text-sm text-gray-500">{video.url}</p>
                                <p className="text-xs text-gray-400">{video.source}</p>
                              </div>
                              {mode !== 'view' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVideo(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO Tab */}
                  {currentTab === 'seo' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={formData.metaTitle || ''}
                          onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                          disabled={mode === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          placeholder="Enter meta title for SEO"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={formData.metaDescription || ''}
                          onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                          disabled={mode === 'view'}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          placeholder="Enter meta description for SEO"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visibility
                          </label>
                          <select
                            value={formData.visibility || 'VISIBLE'}
                            onChange={(e) => handleInputChange('visibility', e.target.value)}
                            disabled={mode === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            {visibilityOptions.map(option => (
                              <option key={option} value={option}>
                                {option.charAt(0) + option.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publish Date
                          </label>
                          <input
                            type="date"
                            value={formData.publishDate || ''}
                            onChange={(e) => handleInputChange('publishDate', e.target.value)}
                            disabled={mode === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={formData.featured || false}
                            onChange={(e) => handleInputChange('featured', e.target.checked)}
                            disabled={mode === 'view'}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:opacity-50"
                          />
                          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                            Featured product
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive || false}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                            disabled={mode === 'view'}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:opacity-50"
                          />
                          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Active product
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      {mode === 'view' ? 'Close' : 'Cancel'}
                    </button>
                    {mode !== 'view' && (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isLoading && (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        <span>{mode === 'add' ? 'Create Product' : 'Update Product'}</span>
                      </button>
                    )}
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}