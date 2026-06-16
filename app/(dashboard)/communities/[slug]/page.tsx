'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCommunity, useJoinCommunity } from '@/lib/hooks/useCommunities';
import { usePosts, useLikePost, useCreatePost } from '@/lib/hooks/usePosts';
import { useAuthStore } from '@/store';
import { Card, Button, Avatar, SkeletonPost, EmptyState } from '@/components/ui';
import { Image as ImageIcon, MapPin, MessageCircle, Heart, Share2, MoreHorizontal, Loader2, Users, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { PostCard } from '@/components/feed/PostCard';
import LocationModal from '@/components/feed/LocationModal';
import toast from 'react-hot-toast';

export default function CommunityDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const { data: community, isLoading: isCommunityLoading } = useCommunity(slug);
  const { data: postsData, isLoading: isPostsLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = usePosts(community?._id);
  
  const allPosts = postsData?.pages.flatMap(page => page.posts) || [];
  
  const [postContent, setPostContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPostMutation = useCreatePost();
  const likeMutation = useLikePost();
  const joinMutation = useJoinCommunity();
  const user = useAuthStore(s => s.user);

  if (isCommunityLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  if (!community) {
    return <div className="text-center py-12 text-neutral-500">Community not found.</div>;
  }

  const isMember = community.members?.includes(user?._id || '');

  const handleLocation = () => {
    setIsLocModalOpen(true);
  };

  const handleLocationSelect = (locString: string) => {
    setPostContent(prev => prev ? `${prev}\n📍 ${locString}` : `📍 ${locString}`);
    toast.success("Location added to post!");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !imageFile) return;
    
    setIsUploading(true);
    let mediaUrls: string[] = [];
    
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        const token = localStorage.getItem('hh-auth') ? JSON.parse(localStorage.getItem('hh-auth') as string)?.state?.accessToken : '';
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1') + '/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await res.json();
        if (data?.data?.url) {
          mediaUrls.push(data.data.url);
        }
      } catch (err) {
        console.error("Image upload failed", err);
        alert("Failed to upload image. Please try again.");
        setIsUploading(false);
        return;
      }
    }

    createPostMutation.mutate({ content: postContent, community: community._id, media: mediaUrls }, {
      onSuccess: () => {
        setPostContent('');
        removeImage();
        setIsUploading(false);
      },
      onError: () => {
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      {/* Community Header */}
      <Card variant="default" className="overflow-hidden border-0 shadow-xl dark:shadow-none bg-white dark:bg-[#121214] mb-8">
        <div className="h-56 md:h-72 bg-gradient-to-br from-primary-600/90 to-accent-600/90 relative flex items-center justify-center">
          {community.coverPhoto ? (
            <img src={community.coverPhoto} alt="Cover" className="w-full h-full object-cover mix-blend-overlay opacity-50" />
          ) : (
            <span className="text-6xl opacity-30">🏙️</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">{community.name}</h1>
              <p className="text-primary-100 font-medium mt-1">c/{community.slug}</p>
            </div>
            <Button 
              onClick={() => joinMutation.mutate(community._id)}
              variant={isMember ? 'outline' : 'primary'}
              size="lg"
              className={`rounded-xl shadow-lg border-0 font-bold ${isMember ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md' : 'bg-white text-primary-600 hover:bg-neutral-100'}`}
            >
              {isMember ? '✓ Joined' : 'Join Community'}
            </Button>
          </div>
        </div>
        <div className="p-6 md:p-8 relative bg-white dark:bg-[#121214]">
          <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-3xl">{community.description}</p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm font-semibold text-neutral-500">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900/50 px-4 py-2 rounded-xl">
              <Users className="w-4 h-4 text-accent-500" /> {community.memberCount.toLocaleString()} Members
            </div>
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900/50 px-4 py-2 rounded-xl">
              <MapPin className="w-4 h-4 text-primary-500" /> {community.location?.city ? `${community.location.city}, ${community.location.country}` : 'Local'}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Create Post */}
          {isMember && (
            <Card variant="default" className="p-5 flex gap-4 overflow-visible group bg-white dark:bg-[#121214]">
              <Avatar src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName}`} alt="You" size="md" className="flex-shrink-0 ring-2 ring-transparent group-focus-within:ring-primary-500 transition-all" />
              <div className="flex-1 space-y-3">
                <textarea 
                  placeholder={`Post to ${community.name}...`}
                  className="w-full bg-transparent border-none resize-none focus:ring-0 text-neutral-900 dark:text-white text-lg placeholder:text-neutral-400 min-h-[60px] p-0 font-medium"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
                  <div className="flex gap-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageSelect} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleLocation}
                      className="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                  <Button size="md" className="rounded-xl px-8" onClick={handleCreatePost} disabled={(!postContent.trim() && !imageFile) || createPostMutation.isPending || isUploading}>
                    {createPostMutation.isPending || isUploading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
                {imagePreview && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-3 max-w-sm rounded-xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-60" />
                    <button 
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            </Card>
          )}

          <LocationModal 
            isOpen={isLocModalOpen} 
            onClose={() => setIsLocModalOpen(false)} 
            onSelect={handleLocationSelect} 
          />

          {/* Posts Feed */}
          {isPostsLoading ? (
            <div className="space-y-4">
              <SkeletonPost />
              <SkeletonPost />
            </div>
          ) : allPosts.length === 0 ? (
            <EmptyState 
              icon={FileText} 
              title="No posts yet" 
              description="Be the first to post in this community!"
            />
          ) : (
            <AnimatePresence>
              {allPosts.map((post) => (
                <PostCard key={post._id} post={post} handleLike={(id) => likeMutation.mutate(id)} />
              ))}
            </AnimatePresence>
          )}
          
          {hasNextPage && (
            <div className="flex justify-center py-4">
              <Button 
                variant="outline" 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </div>
        
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card variant="glass" className="p-6 sticky top-24 bg-white/60 dark:bg-[#121214]/60 backdrop-blur-2xl">
            <h3 className="font-extrabold text-xl mb-4 tracking-tight">About Community</h3>
            <p className="text-[15px] text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">{community.description}</p>
            <div className="space-y-3 text-sm text-neutral-500 font-medium">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/50 dark:border-neutral-800/50">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-neutral-400" /> Category</span>
                <span className="font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md uppercase tracking-wide text-[10px]">{community.category}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-neutral-400" /> Created</span>
                <span className="font-bold text-neutral-900 dark:text-white">{new Date(community.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
