'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePost, useComments, useAddComment, useLikePost, useDeletePost } from '@/lib/hooks/usePosts';
import { Card, Button, Avatar, ConfirmationModal } from '@/components/ui';
import { Heart, MessageCircle, Share2, MoreHorizontal, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useAuthStore } from '@/store';

export default function PostDetailsPage() {
  const { id } = useParams() as { id: string };
  const { data: post, isLoading: isPostLoading } = usePost(id);
  const { data: comments, isLoading: isCommentsLoading } = useComments(id);
  const addCommentMutation = useAddComment();
  const likeMutation = useLikePost();
  const deletePostMutation = useDeletePost();
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const [commentContent, setCommentContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isPostLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  if (!post) {
    return <div className="text-center py-12 text-neutral-500">Post not found.</div>;
  }

  const handleAddComment = () => {
    if (!commentContent.trim()) return;
    addCommentMutation.mutate({ postId: post._id, content: commentContent }, {
      onSuccess: () => setCommentContent('')
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/feed" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Post</h1>
      </div>

      <Card className="p-5 overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <Avatar 
              src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${post.author.fullName}`} 
              alt={post.author.fullName} 
              size="md" 
            />
            <div>
              <div className="flex flex-col">
                <span className="font-bold text-neutral-900 dark:text-white">{post.author.fullName}</span>
                <span className="text-neutral-500 text-sm">@{post.author.username}</span>
              </div>
            </div>
          </div>
            <div className="flex items-center gap-2">
              {(user?.role === 'admin' || user?.role === 'superadmin' || user?._id === post.author._id) && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-600 transition-colors text-sm font-medium px-2"
                >
                  Delete
                </button>
              )}
              <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
        </div>

        <p className="text-neutral-800 dark:text-neutral-200 text-[17px] leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        {post.media && post.media.length > 0 && (
          <div className="mb-4 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img src={post.media[0]} alt="Post media" className="w-full h-auto max-h-[500px] object-cover" />
          </div>
        )}

        <div className="text-sm text-neutral-500 mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800/50">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>

        <div className="flex items-center justify-around text-neutral-500 py-1">
          <button 
            onClick={() => likeMutation.mutate(post._id)}
            className="flex items-center gap-2 hover:text-primary-600 transition-colors group"
          >
            <div className="p-2 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 rounded-full transition-colors">
              <Heart className="w-6 h-6" />
            </div>
            <span className="font-medium">{post.likes?.length || 0}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
            <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full transition-colors">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="font-medium">{post.commentCount || 0}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-green-600 transition-colors group">
            <div className="p-2 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 rounded-full transition-colors">
              <Share2 className="w-6 h-6" />
            </div>
          </button>
        </div>
      </Card>

      {/* Comment Input */}
      <Card className="p-4 flex gap-4">
        <Avatar src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName}`} alt="You" size="md" />
        <div className="flex-1 space-y-3">
          <textarea 
            placeholder="Post your reply..."
            className="w-full bg-transparent border-none resize-none focus:ring-0 text-neutral-900 dark:text-white text-lg placeholder:text-neutral-400 min-h-[60px]"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button size="sm" className="rounded-full px-6" onClick={handleAddComment} disabled={!commentContent.trim() || addCommentMutation.isPending}>
              {addCommentMutation.isPending ? 'Replying...' : 'Reply'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg px-2">Comments</h3>
        {isCommentsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary-600 animate-spin" /></div>
        ) : comments?.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">No replies yet.</div>
        ) : (
          comments?.map((comment) => (
            <motion.div key={comment._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-4">
                <div className="flex gap-3">
                  <Avatar src={comment.author.profilePicture || `https://ui-avatars.com/api/?name=${comment.author.fullName}`} alt={comment.author.fullName} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">{comment.author.fullName}</span>
                      <span className="text-neutral-500 text-xs">@{comment.author.username}</span>
                      <span className="text-neutral-300 dark:text-neutral-700 text-xs">•</span>
                      <span className="text-neutral-500 text-xs">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-200 text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deletePostMutation.mutate(post._id, {
            onSuccess: () => {
              router.push('/feed');
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
    </div>
  );
}
