'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Home, Users, Calendar, Bell, Settings, LogOut, MessageSquare } from 'lucide-react';
import { Avatar, ConfirmationModal } from '../../components/ui';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/hooks/useNotifications';
import GlobalSearch from '@/components/layout/GlobalSearch';
import { useSocket } from '@/lib/providers/SocketProvider';
import { useQueryClient } from '@tanstack/react-query';

// Isolated component so notification polling doesn't re-render the entire layout
const NotificationBadge = React.memo(function NotificationBadge({ variant }: { variant: 'sidebar' | 'mobile' }) {
  const { data } = useNotifications();
  const unreadCount = data?.meta?.unreadCount || 0;
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (socket && isConnected) {
      const handleNewNotification = () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      };
      
      socket.on('notification:new', handleNewNotification);
      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, [socket, isConnected, queryClient]);

  if (variant === 'sidebar') {
    return unreadCount > 0 ? (
      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary-600 text-white text-[11px] font-bold">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    ) : null;
  }

  // Mobile variant
  return unreadCount > 0 ? (
    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-primary-600 border-2 border-white dark:border-neutral-950 text-[8px] font-bold text-white">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  ) : null;
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const confirmLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  const handleLogout = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const profilePic = user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}`;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white/60 dark:bg-[#121214]/60 backdrop-blur-3xl border-r border-neutral-200/50 dark:border-neutral-800/50 hidden lg:flex flex-col z-40 sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500">
              Hometown Hub
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto scrollbar-hide">
          <Link href="/feed" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-900 dark:text-white bg-neutral-200/50 dark:bg-white/10 font-semibold transition-all shadow-sm">
            <Home className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Home Feed
          </Link>
          <Link href="/search" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Explore
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Connect</p>
          </div>
          <Link href="/communities" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all font-medium">
            <Users className="w-5 h-5" />
            Communities
          </Link>
          <Link href="/events" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all font-medium">
            <Calendar className="w-5 h-5" />
            Events
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Personal</p>
          </div>
          <Link href="/messages" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all font-medium">
            <MessageSquare className="w-5 h-5" />
            Messages
          </Link>
          <Link href="/notifications" className="flex items-center justify-between px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all font-medium">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              Notifications
            </div>
            <NotificationBadge variant="sidebar" />
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 mt-auto">
          <Link href={`/profile/${user?.username}`} className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-all group">
            <Avatar src={profilePic} alt={user?.fullName || 'User'} size="sm" className="ring-2 ring-transparent group-hover:ring-primary-500 transition-all" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{user?.fullName || 'Loading...'}</p>
              <p className="text-xs text-neutral-500 truncate">@{user?.username || 'loading'}</p>
            </div>
          </Link>
          <div className="mt-2 space-y-1">
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pb-[80px] lg:pb-0">
        <header className="h-16 bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-2xl border-b border-neutral-200/50 dark:border-neutral-800/50 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
            </div>
            
            {/* Global Search */}
            <div className="flex-1 max-w-xl hidden sm:block">
              <GlobalSearch />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="sm:hidden flex-1">
                <GlobalSearch />
             </div>
            <div className="md:hidden flex items-center gap-3">
              <Link href={`/profile/${user?.username}`}>
                <Avatar src={profilePic} alt={user?.fullName || 'User'} size="sm" />
              </Link>
              <button 
                onClick={handleLogout} 
                className="p-2 text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-2xl border-t border-neutral-200/50 dark:border-neutral-800/50 z-50 flex justify-around p-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]" aria-label="Mobile Navigation">
        <Link href="/feed" aria-label="Home Feed" className="flex flex-col items-center gap-1 p-2 text-primary-600 dark:text-primary-400 transition-colors">
          <Home className="w-6 h-6" aria-hidden="true" />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link href="/search" aria-label="Search" className="flex flex-col items-center gap-1 p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        <Link href="/communities" aria-label="Communities" className="flex flex-col items-center gap-1 p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <Users className="w-6 h-6" aria-hidden="true" />
          <span className="text-[10px] font-medium">Groups</span>
        </Link>
        <Link href="/notifications" aria-label="Notifications" className="flex flex-col items-center gap-1 p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors relative">
          <div className="relative">
            <Bell className="w-6 h-6" aria-hidden="true" />
            <NotificationBadge variant="mobile" />
          </div>
          <span className="text-[10px] font-medium">Alerts</span>
        </Link>
        <Link href={`/profile/${user?.username}`} aria-label="Profile" className="flex flex-col items-center gap-1 p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <Avatar src={profilePic} alt="Profile" size="xs" className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Log out of Hometown Hub"
        message="Are you sure you want to log out? You'll need to log back in to access your communities and messages."
        confirmText="Log out"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
