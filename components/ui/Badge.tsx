import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'neutral' | 'success' | 'warning';

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
  neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
  success: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300',
  warning: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500', secondary: 'bg-secondary-500', accent: 'bg-accent-500', danger: 'bg-danger-500',
  neutral: 'bg-neutral-500', success: 'bg-secondary-500', warning: 'bg-accent-500',
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: BadgeVariant; size?: 'sm' | 'md' | 'lg'; dot?: boolean; className?: string }> = ({
  children, variant = 'neutral', size = 'md', dot = false, className,
}) => {
  const sizeClasses = { sm: 'px-2 py-0.5 text-[10px]', md: 'px-2.5 py-1 text-xs', lg: 'px-3 py-1.5 text-body-sm' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-medium rounded-full transition-colors duration-200', variantClasses[variant], sizeClasses[size], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} aria-hidden="true" />}
      {children}
    </span>
  );
};

export const NotificationBadge: React.FC<{ count: number; maxCount?: number; className?: string }> = ({ count, maxCount = 99, className }) => {
  if (count <= 0) return null;
  return (
    <span className={cn('absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-danger-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-neutral-800', className)}>
      {count > maxCount ? `${maxCount}+` : count}
    </span>
  );
};
