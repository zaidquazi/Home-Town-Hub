import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '../api';

export interface Post {
  _id: string;
  author: {
    _id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
  };
  community: string;
  content: string;
  media: string[];
  likes: string[];
  commentCount: number;
  isPinned?: boolean;
  type?: 'default' | 'announcement' | 'event';
  sharedFrom?: string;
  createdAt: string;
}

export const usePosts = (communityId?: string) => {
  return useInfiniteQuery({
    queryKey: communityId ? ['posts', communityId] : ['posts', 'feed'],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const url = communityId 
        ? `/posts/community/${communityId}?page=${pageParam}&limit=10` 
        : `/posts/feed?page=${pageParam}&limit=10`;
      const { data } = await api.get(url);
      return {
        posts: data.data.posts as Post[],
        nextPage: data.data.posts.length === 10 ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60 * 1000, // 1 minute — prevents refetch on tab switch
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: { content: string; community?: string; media?: string[] }) => {
      const { data } = await api.post('/posts', postData);
      return data.data.post;
    },
    onSuccess: (newPost, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      if (variables.community) {
        queryClient.invalidateQueries({ queryKey: ['posts', variables.community] });
      }
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.post(`/posts/${postId}/like`);
      return data;
    },
    onMutate: async (postId: string) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts'] });
    },
    onSettled: () => {
      // Only invalidate the specific feed queries, not ALL post queries
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.delete(`/posts/${postId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export interface Comment {
  _id: string;
  author: {
    _id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
}

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}`);
      return data.data.post as Post;
    },
    enabled: !!postId,
  });
};

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}/comments`);
      return data.data.comments as Comment[];
    },
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data } = await api.post(`/posts/${postId}/comments`, { content });
      return data.data.comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
};
