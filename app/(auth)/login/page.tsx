'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { isValidEmail } from '@/lib/utils';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/store';
import type { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const loginFn = useAuthStore((state) => state.login);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setIsLoading(true);
    
    try {
      const response = await apiPost<{ status: string; data: { user: User; accessToken: string } }>('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      loginFn(response.data.user, response.data.accessToken);
      router.push('/feed');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.03]" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-secondary-500/20 rounded-full blur-[60px]" />
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl">H</div>
              <span className="text-2xl font-bold text-white">Hometown Hub</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Welcome back to<br />your community</h1>
            <p className="text-lg text-primary-200 max-w-sm">Pick up where you left off. Your neighbors are waiting.</p>
            <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-sm">
              <p className="text-primary-100 text-body-sm italic mb-4">"I've organized 15 community events through Hometown Hub. The engagement is incredible!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">👨‍💻</div>
                <div>
                  <p className="text-white text-body-sm font-semibold">Vikram Singh</p>
                  <p className="text-primary-300 text-caption">Community Lead, Chandigarh</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-neutral-900">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">H</div>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">Hometown Hub</span>
          </div>

          <h2 className="text-h2 text-neutral-900 dark:text-white mb-2">Sign in</h2>
          <p className="text-body text-neutral-500 mb-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary-600 font-semibold hover:text-primary-700">Sign up</Link>
          </p>

          {apiError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
              <p className="text-body-sm text-danger-700 dark:text-danger-400">{apiError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input label="Email address" type="email" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })} error={errors.email} autoComplete="email"
              leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>} />
            <Input label="Password" type="password" value={formData.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })} error={errors.password} autoComplete="current-password"
              leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>} />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-body-sm text-neutral-600 dark:text-neutral-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-body-sm text-primary-600 font-medium hover:text-primary-700">Forgot password?</Link>
            </div>
            <Button type="submit" isLoading={isLoading} isFullWidth size="lg" className="mt-2">Sign in</Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200 dark:border-neutral-700" /></div>
            <div className="relative flex justify-center"><span className="px-4 bg-white dark:bg-neutral-900 text-body-sm text-neutral-400">or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/google`} className="flex items-center justify-center gap-2 py-2.5 px-4 border border-neutral-300 dark:border-neutral-600 rounded-button hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <FcGoogle className="w-5 h-5" />
              <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-neutral-300 dark:border-neutral-600 rounded-button hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <FaGithub className="w-5 h-5 dark:text-white" />
              <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300">GitHub</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
