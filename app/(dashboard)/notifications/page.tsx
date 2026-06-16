'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/lib/hooks/useNotifications';
import { Bell, Heart, MessageSquare, Calendar, UserPlus, Info, Check, CheckCircle2 } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'LIKE': return <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center"><Heart className="w-5 h-5 fill-current" /></div>;
    case 'COMMENT': return <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center"><MessageSquare className="w-5 h-5 fill-current" /></div>;
    case 'EVENT': return <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>;
    case 'FOLLOW': return <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center"><UserPlus className="w-5 h-5" /></div>;
    default: return <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center"><Info className="w-5 h-5" /></div>;
  }
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl py-4 z-10 -mx-4 px-4 md:mx-0 md:px-0 border-b border-neutral-100 dark:border-neutral-800/50 md:border-none shadow-sm md:shadow-none">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary-600 text-white text-[13px] font-bold shadow-sm">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Mark all read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center py-20 px-4"
        >
          <div className="w-24 h-24 mb-6 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Bell className="w-10 h-10 text-primary-300 dark:text-primary-700" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">You're all caught up!</h3>
          <p className="text-neutral-500 max-w-sm">When you have new mentions, likes, or event invites, they will appear here.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => handleMarkAsRead(notification)}
                className={`relative group overflow-hidden flex gap-4 p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer min-h-[88px] ${
                  notification.read
                    ? 'bg-white dark:bg-[#121214] border-neutral-100 dark:border-neutral-800/50 hover:border-neutral-200 dark:hover:border-neutral-700 shadow-sm'
                    : 'bg-primary-50/30 dark:bg-primary-900/10 border-primary-200/50 dark:border-primary-800/50 hover:border-primary-300 dark:hover:border-primary-700 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-none'
                }`}
              >
                {!notification.read && (
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-12 rounded-r-full bg-primary-500 shadow-[0_0_8px_rgba(var(--primary-500),0.5)]" />
                )}
                
                <div className="shrink-0 relative">
                  {notification.sender ? (
                    <Avatar 
                      src={notification.sender.profilePicture || `https://ui-avatars.com/api/?name=${notification.sender.fullName}`} 
                      alt={notification.sender.fullName} 
                      size="lg" 
                      className="shadow-sm ring-2 ring-transparent group-hover:ring-primary-500 transition-all"
                    />
                  ) : (
                    getNotificationIcon(notification.type)
                  )}
                  {notification.sender && (
                    <div className="absolute -bottom-1 -right-1 ring-2 ring-white dark:ring-[#121214] rounded-full bg-white dark:bg-[#121214]">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className={`text-[15px] leading-relaxed ${notification.read ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-900 dark:text-white font-medium'}`}>
                    {notification.sender && (
                      <span className="font-bold text-neutral-900 dark:text-white mr-1.5">{notification.sender.fullName}</span>
                    )}
                    {notification.content}
                  </p>
                  <p className={`text-[13px] mt-1.5 flex items-center gap-1.5 font-bold ${notification.read ? 'text-neutral-400 dark:text-neutral-500' : 'text-primary-600 dark:text-primary-400'}`}>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {!notification.read && (
                  <div className="shrink-0 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pl-2">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-primary-600 hover:scale-110 hover:bg-primary-50 transition-all">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
