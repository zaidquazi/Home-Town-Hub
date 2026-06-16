'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { isValidEmail } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!isValidEmail(email)) { setError('Invalid email format'); return; }
    setError('');
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setIsSubmitted(true); }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">H</div>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">Hometown Hub</span>
          </div>

          {!isSubmitted ? (
            <>
              <h2 className="text-h3 text-neutral-900 dark:text-white mb-2">Forgot password?</h2>
              <p className="text-body text-neutral-500 mb-8">Enter your email and we'll send you a link to reset your password.</p>
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <Input label="Email address" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} error={error} autoComplete="email" />
                <Button type="submit" isLoading={isLoading} isFullWidth size="lg">Send Reset Link</Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary-50 dark:bg-secondary-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              </div>
              <h3 className="text-h4 text-neutral-900 dark:text-white mb-2">Check your email</h3>
              <p className="text-body text-neutral-500 mb-6">We've sent a password reset link to <strong className="text-neutral-700 dark:text-neutral-300">{email}</strong></p>
              <Button variant="ghost" onClick={() => setIsSubmitted(false)}>Try a different email</Button>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-body-sm text-primary-600 font-medium hover:text-primary-700">← Back to sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
