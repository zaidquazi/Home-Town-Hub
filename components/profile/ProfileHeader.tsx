'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, GraduationCap, Calendar, Edit3, UserPlus, UserMinus, Link as LinkIcon } from 'lucide-react';
import { Button, Avatar, ConfirmationModal } from '@/components/ui';
import type { User } from '@/types';

interface ProfileHeaderProps {
  user: User;
  isOwner?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  onEditProfile?: () => void;
}

export default function ProfileHeader({ user, isOwner, isFollowing, onFollowToggle, onEditProfile }: ProfileHeaderProps) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-[#121214] rounded-3xl overflow-hidden border-0 shadow-xl dark:shadow-none relative mb-8">
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          const { useAuthStore } = await import('@/store');
          const auth = useAuthStore.getState();
          await auth.logout();
          window.location.href = '/login';
        }}
        title="Log out of Hometown Hub"
        message="Are you sure you want to log out?"
        confirmText="Log out"
        cancelText="Cancel"
        isDestructive={true}
      />
      
      {/* Cover Photo */}
      <div className="h-48 md:h-72 w-full relative bg-gradient-to-br from-primary-600/90 to-accent-600/90 group flex items-center justify-center">
        {user.coverPhoto ? (
          <img 
            src={user.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover mix-blend-overlay opacity-60"
          />
        ) : (
          <span className="text-6xl opacity-30">👤</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {isOwner && (
          <button 
            onClick={onEditProfile}
            className="absolute top-4 right-4 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Avatar & Actions */}
      <div className="px-6 md:px-8 pb-8 relative bg-white dark:bg-[#121214]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end -mt-16 sm:-mt-20 mb-4 gap-4">
          <div className="relative group inline-block">
            <Avatar 
              src={user.profilePicture} 
              alt={user.fullName} 
              size="2xl" 
              className="border-4 border-white dark:border-[#121214] bg-white dark:bg-[#121214] w-28 h-28 sm:w-36 sm:h-36 shadow-lg"
            />
            {isOwner && (
              <button 
                onClick={onEditProfile}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 sm:mb-2 w-full sm:w-auto">
            {isOwner ? (
              <>
                <Button variant="outline" onClick={onEditProfile} className="flex-1 sm:flex-none sm:w-auto rounded-xl font-bold shadow-sm">Edit Profile</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex-1 sm:flex-none sm:w-auto rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-500 dark:hover:bg-red-950/30"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant={isFollowing ? 'outline' : 'primary'} 
                onClick={onFollowToggle}
                className="w-full sm:w-auto rounded-xl font-bold shadow-sm"
              >
                {isFollowing ? (
                  <><UserMinus className="w-4 h-4 mr-2" /> Unfollow</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {user.fullName}
            </h1>
            <p className="text-neutral-500 text-lg font-medium mt-1">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="text-[15px] text-neutral-700 dark:text-neutral-300 max-w-2xl text-pretty leading-relaxed">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-4 text-[13px] font-semibold text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/50">
            {(user.currentLocation?.city || user.hometown?.city) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>
                  {user.currentLocation?.city || user.hometown?.city}
                  {user.currentLocation?.country ? `, ${user.currentLocation.country}` : ''}
                </span>
              </div>
            )}
            {user.occupation && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-accent-500" />
                <span>{user.occupation}</span>
              </div>
            )}
            {user.education && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>{user.education}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 pt-2">
            <div className="flex gap-2 items-center hover:underline cursor-pointer">
              <span className="font-bold text-neutral-900 dark:text-white">{user.following?.length || 0}</span>
              <span className="text-neutral-500">Following</span>
            </div>
            <div className="flex gap-2 items-center hover:underline cursor-pointer">
              <span className="font-bold text-neutral-900 dark:text-white">{user.followers?.length || 0}</span>
              <span className="text-neutral-500">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
