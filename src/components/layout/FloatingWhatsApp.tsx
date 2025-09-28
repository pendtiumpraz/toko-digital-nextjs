'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface FloatingWhatsAppProps {
  phoneNumber: string;
  storeName?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  showTooltip?: boolean;
  tooltipMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'green' | 'blue' | 'purple' | 'pink';
}

export default function FloatingWhatsApp({
  phoneNumber,
  storeName = 'Store',
  message = 'Hello! I\'m interested in your products.',
  position = 'bottom-right',
  showTooltip = true,
  tooltipMessage = 'Need help? Chat with us!',
  size = 'md',
  theme = 'green',
}: FloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const sizeClasses = {
    sm: { button: 'w-12 h-12', icon: 'w-6 h-6' },
    md: { button: 'w-14 h-14', icon: 'w-7 h-7' },
    lg: { button: 'w-16 h-16', icon: 'w-8 h-8' },
  };

  const themeClasses = {
    green: {
      button: 'bg-green-500 hover:bg-green-600',
      chat: 'bg-green-500',
      gradient: 'from-green-400 to-green-600',
    },
    blue: {
      button: 'bg-blue-500 hover:bg-blue-600',
      chat: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600',
    },
    purple: {
      button: 'bg-purple-500 hover:bg-purple-600',
      chat: 'bg-purple-500',
      gradient: 'from-purple-400 to-purple-600',
    },
    pink: {
      button: 'bg-pink-500 hover:bg-pink-600',
      chat: 'bg-pink-500',
      gradient: 'from-pink-400 to-pink-600',
    },
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  // Show tooltip after 3 seconds if user hasn't interacted
  useEffect(() => {
    if (!hasInteracted && showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltipState(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasInteracted, showTooltip]);

  // Hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltipState) {
      const timer = setTimeout(() => {
        setShowTooltipState(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showTooltipState]);

  const handleClick = () => {
    setHasInteracted(true);
    setShowTooltipState(false);
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    const formattedMessage = `Hello from ${storeName}!\\n\\n${message}`;
    const encodedMessage = encodeURIComponent(formattedMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const WhatsAppIcon = () => (
    <svg
      className={sizeClasses[size].icon}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltipState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className={`absolute ${
              position === 'bottom-right' ? 'right-full mr-4' : 'left-full ml-4'
            } bottom-0 bg-white rounded-lg shadow-lg border p-3 whitespace-nowrap max-w-xs`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">{tooltipMessage}</p>
              <button
                onClick={() => setShowTooltipState(false)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            {/* Arrow */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                position === 'bottom-right' ? '-right-2' : '-left-2'
              } w-2 h-2 bg-white border-r border-b rotate-45`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`absolute bottom-20 ${
              position === 'bottom-right' ? 'right-0' : 'left-0'
            } w-80 bg-white rounded-2xl shadow-2xl border overflow-hidden`}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${themeClasses[theme].gradient} p-4 text-white`}>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <WhatsAppIcon />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{storeName}</h3>
                  <p className="text-xs opacity-90">Typically replies in minutes</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Message */}
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  Hi! 👋 How can we help you today?
                </p>
                <span className="text-xs text-gray-500">Just now</span>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Start a conversation by clicking the button below:
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendMessage}
                  className={`w-full bg-gradient-to-r ${themeClasses[theme].gradient} text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow`}
                >
                  <WhatsAppIcon />
                  Start Conversation
                </motion.button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-500 text-center">
                Powered by WhatsApp
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`${sizeClasses[size].button} ${themeClasses[theme].button} text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center relative overflow-hidden`}
      >
        {/* Pulse Animation */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 bg-current rounded-full`}
        />

        {/* Icon with Animation */}
        <motion.div
          animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <XMarkIcon className={sizeClasses[size].icon} />
          ) : (
            <WhatsAppIcon />
          )}
        </motion.div>

        {/* New message indicator */}
        {!hasInteracted && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
          />
        )}
      </motion.button>
    </div>
  );
}