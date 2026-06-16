'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

type CardVariant = 'default' | 'interactive' | 'glass' | 'elevated' | 'outlined';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm shadow-neutral-200/50 dark:shadow-none',
  interactive: 'bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm shadow-neutral-200/50 dark:shadow-none hover:shadow-card-hover hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer',
  glass: 'backdrop-blur-2xl bg-white/60 dark:bg-neutral-950/60 border border-white/40 dark:border-white/5 shadow-glass',
  elevated: 'bg-white dark:bg-[#121214] shadow-xl border border-neutral-200/50 dark:border-neutral-800/50',
  outlined: 'bg-transparent border border-neutral-200 dark:border-neutral-800',
};

const paddingClasses = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export const Card: React.FC<CardProps> = ({ children, variant = 'default', padding = 'md', className, ...props }) => (
  <motion.div className={cn('rounded-2xl transition-all duration-300 ease-apple relative overflow-hidden', variantClasses[variant], paddingClasses[padding], className)} {...props}>
    {children}
  </motion.div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('pb-4 border-b border-neutral-100 dark:border-neutral-800/50 mb-4', className)}>{children}</div>
);
export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('py-2', className)}>{children}</div>
);
export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('pt-4 border-t border-neutral-100 dark:border-neutral-800/50 mt-4', className)}>{children}</div>
);
