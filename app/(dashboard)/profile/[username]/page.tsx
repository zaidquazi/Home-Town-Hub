'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useProfile, useFollowUser, useUserCommunities } from '@/lib/hooks/useUser';
import Link from 'next/link';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { ProfileTab } from '@/components/profile/ProfileTabs';
import EditProfileModal from '@/components/profile/EditProfileModal';

import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const currentUser = useAuthStore(s => s.user);
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: profile, isLoading, error } = useProfile(username as string);
  const { data: communities, isLoading: isLoadingCommunities } = useUserCommunities(username as string);
  const followMutation = useFollowUser();

  const isOwner = currentUser?.username === username;
  const isFollowing = profile?.followers?.includes(currentUser?._id || '');

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      await followMutation.mutateAsync(profile._id);
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Following successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">User not found</h2>
        <p className="text-neutral-500">This account doesn't exist or may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 lg:pb-12">
      <ProfileHeader 
        user={profile} 
        isOwner={isOwner} 
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        onEditProfile={handleEditProfile}
      />

      <div className="mt-8 bg-transparent md:bg-white md:dark:bg-[#121214] md:rounded-3xl md:p-6 md:border md:border-neutral-200 md:dark:border-neutral-800/50 shadow-sm">
        <ProfileTabs 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          counts={{
            posts: profile.posts?.length || 0,
            communities: communities?.length || 0
          }}
        />

        <div className="min-h-[400px] mt-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {profile.posts?.length > 0 ? (
                // Assuming you have a PostCard component, for now we list titles
                profile.posts.map(post => (
                  <div key={post._id} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <p className="text-body text-neutral-900 dark:text-white">{post.content}</p>
                    <p className="text-caption text-neutral-500 mt-2">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  No posts yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'communities' && (
            <div className="space-y-4">
              {isLoadingCommunities ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
              ) : communities && communities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {communities.map(community => (
                    <Link href={`/communities/${community.slug}`} key={community._id} className="block group/card h-full">
                      <div className="p-4 bg-white dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none rounded-2xl group-hover/card:border-primary-500 transition-colors flex items-center gap-4 h-full">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 relative shadow-sm">
                          {community.coverPhoto ? (
                            <img src={community.coverPhoto} alt={community.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xl text-neutral-400">
                              {community.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[15px] text-neutral-900 dark:text-white group-hover/card:text-primary-600 transition-colors truncate">{community.name}</h4>
                          <p className="text-[13px] font-medium text-neutral-500 mt-0.5 truncate">{community.memberCount.toLocaleString()} member{community.memberCount !== 1 && 's'}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  <p className="text-neutral-500 font-medium">Not a member of any public communities.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8 bg-white dark:bg-neutral-900/50 p-6 md:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800/80">
              <div>
                <h3 className="font-extrabold text-xl text-neutral-900 dark:text-white mb-3">About {profile.fullName}</h3>
                <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-3xl">{profile.bio || 'No bio provided.'}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-neutral-200 dark:border-neutral-800/50">
                <div>
                  <h4 className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-widest mb-4">Work & Education</h4>
                  <ul className="space-y-4">
                    {profile.occupation && <li className="flex flex-col"><span className="text-xs font-semibold text-neutral-500">Occupation</span><span className="font-bold text-neutral-900 dark:text-white">{profile.occupation}</span></li>}
                    {profile.education && <li className="flex flex-col"><span className="text-xs font-semibold text-neutral-500">Education</span><span className="font-bold text-neutral-900 dark:text-white">{profile.education}</span></li>}
                    {!profile.occupation && !profile.education && <li className="text-neutral-400 italic">Not specified</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-widest mb-4">Locations</h4>
                  <ul className="space-y-4">
                    {profile.currentLocation?.city && <li className="flex flex-col"><span className="text-xs font-semibold text-neutral-500">Currently in</span><span className="font-bold text-neutral-900 dark:text-white">{profile.currentLocation.city}, {profile.currentLocation.country}</span></li>}
                    {profile.hometown?.city && <li className="flex flex-col"><span className="text-xs font-semibold text-neutral-500">From</span><span className="font-bold text-neutral-900 dark:text-white">{profile.hometown.city}, {profile.hometown.country}</span></li>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOwner && profile && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          user={profile} 
        />
      )}
    </div>
  );
}
