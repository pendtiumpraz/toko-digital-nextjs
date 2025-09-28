'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700 focus-visible:ring-blue-500/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
        destructive: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl shadow-red-500/25 hover:shadow-3xl hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700 focus-visible:ring-red-500/50',
        outline: 'border-2 border-gray-200/50 bg-white/80 backdrop-blur-sm text-gray-900 shadow-lg shadow-gray-500/10 hover:bg-white/90 hover:border-gray-300/70 hover:shadow-xl hover:shadow-gray-500/20 focus-visible:ring-gray-400/50',
        secondary: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 shadow-lg shadow-gray-500/10 hover:from-gray-100 hover:to-gray-200 hover:shadow-xl hover:shadow-gray-500/20 focus-visible:ring-gray-400/50',
        ghost: 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 hover:backdrop-blur-sm focus-visible:ring-gray-400/50',
        link: 'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500/50',
        gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/40 focus-visible:ring-purple-500/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
        whatsapp: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl shadow-green-500/25 hover:shadow-3xl hover:shadow-green-500/40 hover:from-green-600 hover:to-green-700 focus-visible:ring-green-500/50',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-gray-900 shadow-2xl shadow-black/10 hover:bg-white/20 hover:shadow-3xl hover:shadow-black/20 focus-visible:ring-white/50',
        neomorphism: 'bg-gray-100 text-gray-900 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus-visible:ring-gray-400/50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 py-1.5 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 py-3 text-base',
        xl: 'h-14 px-8 py-4 text-lg',
        icon: 'h-10 w-10',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
        none: 'rounded-none',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, loading, leftIcon, rightIcon, children, disabled, onDrag, onDragEnd, onDragStart, onAnimationStart, onAnimationEnd, onAnimationIteration, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={buttonVariants({ variant, size, rounded, className })}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {leftIcon && !loading && leftIcon}
        {children}
        {rightIcon && !loading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;