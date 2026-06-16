'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { Card, Button, Avatar, EmptyState, SkeletonPost } from '../../../components/ui';
import { Image as ImageIcon, MapPin, MessageCircle, Heart, Share2, MoreHorizontal, Loader2, Pin, Megaphone, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePosts, useLikePost, useCreatePost } from '../../../lib/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import { PostCard } from '../../../components/feed/PostCard';
import LocationModal from '../../../components/feed/LocationModal';
import toast from 'react-hot-toast';

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [postContent, setPostContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { ref, inView } = useInView();
  
  const { 
    data, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePosts();

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  const likeMutation = useLikePost();
  const createPostMutation = useCreatePost();

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
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

  const handleLocation = () => {
    setIsLocModalOpen(true);
  };

  const handleLocationSelect = (locString: string) => {
    setPostContent(prev => prev ? `${prev}\n📍 ${locString}` : `📍 ${locString}`);
    toast.success("Location added to post!");
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !imageFile) return;
    
    setIsUploading(true);
    let mediaUrls: string[] = [];
    
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        // Note: assumes lib/api is imported, but we can also use fetch if not imported directly
        // actually we don't have api imported here, let's just use fetch to be safe since api requires token
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

    createPostMutation.mutate({
      content: postContent,
      media: mediaUrls
    }, {
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
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Home Feed</h1>
        <div className="flex bg-neutral-200/50 dark:bg-neutral-800/50 p-1 rounded-xl shadow-inner-soft">
          <button 
            onClick={() => setActiveTab('for-you')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'for-you' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800/80'}`}
          >
            For you
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'following' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800/80'}`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Create Post Composer */}
      {/* Create Post Composer */}
      <Card variant="default" className="p-5 flex gap-4 overflow-visible group">
        <Avatar src="https://ui-avatars.com/api/?name=User" alt="You" size="md" className="flex-shrink-0 ring-2 ring-transparent group-focus-within:ring-primary-500 transition-all" />
        <div className="flex-1 space-y-3">
          <textarea 
            placeholder="What's happening in your hometown?"
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
            <Button 
              size="md" 
              className="rounded-xl px-8"
              onClick={handleCreatePost}
              disabled={(!postContent.trim() && !imageFile) || createPostMutation.isPending || isUploading}
            >
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

      <LocationModal 
        isOpen={isLocModalOpen} 
        onClose={() => setIsLocModalOpen(false)} 
        onSelect={handleLocationSelect} 
      />

      {/* Posts Feed */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Failed to load posts. Please try again later.
          </div>
        ) : allPosts.length === 0 ? (
          <EmptyState 
            icon={FileText} 
            title="No posts yet" 
            description="Be the first to share something with your hometown!"
          />
        ) : (
          <AnimatePresence>
            {allPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                handleLike={handleLike} 
              />
            ))}
          </AnimatePresence>
        )}
        
        {/* Infinite Scroll trigger */}
        <div ref={ref} className="py-4 flex justify-center">
          {isFetchingNextPage && <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />}
        </div>
      </div>
    </div>
  );
}
