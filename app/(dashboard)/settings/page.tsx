'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Bell, Shield, Key, Loader2, UserMinus } from 'lucide-react';
import { Button, Input, Card, ConfirmationModal } from '@/components/ui';
import { useChangePassword } from '@/lib/hooks/useUser';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'privacy'>('security');
  
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Settings</h1>
        <p className="text-neutral-500">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Topbar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar gap-2 md:space-y-2 snap-x">
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all whitespace-nowrap snap-start shrink-0 md:w-full ${
                activeTab === 'security' 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md' 
                  : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <Lock className="w-5 h-5" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all whitespace-nowrap snap-start shrink-0 md:w-full ${
                activeTab === 'notifications' 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md' 
                  : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all whitespace-nowrap snap-start shrink-0 md:w-full ${
                activeTab === 'privacy' 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md' 
                  : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <Shield className="w-5 h-5" />
              Privacy
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const { mutateAsync: changePassword, isPending } = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await logout();
          router.push('/login');
        }}
        title="Log out of Hometown Hub"
        message="Are you sure you want to log out?"
        confirmText="Log out"
        cancelText="Cancel"
        isDestructive={true}
      />
      <Card variant="interactive" className="p-6 md:p-8 border-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-none bg-white dark:bg-[#121214]">
        <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          <Key className="w-6 h-6 text-primary-600" />
          Change Password
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <Input 
            type="password" 
            label="Current Password" 
            value={currentPassword} 
            onChange={e => setCurrentPassword(e.target.value)} 
            required 
            className="bg-neutral-50 dark:bg-neutral-900 border-transparent focus:border-primary-500 rounded-xl"
          />
          <Input 
            type="password" 
            label="New Password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            required 
            className="bg-neutral-50 dark:bg-neutral-900 border-transparent focus:border-primary-500 rounded-xl"
          />
          <Input 
            type="password" 
            label="Confirm New Password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            className="bg-neutral-50 dark:bg-neutral-900 border-transparent focus:border-primary-500 rounded-xl"
          />
          <Button type="submit" disabled={isPending} className="w-full rounded-xl font-bold shadow-glow mt-4" size="lg">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Update Password
          </Button>
        </form>
      </Card>

      <Card className="p-6 md:p-8 border border-red-200/50 dark:border-red-900/50 bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 shadow-[0_4px_24px_rgba(239,68,68,0.1)] dark:shadow-none">
        <h3 className="text-xl font-extrabold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2 tracking-tight">
          <UserMinus className="w-6 h-6" />
          Danger Zone
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-[15px] font-medium leading-relaxed">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={() => setIsLogoutModalOpen(true)} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-500 dark:hover:bg-red-950/30 w-full sm:w-auto rounded-xl font-bold">
            Logout
          </Button>
          <Button variant="primary" onClick={() => toast('Account deletion must be verified by email.', { icon: '⚠️' })} className="bg-red-600 hover:bg-red-700 text-white border-none w-full sm:w-auto rounded-xl shadow-[0_4px_16px_rgba(220,38,38,0.3)] font-bold">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Notification Preferences</h3>
      <div className="space-y-6">
        {[
          { title: 'Push Notifications', desc: 'Receive push notifications when someone mentions you.' },
          { title: 'Email Updates', desc: 'Receive weekly digests of community activity.' },
          { title: 'Event Reminders', desc: 'Get notified 24 hours before an event starts.' },
          { title: 'Messages', desc: 'Receive notifications for new direct messages.' }
        ].map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">{item.title}</h4>
              <p className="text-sm text-neutral-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
        <Button onClick={() => toast.success('Preferences saved!')}>Save Preferences</Button>
      </div>
    </Card>
  );
}

function PrivacySettings() {
  return (
    <Card variant="interactive" className="p-6 md:p-8 border-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-none bg-white dark:bg-[#121214]">
      <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white mb-8 tracking-tight">Privacy Controls</h3>
      <div className="space-y-6">
        {[
          { title: 'Private Profile', desc: 'Only approved followers can see your posts and communities.' },
          { title: 'Show Activity Status', desc: 'Let others know when you are online.' },
          { title: 'Search Engine Indexing', desc: 'Allow search engines to link to your profile.' }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/50">
            <div>
              <h4 className="font-bold text-[15px] text-neutral-900 dark:text-white">{item.title}</h4>
              <p className="text-[13px] text-neutral-500 font-medium mt-0.5">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input type="checkbox" className="sr-only peer" defaultChecked={i === 1} />
              <div className="w-12 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm dark:border-neutral-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
        <Button onClick={() => toast.success('Privacy updated!')} className="w-full sm:w-auto rounded-xl font-bold shadow-sm" size="lg">Save Privacy Settings</Button>
      </div>
    </Card>
  );
}
