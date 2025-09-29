'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  PaintBrushIcon,
  SwatchIcon,
  SquaresPlusIcon,
  CheckIcon,
  EyeIcon,
  SparklesIcon,
  Cog6ToothIcon,
  PhotoIcon,
  ViewColumnsIcon,
  Bars3BottomLeftIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import {
  CheckIcon as CheckSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface StoreTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
  isPremium: boolean;
  isFree: boolean;
  preview: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: 'GRID' | 'LIST' | 'MASONRY';
  features: string[];
  isActive: boolean;
  isSelected?: boolean;
}

interface StoreSettings {
  currentTemplate: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: 'GRID' | 'LIST' | 'MASONRY';
  logoPosition: 'left' | 'center' | 'right';
  showSearch: boolean;
  showCategories: boolean;
  showFeatured: boolean;
  showReviews: boolean;
  darkMode: boolean;
}

export default function StoreTemplatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    currentTemplate: '',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    fontFamily: 'Inter',
    layout: 'GRID',
    logoPosition: 'left',
    showSearch: true,
    showCategories: true,
    showFeatured: true,
    showReviews: true,
    darkMode: false
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<StoreTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchStoreSettings();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/store/templates', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates);

      // Mock data fallback if API returns empty
      if (data.templates.length === 0) {
        const mockTemplates: StoreTemplate[] = [
        {
          id: 'modern-1',
          name: 'Modern Marketplace',
          description: 'Clean and contemporary design perfect for modern businesses',
          category: 'modern',
          isPremium: false,
          isFree: true,
          preview: '/templates/modern-1.jpg',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          fontFamily: 'Inter',
          layout: 'GRID',
          features: ['Responsive Design', 'Product Grid', 'Search Filter', 'Category Navigation'],
          isActive: true
        },
        {
          id: 'classic-1',
          name: 'Classic Boutique',
          description: 'Traditional elegant design for luxury and boutique stores',
          category: 'classic',
          isPremium: true,
          isFree: false,
          preview: '/templates/classic-1.jpg',
          primaryColor: '#8b5a3c',
          secondaryColor: '#6b7280',
          fontFamily: 'Playfair Display',
          layout: 'LIST',
          features: ['Elegant Typography', 'Product Showcase', 'Wishlist', 'Advanced Filters'],
          isActive: true
        },
        {
          id: 'minimal-1',
          name: 'Minimal Clean',
          description: 'Minimalist design focusing on products and simplicity',
          category: 'minimal',
          isPremium: false,
          isFree: true,
          preview: '/templates/minimal-1.jpg',
          primaryColor: '#000000',
          secondaryColor: '#9ca3af',
          fontFamily: 'Roboto',
          layout: 'MASONRY',
          features: ['Clean Layout', 'Focus on Products', 'Fast Loading', 'Mobile First'],
          isActive: true
        },
        {
          id: 'bold-1',
          name: 'Bold Impact',
          description: 'Vibrant and energetic design for lifestyle and fashion brands',
          category: 'bold',
          isPremium: true,
          isFree: false,
          preview: '/templates/bold-1.jpg',
          primaryColor: '#f59e0b',
          secondaryColor: '#ef4444',
          fontFamily: 'Poppins',
          layout: 'GRID',
          features: ['Vibrant Colors', 'Hero Sections', 'Social Integration', 'Video Support'],
          isActive: true
        },
        {
          id: 'elegant-1',
          name: 'Elegant Essence',
          description: 'Sophisticated design for premium and luxury products',
          category: 'elegant',
          isPremium: true,
          isFree: false,
          preview: '/templates/elegant-1.jpg',
          primaryColor: '#7c3aed',
          secondaryColor: '#a78bfa',
          fontFamily: 'Montserrat',
          layout: 'GRID',
          features: ['Premium Look', 'Smooth Animations', 'Product Zoom', 'Rich Media'],
          isActive: true
        }
      ];

        setTemplates(mockTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/store/template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const settings = await response.json();
        setStoreSettings(settings);
        setSelectedTemplate(settings.currentTemplate);
      } else {
        // Fallback to mock settings
        const mockSettings: StoreSettings = {
          currentTemplate: 'modern-1',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          fontFamily: 'Inter',
          layout: 'GRID',
          logoPosition: 'left',
          showSearch: true,
          showCategories: true,
          showFeatured: true,
          showReviews: true,
          darkMode: false
        };

        setStoreSettings(mockSettings);
        setSelectedTemplate(mockSettings.currentTemplate);
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
      toast.error('Failed to load store settings');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setStoreSettings(prev => ({
        ...prev,
        currentTemplate: templateId,
        primaryColor: template.primaryColor,
        secondaryColor: template.secondaryColor,
        fontFamily: template.fontFamily,
        layout: template.layout
      }));
    }
  };

  const handleSettingChange = (key: keyof StoreSettings, value: any) => {
    setStoreSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/store/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to save template settings');
      }

      const result = await response.json();
      toast.success(result.message || 'Template settings saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template settings');
    } finally {
      setSaving(false);
    }
  };

  const openPreview = (template: StoreTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewTemplate(null);
  };

  const getFilteredTemplates = () => {
    if (activeCategory === 'all') return templates;
    return templates.filter(template => template.category === activeCategory);
  };

  const categories = [
    { id: 'all', name: 'All Templates', icon: SquaresPlusIcon },
    { id: 'modern', name: 'Modern', icon: ComputerDesktopIcon },
    { id: 'classic', name: 'Classic', icon: SparklesIcon },
    { id: 'minimal', name: 'Minimal', icon: Squares2X2Icon },
    { id: 'bold', name: 'Bold', icon: ColorSwatchIcon },
    { id: 'elegant', name: 'Elegant', icon: StarSolidIcon }
  ];

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Modern)' },
    { value: 'Roboto', label: 'Roboto (Clean)' },
    { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
    { value: 'Poppins', label: 'Poppins (Friendly)' },
    { value: 'Montserrat', label: 'Montserrat (Professional)' },
    { value: 'Open Sans', label: 'Open Sans (Readable)' }
  ];

  const layoutOptions = [
    { value: 'GRID', label: 'Grid View', icon: Squares2X2Icon },
    { value: 'LIST', label: 'List View', icon: ListBulletIcon },
    { value: 'MASONRY', label: 'Masonry', icon: ViewColumnsIcon }
  ];

  if (loading) {
    return (
      <AdminLayout role="ADMIN">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Store Templates</h1>
            <p className="text-gray-600">Customize your store's appearance and layout</p>
          </div>
          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories & Settings */}
          <div className="space-y-6">
            {/* Template Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <category.icon className="h-5 w-5" />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customization Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customization</h3>
              <div className="space-y-4">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={storeSettings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={storeSettings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={storeSettings.secondaryColor}
                      onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={storeSettings.secondaryColor}
                      onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={storeSettings.fontFamily}
                    onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Layout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Layout
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {layoutOptions.map((layout) => (
                      <button
                        key={layout.value}
                        onClick={() => handleSettingChange('layout', layout.value)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                          storeSettings.layout === layout.value
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <layout.icon className="h-4 w-4" />
                        <span className="text-sm">{layout.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Display Options</h4>
                  {[
                    { key: 'showSearch', label: 'Show Search Bar' },
                    { key: 'showCategories', label: 'Show Categories' },
                    { key: 'showFeatured', label: 'Show Featured Products' },
                    { key: 'showReviews', label: 'Show Product Reviews' },
                    { key: 'darkMode', label: 'Dark Mode Support' }
                  ].map((setting) => (
                    <label key={setting.key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={storeSettings[setting.key as keyof StoreSettings] as boolean}
                        onChange={(e) => handleSettingChange(setting.key as keyof StoreSettings, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{setting.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Templates Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeCategory === 'all' ? 'All Templates' : categories.find(c => c.id === activeCategory)?.name}
                </h3>
                <span className="text-sm text-gray-500">
                  {getFilteredTemplates().length} templates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredTemplates().map((template) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`relative border-2 rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Template Preview */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {template.preview ? (
                        <img
                          src={template.preview}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${template.primaryColor}20, ${template.secondaryColor}20)`
                          }}
                        >
                          <div className="text-center">
                            <PaintBrushIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500">{template.name}</p>
                          </div>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {selectedTemplate === template.id && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                          <CheckSolidIcon className="h-4 w-4" />
                        </div>
                      )}

                      {/* Premium Badge */}
                      {template.isPremium && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Premium
                        </div>
                      )}

                      {/* Preview Button */}
                      <button
                        onClick={() => openPreview(template)}
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100"
                      >
                        <div className="bg-white rounded-full p-3">
                          <EyeIcon className="h-6 w-6 text-gray-700" />
                        </div>
                      </button>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: template.primaryColor }}
                          ></div>
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: template.secondaryColor }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                        {template.features.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            +{template.features.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedTemplate === template.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedTemplate === template.id ? 'Selected' : 'Select Template'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {getFilteredTemplates().length === 0 && (
                <div className="text-center py-12">
                  <PaintBrushIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
                  <p className="text-gray-600">
                    No templates available in the {categories.find(c => c.id === activeCategory)?.name} category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Preview Modal */}
        <AnimatePresence>
          {showPreview && previewTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={(e) => e.target === e.currentTarget && closePreview()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{previewTemplate.name}</h3>
                      <p className="text-gray-600">{previewTemplate.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          handleTemplateSelect(previewTemplate.id);
                          closePreview();
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Select Template
                      </button>
                      <button
                        onClick={closePreview}
                        className="text-gray-400 hover:text-gray-600 p-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="aspect-video bg-gray-100 rounded-lg mb-6 overflow-hidden">
                    {previewTemplate.preview ? (
                      <img
                        src={previewTemplate.preview}
                        alt={previewTemplate.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${previewTemplate.primaryColor}20, ${previewTemplate.secondaryColor}20)`
                        }}
                      >
                        <PaintBrushIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                      <ul className="space-y-2">
                        {previewTemplate.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckSolidIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Category:</span>
                          <span className="text-sm font-medium capitalize">{previewTemplate.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Layout:</span>
                          <span className="text-sm font-medium">{previewTemplate.layout}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Font:</span>
                          <span className="text-sm font-medium">{previewTemplate.fontFamily}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span className={`text-sm font-medium ${previewTemplate.isPremium ? 'text-yellow-600' : 'text-green-600'}`}>
                            {previewTemplate.isPremium ? 'Premium' : 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}