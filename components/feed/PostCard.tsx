import React, { memo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Avatar, Card, ConfirmationModal } from '@/components/ui';
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store';
import { useDeletePost } from '@/lib/hooks/usePosts';

interface PostCardProps {
  post: any;
  handleLike: (postId: string) => void;
}

export const PostCard = memo(function PostCard({ post, handleLike }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore(s => s.user);
  const deletePostMutation = useDeletePost();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = () => {
    const url = `${window.location.origin}/feed`; // Assuming no public post page exists yet, link to feed
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
    >
      <Card variant="interactive" className={`p-5 overflow-visible relative group ${post.isPinned ? 'border-primary-500 shadow-md' : ''}`}>
        {post.isPinned && (
          <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Pin className="w-3 h-3" /> Pinned
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <Link href={`/profile/${post.author.username}`} className="flex gap-3 items-center group/author cursor-pointer">
            <Avatar 
              src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${post.author.fullName}`} 
              alt={post.author.fullName} 
              size="md" 
              className="ring-2 ring-transparent group-hover/author:ring-primary-500 transition-all"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-900 dark:text-white group-hover/author:underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2">{post.author.fullName}</span>
                <span className="text-neutral-500 text-sm font-medium">@{post.author.username}</span>
                <span className="text-neutral-300 dark:text-neutral-700 mx-0.5">•</span>
                <span className="text-neutral-400 text-sm font-medium hover:underline cursor-pointer">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
              {post.type === 'announcement' && (
                <div className="flex items-center gap-1.5 text-xs text-orange-500 font-bold mt-0.5 tracking-wide uppercase">
                  <Megaphone className="w-3.5 h-3.5" /> Announcement
                </div>
              )}
            </div>
          </Link>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-10 overflow-hidden">
                {(user?._id === post.author._id || user?.role === 'admin' || user?.role === 'superadmin') && (
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm text-red-600 font-medium border-b border-neutral-100 dark:border-neutral-800"
                  >
                    Delete Post
                  </button>
                )}
                <button 
                  onClick={() => { setShowMenu(false); toast.success('Post reported to moderators'); }}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm text-red-600"
                >
                  Report Post
                </button>
                <button 
                  onClick={() => { setShowMenu(false); handleShare(); }}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm text-neutral-700 dark:text-neutral-300"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        <p className={`text-neutral-800 dark:text-neutral-200 leading-relaxed mb-4 whitespace-pre-wrap tracking-tight ${post.type === 'announcement' ? 'text-[17px] font-semibold' : 'text-[16px] font-medium'}`}>
          {post.content}
        </p>

        {post.media && post.media.length > 0 && (
          <div className="mb-4 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 relative w-full h-[400px]">
            <Image 
              src={post.media[0]} 
              alt="Post media" 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-700 ease-out cursor-pointer" 
            />
          </div>
        )}

        <div className="flex items-center justify-between text-neutral-500 pt-1">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleLike(post._id)}
              className="flex items-center gap-2 hover:text-primary-600 transition-colors group/action"
            >
              <div className="p-2 group-hover/action:bg-primary-50 dark:group-hover/action:bg-primary-900/20 rounded-full transition-colors relative">
                {post.likes?.includes('me') ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                    <Heart className="w-5 h-5 fill-primary-500 text-primary-500" />
                  </motion.div>
                ) : (
                  <Heart className="w-5 h-5" />
                )}
              </div>
              <span className={`text-[15px] font-semibold ${post.likes?.includes('me') ? 'text-primary-600' : ''}`}>{post.likes?.length || 0}</span>
            </button>
            <Link href={`/posts/${post._id}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors group/action">
              <div className="p-2 group-hover/action:bg-blue-50 dark:group-hover/action:bg-blue-900/20 rounded-full transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[15px] font-semibold">{post.commentCount || 0}</span>
            </Link>
          </div>
          <button onClick={handleShare} className="flex items-center gap-2 hover:text-green-600 transition-colors group/action">
            <div className="p-2 group-hover/action:bg-green-50 dark:group-hover/action:bg-green-900/20 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
          </button>
        </div>
      </Card>

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deletePostMutation.mutate(post._id, {
            onSuccess: () => {
              toast.success('Post deleted successfully');
              setShowDeleteConfirm(false);
            }
          });
        }}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deletePostMutation.isPending}
      />
    </motion.div>
  );
});
