'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCommunity } from '@/lib/hooks/useCommunities';
import { Card, Button, Input, LocationPicker } from '@/components/ui';
import { Users, Loader2, ArrowLeft, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function CreateCommunityPage() {
  const router = useRouter();
  const createMutation = useCreateCommunity();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    country: '',
    isPrivate: false,
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || !formData.category || !formData.city || !formData.country) {
      setError('Please fill in all required fields.');
      return;
    }

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    createMutation.mutate({
      name: formData.name,
      slug,
      description: formData.description,
      category: formData.category,
      location: { city: formData.city, country: formData.country } as any,
      isPrivate: formData.isPrivate,
    }, {
      onSuccess: (data) => {
        router.push(`/communities/${data.slug}`);
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Failed to create community. Please try again.');
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/communities" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-600" />
          Create Community
        </h1>
      </div>

      <Card variant="glass" className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {error && (
            <div className="p-4 bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[15px] font-medium rounded-xl border border-red-200 dark:border-red-800 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-extrabold text-neutral-900 dark:text-white mb-2 tracking-tight">
                Community Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. San Francisco Tech Enthusiasts"
                required
                className="min-h-[48px] bg-white/50 dark:bg-black/20 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 focus:border-primary-500 focus:bg-white dark:focus:bg-[#121214] transition-all rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
              <p className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-500 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>/communities/{formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'name'}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-neutral-900 dark:text-white mb-2 tracking-tight">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is this community about? Who is it for?"
                rows={4}
                className="w-full px-4 py-3 min-h-[100px] border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm text-neutral-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-extrabold text-neutral-900 dark:text-white mb-2 tracking-tight">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 min-h-[48px] border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm text-neutral-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="Technology">Technology</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-extrabold text-neutral-900 dark:text-white mb-2 tracking-tight">
                  Privacy
                </label>
                <div className="relative">
                  <select
                    name="isPrivate"
                    value={formData.isPrivate.toString()}
                    onChange={handleChange}
                    className="w-full px-4 py-3 min-h-[48px] border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm text-neutral-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] appearance-none cursor-pointer"
                  >
                    <option value="false">Public - Anyone can join and view</option>
                    <option value="true">Private - Approval required</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <LocationPicker 
                label="Location *"
                placeholder="Search for your community's city..."
                value={formData.city ? { city: formData.city, country: formData.country, state: '' } : undefined}
                onChange={(loc) => {
                  setFormData(prev => ({
                    ...prev,
                    city: loc.city || '',
                    country: loc.country || '',
                  }));
                }}
              />
              {!formData.city && <p className="text-xs text-neutral-500 mt-1">Both city and country are required.</p>}
            </div>

            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800/50 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button type="button" variant="outline" size="lg" onClick={() => router.back()} className="w-full sm:w-auto rounded-xl font-bold bg-white dark:bg-[#121214] shadow-sm">
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={createMutation.isPending} className="w-full sm:w-auto rounded-xl font-bold shadow-glow text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
                {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {createMutation.isPending ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
