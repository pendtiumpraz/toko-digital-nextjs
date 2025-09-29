'use client';

import { useState, useEffect } from 'react';
import {
  BellIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/layout/AdminLayout';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  category: 'SYSTEM' | 'MARKETING' | 'SECURITY' | 'BILLING';
  isActive: boolean;
  createdAt: string;
}

interface NotificationHistory {
  id: string;
  templateId: string;
  templateName: string;
  recipientType: 'ALL_USERS' | 'ACTIVE_USERS' | 'TRIAL_USERS' | 'PREMIUM_USERS' | 'SPECIFIC_USERS';
  recipientCount: number;
  subject: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
  createdAt: string;
  createdBy: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'history'>('send');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Send notification form state
  const [notification, setNotification] = useState({
    templateId: '',
    recipientType: 'ALL_USERS',
    subject: '',
    content: '',
    type: 'EMAIL' as 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP',
    scheduleAt: '',
    specificUserIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Mock data for development
      setTemplates([
        {
          id: '1',
          name: 'Welcome New User',
          subject: 'Welcome to Toko Digital!',
          content: 'Welcome to our platform! Get started by creating your first store.',
          type: 'EMAIL',
          category: 'SYSTEM',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Trial Expiring Soon',
          subject: 'Your trial expires in 3 days',
          content: 'Your trial period is ending soon. Upgrade to continue using our services.',
          type: 'EMAIL',
          category: 'BILLING',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Monthly Newsletter',
          subject: 'Toko Digital Monthly Updates',
          content: 'Check out what\'s new this month in Toko Digital.',
          type: 'EMAIL',
          category: 'MARKETING',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]);

      setHistory([
        {
          id: '1',
          templateId: '1',
          templateName: 'Welcome New User',
          recipientType: 'ALL_USERS',
          recipientCount: 1234,
          subject: 'Welcome to Toko Digital!',
          type: 'EMAIL',
          status: 'SENT',
          sentAt: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-15T09:30:00Z',
          createdBy: 'Super Admin'
        },
        {
          id: '2',
          templateId: '2',
          templateName: 'Trial Expiring Soon',
          recipientType: 'TRIAL_USERS',
          recipientCount: 156,
          subject: 'Your trial expires in 3 days',
          type: 'EMAIL',
          status: 'SENDING',
          createdAt: '2024-01-16T14:00:00Z',
          createdBy: 'Super Admin'
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    try {
      setSending(true);

      const response = await fetch('/api/superadmin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      alert('Notification sent successfully!');

      // Reset form
      setNotification({
        templateId: '',
        recipientType: 'ALL_USERS',
        subject: '',
        content: '',
        type: 'EMAIL',
        scheduleAt: '',
        specificUserIds: []
      });

      // Refresh history
      fetchData();
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const loadTemplate = (template: NotificationTemplate) => {
    setNotification(prev => ({
      ...prev,
      templateId: template.id,
      subject: template.subject,
      content: template.content,
      type: template.type
    }));
    setActiveTab('send');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'SENDING':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'FAILED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'SENDING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecipientCount = (type: string) => {
    const counts = {
      'ALL_USERS': 1234,
      'ACTIVE_USERS': 856,
      'TRIAL_USERS': 156,
      'PREMIUM_USERS': 743,
      'SPECIFIC_USERS': 0
    };
    return counts[type as keyof typeof counts] || 0;
  };

  return (
    <AdminLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications Center</h1>
          <p className="text-gray-600 mt-1">Send notifications and manage communication with users</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'send', label: 'Send Notification', icon: PaperAirplaneIcon },
              { id: 'templates', label: 'Templates', icon: EnvelopeIcon },
              { id: 'history', label: 'History', icon: ClockIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'send' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Send New Notification</h2>

            <div className="space-y-6">
              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <select
                  value={notification.recipientType}
                  onChange={(e) => setNotification(prev => ({ ...prev, recipientType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL_USERS">All Users ({getRecipientCount('ALL_USERS').toLocaleString()})</option>
                  <option value="ACTIVE_USERS">Active Users ({getRecipientCount('ACTIVE_USERS').toLocaleString()})</option>
                  <option value="TRIAL_USERS">Trial Users ({getRecipientCount('TRIAL_USERS').toLocaleString()})</option>
                  <option value="PREMIUM_USERS">Premium Users ({getRecipientCount('PREMIUM_USERS').toLocaleString()})</option>
                  <option value="SPECIFIC_USERS">Specific Users</option>
                </select>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'EMAIL', label: 'Email', icon: EnvelopeIcon },
                    { value: 'SMS', label: 'SMS', icon: PhoneIcon },
                    { value: 'PUSH', label: 'Push', icon: BellIcon },
                    { value: 'IN_APP', label: 'In-App', icon: ExclamationTriangleIcon }
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNotification(prev => ({ ...prev, type: type.value as any }))}
                        className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                          notification.type === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use Template (Optional)
                </label>
                <select
                  value={notification.templateId}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) {
                      loadTemplate(template);
                    } else {
                      setNotification(prev => ({ ...prev, templateId: '' }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a template...</option>
                  {templates.filter(t => t.type === notification.type && t.isActive).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={notification.subject}
                  onChange={(e) => setNotification(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notification subject..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={notification.content}
                  onChange={(e) => setNotification(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notification content..."
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={notification.scheduleAt}
                  onChange={(e) => setNotification(prev => ({ ...prev, scheduleAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Leave empty to send immediately</p>
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <button
                  onClick={sendNotification}
                  disabled={sending || !notification.subject || !notification.content}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  {sending ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Notification Templates</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Template
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {template.type}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{template.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Created {formatDate(template.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => loadTemplate(template)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Use template"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                          title="Edit template"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete template"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Notification History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.subject}</p>
                          <p className="text-sm text-gray-500">{item.templateName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{item.recipientType.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">{item.recipientCount.toLocaleString()} recipients</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.sentAt ? formatDate(item.sentAt) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.createdBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}