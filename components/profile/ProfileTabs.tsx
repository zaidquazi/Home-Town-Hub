'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileTab = 'posts' | 'communities' | 'about';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  counts?: {
    posts: number;
    communities: number;
  }
}

export default function ProfileTabs({ activeTab, onChange, counts }: ProfileTabsProps) {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid, count: counts?.posts },
    { id: 'communities', label: 'Communities', icon: Users, count: counts?.communities },
    { id: 'about', label: 'About', icon: Info, count: undefined },
  ] as const;

  return (
    <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as ProfileTab)}
          className={cn(
            "relative flex items-center gap-2 pb-4 pt-2 text-sm font-medium transition-colors hover:text-neutral-900 dark:hover:text-white",
            activeTab === tab.id 
              ? "text-neutral-900 dark:text-white" 
              : "text-neutral-500"
          )}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={cn(
              "ml-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              activeTab === tab.id 
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            )}>
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <motion.div
              layoutId="profile-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-500 rounded-t-full"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
