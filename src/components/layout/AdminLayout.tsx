'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  BellIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
  role: 'SUPER_ADMIN' | 'ADMIN';
}

export default function AdminLayout({ children, role }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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

  const superAdminMenuItems = [
    { name: 'Dashboard', href: '/superadmin', icon: HomeIcon },
    { name: 'Users', href: '/superadmin/users', icon: UsersIcon },
    { name: 'Stores', href: '/superadmin/stores', icon: BuildingStorefrontIcon },
    { name: 'Trials', href: '/superadmin/trials', icon: ClockIcon },
    { name: 'Finance', href: '/superadmin/finance', icon: BanknotesIcon },
    { name: 'Analytics', href: '/superadmin/analytics', icon: PresentationChartLineIcon },
    { name: 'Activities', href: '/superadmin/activities', icon: DocumentTextIcon },
    { name: 'Payments', href: '/superadmin/payments', icon: CreditCardIcon },
    { name: 'Notifications', href: '/superadmin/notifications', icon: BellIcon },
    { name: 'Reports', href: '/superadmin/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/superadmin/settings', icon: Cog6ToothIcon },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Stores', href: '/admin/stores', icon: BuildingStorefrontIcon },
    { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const menuItems = role === 'SUPER_ADMIN' ? superAdminMenuItems : adminMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-white shadow-lg hover:bg-gray-50"
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
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-600 to-purple-700 ${
              isSidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-center h-16 px-4 bg-black/10">
                <ShieldCheckIcon className="h-8 w-8 text-white mr-2" />
                <span className="text-xl font-bold text-white">
                  {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Panel'}
                </span>
              </div>

              {/* User Info */}
              <div className="px-4 py-4 border-b border-white/20">
                <div className="text-white">
                  <p className="text-sm font-medium">{user?.name || 'Administrator'}</p>
                  <p className="text-xs opacity-80">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-white/20 rounded">
                    {role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
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
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
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
      <div className={`${isSidebarOpen || true ? 'lg:ml-64' : ''} min-h-screen`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              {/* Notification Icon */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {/* User Avatar */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}