'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label = '', error, helperText, leftIcon, rightIcon, inputSize = 'md', className, id, type = 'text', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-') || Math.random().toString()}`;
    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;
    const sizeClasses = { sm: 'py-2 text-body-sm', md: 'py-2.5 text-body', lg: 'py-3 text-body-lg' };

    return (
      <div className={cn('w-full', className)}>
        <div className="relative">
          {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">{leftIcon}</div>}
          <input
            ref={ref} id={inputId} type={actualType}
            className={cn(
              'peer w-full rounded-xl border transition-all duration-200 ease-out placeholder-transparent',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white dark:focus:bg-neutral-900',
              sizeClasses[inputSize],
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon || isPassword ? 'pr-10' : 'pr-4',
              error ? 'border-danger-400 focus:ring-danger-500/20 focus:border-danger-500 bg-danger-50/50 dark:bg-danger-900/10'
                : 'border-neutral-200 dark:border-neutral-800 focus:ring-primary-500/20 focus:border-primary-500 bg-neutral-50 dark:bg-[#121214]'
            )}
            placeholder={label}
            onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          <label htmlFor={inputId} className={cn(
            'absolute left-3 transition-all duration-200 pointer-events-none text-neutral-500 dark:text-neutral-400',
            leftIcon && 'left-10',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-body peer-placeholder-shown:text-neutral-400',
            'top-0 -translate-y-1/2 text-caption px-1 bg-gradient-to-b from-transparent to-white dark:to-[#121214] peer-focus:to-white dark:peer-focus:to-neutral-900',
            isFocused && !error && 'text-primary-600 dark:text-primary-400 font-medium',
            error && 'text-danger-500 font-medium'
          )}>
            {label}
          </label>
          {isPassword && (
            <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </button>
          )}
          {rightIcon && !isPassword && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">{rightIcon}</div>}
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p id={`${inputId}-error`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="mt-1.5 text-caption text-danger-500 flex items-center gap-1" role="alert">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </motion.p>
          )}
          {!error && helperText && (
            <motion.p id={`${inputId}-helper`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-caption text-neutral-500">{helperText}</motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = 'Input';
