'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, login, setUser, setAccessToken, setLoading, isLoading, _hasHydrated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const verifyAttempted = useRef(false);

  useEffect(() => {
    const handleAuthError = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      } catch { /* ignore */ }
      setUser(null);
      setAccessToken(null);
    };
    
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [setUser, setAccessToken]);

  useEffect(() => {
    if (!_hasHydrated) return;

    // Only attempt verify once per app lifecycle to prevent loops
    if (verifyAttempted.current) {
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      verifyAttempted.current = true;
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        if (res.data.status === 'success') {
          const { accessToken: newAccessToken, user: refreshedUser } = res.data.data;
          login(refreshedUser, newAccessToken);
        }
      } catch {
        // Refresh token invalid or missing — clear state directly.
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
        } catch { /* ignore */ }
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    if (!accessToken) {
      verifySession();
    } else {
      setLoading(false);
    }
  }, [_hasHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Protected Routes Redirects on the Client
  useEffect(() => {
    if (isLoading || !_hasHydrated) return;

    const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
    const authOnlyRoutes = ['/login', '/register', '/forgot-password'];
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthOnlyRoute = authOnlyRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.replace('/login');
    } else if (user && isAuthOnlyRoute) {
      // Only redirect away from login/register pages, NOT from landing page '/'
      router.replace('/feed');
    }
  }, [isLoading, _hasHydrated, user, pathname, router]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-lg shadow-primary-600/20">
          H
        </div>
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
        <p className="mt-4 text-neutral-500 text-sm font-medium animate-pulse">Restoring session...</p>
      </div>
    );
  }

  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if ((!user || !accessToken) && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
        <p className="mt-4 text-neutral-500 text-sm font-medium animate-pulse">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}