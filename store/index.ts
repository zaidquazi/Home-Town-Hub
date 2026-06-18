'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import api from '@/lib/api';

// ---- Auth Store ----
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null, accessToken: null, isAuthenticated: false, isLoading: true,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      login: (user, accessToken) => {
        // Set a dummy cookie so Next.js middleware on the frontend domain knows we are logged in
        if (typeof document !== 'undefined') {
          document.cookie = `hh_auth_token=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          console.error(e);
        }
        if (typeof document !== 'undefined') {
          document.cookie = 'hh_auth_token=; path=/; max-age=0; SameSite=Lax';
        }
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },
      updateUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
    }),
    { 
      name: 'hh-auth', 
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, accessToken: s.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);

// ---- UI Store ----
interface UIStore {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light', isSidebarOpen: true, isMobileMenuOpen: false,
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          if (theme === 'dark') root.classList.add('dark');
          else if (theme === 'light') root.classList.remove('dark');
          else root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
      },
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    { name: 'hh-ui', partialize: (s) => ({ theme: s.theme, isSidebarOpen: s.isSidebarOpen }) }
  )
);

// ---- Notification Store ----
interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}));
