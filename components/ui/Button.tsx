'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-sm hover:shadow focus-visible:ring-primary-500 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/15 before:to-transparent before:rounded-[inherit] overflow-hidden',
  secondary: 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-sm hover:shadow focus-visible:ring-neutral-500',
  outline: 'bg-transparent border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 focus-visible:ring-neutral-500',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 focus-visible:ring-neutral-500',
  danger: 'bg-danger-500 text-white shadow-sm hover:bg-danger-600 focus-visible:ring-danger-500 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/15 before:to-transparent before:rounded-[inherit] overflow-hidden',
  accent: 'bg-accent-500 text-white shadow-sm hover:bg-accent-600 focus-visible:ring-accent-500 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/15 before:to-transparent before:rounded-[inherit] overflow-hidden',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3.5 py-1.5 text-body-sm gap-1.5',
  md: 'px-5 py-2.5 text-body-sm gap-2',
  lg: 'px-6 py-3 text-body gap-2',
  xl: 'px-8 py-3.5 text-body-lg gap-2.5',
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading = false, isFullWidth = false, leftIcon, rightIcon, disabled, className, ...props }, ref) => {
    const isDisabled = disabled || isLoading;
    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.01 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'relative inline-flex items-center justify-center font-medium rounded-[12px] transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant], sizeStyles[size],
          isFullWidth && 'w-full', className
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Spinner />}
        {!isLoading && leftIcon && <span className="flex-shrink-0 relative z-10">{leftIcon}</span>}
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0 relative z-10">{rightIcon}</span>}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
