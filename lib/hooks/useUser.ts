import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import type { User, Post, Community } from '@/types';

export interface UserProfile extends User {
  posts: Post[];
  communities?: Community[]; // Optional: if we fetch their communities
}

export const useProfile = (username: string) => {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: async (): Promise<UserProfile> => {
      const { data } = await api.get(`/users/${username}`);
      return data.data;
    },
    enabled: !!username,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      const { data } = await api.patch('/users/update', profileData);
      return data.data;
    },
    onSuccess: (data: User) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.username] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post(`/users/${userId}/follow`);
      return data;
    },
    onSuccess: (_, userId) => {
      // Invalidate both the target user's profile and the current user's profile/feed
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUserCommunities = (username: string) => {
  return useQuery({
    queryKey: ['userCommunities', username],
    queryFn: async (): Promise<Community[]> => {
      const { data } = await api.get(`/users/${username}/communities`);
      return data.data;
    },
    enabled: !!username,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.patch('/users/settings/password', payload);
      return data;
    },
  });
};
