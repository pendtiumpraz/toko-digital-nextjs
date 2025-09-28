'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  aiSuggestion?: string;
  variant?: 'default' | 'glass' | 'neomorphism';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftIcon, rightIcon, aiSuggestion, variant = 'default', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400 h-5 w-5">{leftIcon}</div>
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-xl px-3 py-2 text-sm transition-all duration-300',
              variant === 'default' && 'border border-gray-200/60 bg-white shadow-lg shadow-gray-500/5 focus:shadow-xl focus:shadow-blue-500/10',
              variant === 'glass' && 'border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl shadow-black/5',
              variant === 'neomorphism' && 'border-0 bg-gray-100 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/50',
              variant === 'glass' && 'placeholder:text-white/60 text-gray-900 focus:ring-white/30',
              variant === 'neomorphism' && 'placeholder:text-gray-500 focus:ring-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-300/60 focus:ring-red-500/20 shadow-red-500/10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-gray-400 h-5 w-5">{rightIcon}</div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {aiSuggestion && !error && (
          <div className="mt-2 p-2 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              AI Suggestion: {aiSuggestion}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;