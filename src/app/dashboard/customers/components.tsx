// Modal components for customer management

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  whatsappNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  firstOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  orders?: Order[];
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface CustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
  onDelete?: (customerId: string) => void;
  mode: 'view' | 'edit' | 'create';
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (customers: any[], options: any) => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
}

// Customer Modal Component
export function CustomerModal({ customer, isOpen, onClose, onSave, onDelete, mode }: CustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [detailedCustomer, setDetailedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData(customer);
      if (mode === 'view') {
        // Fetch detailed customer data including orders
        fetchCustomerDetails(customer.id);
      }
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        whatsappNumber: '',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        birthDate: '',
        gender: undefined,
        notes: '',
        status: 'ACTIVE',
        tags: [],
      });
    }
  }, [customer, mode]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}?include=orders`);
      if (response.ok) {
        const data = await response.json();
        setDetailedCustomer(data);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create' ? 'Add New Customer' :
             mode === 'edit' ? 'Edit Customer' : 'Customer Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {mode === 'view' ? (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900">{customer?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{customer?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{customer?.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                    <p className="text-sm text-gray-900">{customer?.whatsappNumber || 'Same as phone'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : customer?.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                      {customer?.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Analytics</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Orders</label>
                    <p className="text-sm text-gray-900">{customer?.totalOrders || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Spent</label>
                    <p className="text-sm text-gray-900">{formatCurrency(customer?.totalSpent || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Average Order Value</label>
                    <p className="text-sm text-gray-900">{formatCurrency(customer?.averageOrderValue || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Order</label>
                    <p className="text-sm text-gray-900">{formatDate(customer?.lastOrderDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Since</label>
                    <p className="text-sm text-gray-900">{formatDate(customer?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {(customer?.street || customer?.city || customer?.state || customer?.country) && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                <p className="text-sm text-gray-900">
                  {[customer?.street, customer?.city, customer?.state, customer?.country, customer?.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}

            {/* Tags */}
            {customer?.tags && customer.tags.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {customer?.notes && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Notes</h4>
                <p className="text-sm text-gray-900">{customer.notes}</p>
              </div>
            )}

            {/* Order History */}
            {detailedCustomer?.orders && detailedCustomer.orders.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Recent Orders</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailedCustomer.orders.slice(0, 5).map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const phone = customer?.whatsappNumber || customer?.phone;
                    if (phone) {
                      const message = `Hello ${customer?.name}, how can we help you today?`;
                      const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  Contact WhatsApp
                </button>
                <button
                  onClick={() => setFormData(customer || {})}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Customer
                </button>
              </div>
              {onDelete && (
                <button
                  onClick={() => customer && onDelete(customer.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty to use phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'BLOCKED' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street || ''}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VIP, Regular, Premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Customer' : 'Update Customer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Import Modal Component
export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    validateOnly: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    const text = await file.text();
    try {
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        setImportData(Array.isArray(data) ? data : [data]);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
        setImportData(data);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  };

  const handleImport = () => {
    setIsLoading(true);
    onImport(importData, options);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Import Customers</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV or JSON file
            </label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.skipDuplicates}
                onChange={(e) => setOptions({ ...options, skipDuplicates: e.target.checked })}
                className="mr-2"
              />
              Skip duplicate phone numbers
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.updateExisting}
                onChange={(e) => setOptions({ ...options, updateExisting: e.target.checked })}
                className="mr-2"
              />
              Update existing customers
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.validateOnly}
                onChange={(e) => setOptions({ ...options, validateOnly: e.target.checked })}
                className="mr-2"
              />
              Validate only (don't import)
            </label>
          </div>

          {importData.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Found {importData.length} customers to import
              </p>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                <pre className="text-xs">{JSON.stringify(importData.slice(0, 3), null, 2)}</pre>
                {importData.length > 3 && (
                  <p className="text-xs text-gray-500 mt-2">... and {importData.length - 3} more</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importData.length === 0 || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Importing...' : options.validateOnly ? 'Validate' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Confirm Modal Component
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'info' }: ConfirmModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
        };
      default:
        return {
          icon: CheckIcon,
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const { icon: Icon, iconColor, confirmButton } = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4">{message}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-md ${confirmButton}`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}