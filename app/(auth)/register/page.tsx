'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, LocationPicker } from '@/components/ui';
import { isValidEmail, getPasswordStrength, cn } from '@/lib/utils';
import { FcGoogle } from 'react-icons/fc';
import { Users, MapPin } from 'lucide-react';
import type { LocationData } from '@/components/ui/LocationPicker';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/store';
import type { User } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const loginFn = useAuthStore((state) => state.login);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState({ 
    fullName: '', username: '', email: '', password: '', confirmPassword: '', bio: '' 
  });
  const [currentLocation, setCurrentLocation] = useState<LocationData | undefined>(undefined);
  const [hometown, setHometown] = useState<LocationData | undefined>(undefined);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-danger-500', 'bg-accent-500', 'bg-secondary-400', 'bg-secondary-500'];

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Only letters, numbers, and underscores';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'At least 8 characters required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!currentLocation?.city) newErrors.currentLocation = 'Please select your current location';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!hometown?.city) newErrors.hometown = 'Please select your hometown';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { 
    if (step === 1 && validateStep1()) setStep(2); 
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setApiError('');
    // Construct payload matching RegisterData
    const payload = {
      ...formData,
      currentLocation,
      hometown
    };
    
    try {
      const response = await apiPost<{ status: string; data: { user: User; accessToken: string } }>('/auth/register', payload);
      
      loginFn(response.data.user, response.data.accessToken);
      router.push('/feed');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) { const newErrors = { ...errors }; delete newErrors[field]; setErrors(newErrors); }
  };


  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-600 via-secondary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.03]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 -right-20 w-64 h-64 bg-accent-500/20 rounded-full blur-[60px]" />
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl">H</div>
              <span className="text-2xl font-bold text-white">Hometown Hub</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Join thousands of<br />active communities</h1>
            <p className="text-lg text-secondary-200 max-w-sm">Create your profile and start connecting with your hometown.</p>
            <div className="mt-12 grid grid-cols-2 gap-6">
              {[
                { title: 'Connect Locally', description: 'Join local communities' }, 
                { title: 'Discover Events', description: 'Find hometown gatherings' }, 
                { title: 'Preserve Culture', description: 'Celebrate your heritage' }, 
                { title: 'Build Network', description: 'Make real connections' }
              ].map((feature) => (
                <div key={feature.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-xl font-bold text-white mb-1">{feature.title}</p>
                  <p className="text-sm text-secondary-200">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-neutral-900 overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center text-white font-bold">H</div>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">Hometown Hub</span>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => <div key={s} className={cn('flex-1 h-1.5 rounded-full transition-colors duration-300', s <= step ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700')} />)}
          </div>

          <h2 className="text-h2 text-neutral-900 dark:text-white mb-2">
            {step === 1 && 'Create your account'}
            {step === 2 && 'Where are you right now?'}
            {step === 3 && "Where is your hometown?"}
          </h2>
          <p className="text-body text-neutral-500 mb-8">
            {step === 1 && <>Already have an account? <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link></>}
            {step === 2 && 'We use this to show you local events and nearby groups.'}
            {step === 3 && 'Connect with people from your roots, no matter where you live now.'}
          </p>

          {apiError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
              <p className="text-body-sm text-danger-700 dark:text-danger-400">{apiError}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                <button type="button" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/google`} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-neutral-300 dark:border-neutral-600 rounded-button hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors mb-6">
                  <FcGoogle className="w-5 h-5" />
                  <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300">Sign up with Google</span>
                </button>
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200 dark:border-neutral-700" /></div>
                  <div className="relative flex justify-center"><span className="px-4 bg-white dark:bg-neutral-900 text-body-sm text-neutral-400">or sign up with email</span></div>
                </div>
                
                <Input label="Full name" value={formData.fullName} onChange={update('fullName')} error={errors.fullName} autoComplete="name" />
                <Input label="Username" value={formData.username} onChange={update('username')} error={errors.username} helperText="Letters, numbers, and underscores only" autoComplete="username" />
                <Input label="Email address" type="email" value={formData.email} onChange={update('email')} error={errors.email} autoComplete="email" />
                <div>
                  <Input label="Password" type="password" value={formData.password} onChange={update('password')} error={errors.password} autoComplete="new-password" />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0, 1, 2, 3].map((i) => <div key={i} className={cn('flex-1 h-1 rounded-full transition-colors duration-300', i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-neutral-200 dark:bg-neutral-700')} />)}
                      </div>
                      <p className={cn('text-caption', passwordStrength <= 1 ? 'text-danger-500' : passwordStrength === 2 ? 'text-accent-500' : 'text-secondary-500')}>{strengthLabels[passwordStrength - 1] || 'Too weak'}</p>
                    </div>
                  )}
                </div>
                <Input label="Confirm password" type="password" value={formData.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
                <Button isFullWidth size="lg" onClick={handleNext}>Continue</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <LocationPicker 
                  value={currentLocation} 
                  onChange={(loc: LocationData) => { setCurrentLocation(loc); if (errors.currentLocation) setErrors({}); }} 
                  placeholder="e.g. Austin, Texas" 
                />
                {errors.currentLocation && <p className="text-sm text-danger-500">{errors.currentLocation}</p>}
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button size="lg" onClick={handleNext} className="flex-1">Next</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <LocationPicker 
                  value={hometown} 
                  onChange={(loc: LocationData) => { setHometown(loc); if (errors.hometown) setErrors({}); }} 
                  placeholder="e.g. Nagpur, Maharashtra" 
                />
                {errors.hometown && <p className="text-sm text-danger-500">{errors.hometown}</p>}
                
                <Input label="Short bio (Optional)" value={formData.bio} onChange={update('bio')} helperText="Tell people a bit about yourself" />

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" size="lg" onClick={() => setStep(2)} className="flex-1" disabled={isLoading}>Back</Button>
                  <Button size="lg" onClick={() => { if (validateStep3()) handleSubmit(); }} isLoading={isLoading} className="flex-1">Complete Registration</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-caption text-neutral-400 text-center">
            By signing up, you agree to our <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
