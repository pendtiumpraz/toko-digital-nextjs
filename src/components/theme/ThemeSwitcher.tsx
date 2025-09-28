'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme, ThemeType } from './ThemeProvider';
import { Card } from '@/components/ui';

interface ThemeSwitcherProps {
  showPreview?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dropdown' | 'cards' | 'inline';
}

export default function ThemeSwitcher({
  showPreview = true,
  size = 'md',
  variant = 'dropdown'
}: ThemeSwitcherProps) {
  const { theme, themeConfig, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-6 py-4',
  };

  const ThemePreview = ({ themeName }: { themeName: ThemeType }) => {
    const previewTheme = availableThemes.find(t => t.name === themeName);
    if (!previewTheme) return null;

    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: previewTheme.colors.primary }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: previewTheme.colors.secondary }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: previewTheme.colors.accent }}
          />
        </div>
        <span className="font-medium">{previewTheme.displayName}</span>
      </div>
    );
  };

  if (variant === 'cards') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Choose Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableThemes.map((themeOption) => (
            <motion.div
              key={themeOption.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  theme === themeOption.name
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setTheme(themeOption.name as ThemeType)}
              >
                <div className="p-4">
                  {/* Theme Preview */}
                  <div
                    className="w-full h-24 rounded-lg mb-3 relative overflow-hidden"
                    style={{ background: themeOption.colors.gradient.hero }}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div
                        className="h-2 rounded"
                        style={{ backgroundColor: themeOption.colors.surface }}
                      />
                      <div className="flex gap-1 mt-1">
                        <div
                          className="h-1 w-8 rounded"
                          style={{ backgroundColor: themeOption.colors.primary }}
                        />
                        <div
                          className="h-1 w-6 rounded"
                          style={{ backgroundColor: themeOption.colors.secondary }}
                        />
                        <div
                          className="h-1 w-4 rounded"
                          style={{ backgroundColor: themeOption.colors.accent }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {themeOption.displayName}
                      </h4>
                      <div className="flex gap-1 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: themeOption.colors.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: themeOption.colors.secondary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: themeOption.colors.accent }}
                        />
                      </div>
                    </div>
                    {theme === themeOption.name && (
                      <div className="text-blue-500">
                        <CheckIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex gap-2">
        {availableThemes.map((themeOption) => (
          <motion.button
            key={themeOption.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(themeOption.name as ThemeType)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              theme === themeOption.name
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {themeOption.displayName}
          </motion.button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between ${sizeClasses[size]}`}
      >
        {showPreview ? (
          <ThemePreview themeName={theme} />
        ) : (
          <span className="font-medium">{themeConfig.displayName}</span>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {availableThemes.map((themeOption, index) => (
              <motion.button
                key={themeOption.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setTheme(themeOption.name as ThemeType);
                  setIsOpen(false);
                }}
                className={`w-full p-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between ${
                  theme === themeOption.name ? 'bg-blue-50' : ''
                }`}
              >
                {showPreview ? (
                  <ThemePreview themeName={themeOption.name as ThemeType} />
                ) : (
                  <span className="font-medium">{themeOption.displayName}</span>
                )}
                {theme === themeOption.name && (
                  <CheckIcon className="w-5 h-5 text-blue-500" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}