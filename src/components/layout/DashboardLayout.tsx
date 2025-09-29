'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  BuildingStorefrontIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  store?: {
    name: string;
    status: string;
  };
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Simulate notification count (replace with actual API call)
    setNotifications(3);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logout berhasil');
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal logout');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Products', href: '/dashboard/products', icon: CubeIcon },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBagIcon },
    { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon },
    { name: 'Financial', href: '/dashboard/financial', icon: BanknotesIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
    { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  ];

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.href === pathname);
    return currentItem?.name || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-white shadow-lg hover:bg-gray-50 transition-colors"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || true) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-600 to-indigo-700 ${
              isSidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-center h-16 px-4 bg-black/10">
                <BuildingStorefrontIcon className="h-8 w-8 text-white mr-2" />
                <span className="text-xl font-bold text-white">
                  Store Dashboard
                </span>
              </div>

              {/* User Info */}
              <div className="px-4 py-4 border-b border-white/20">
                <div className="text-white">
                  <p className="text-sm font-medium">{user?.name || 'Store Owner'}</p>
                  <p className="text-xs opacity-80">{user?.email}</p>
                  {user?.store && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">{user.store.name}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                        user.store.status === 'active'
                          ? 'bg-green-500/20 text-green-100'
                          : 'bg-yellow-500/20 text-yellow-100'
                      }`}>
                        {user.store.status === 'active' ? 'Active' : 'Trial'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white shadow-md'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-white/20">
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`${isSidebarOpen || true ? 'lg:ml-64' : ''} min-h-screen transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800 ml-12 lg:ml-0">
                {getCurrentPageTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/dashboard/products/new"
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Product
                </Link>
              </div>

              {/* Notification Icon */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
                <BellIcon className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>

              {/* User Avatar */}
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            {pathname !== '/dashboard' && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-700 font-medium">
                  {getCurrentPageTitle()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation (Optional) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="grid grid-cols-4 gap-1">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-1 text-xs ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}