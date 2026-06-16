import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: any;
  category: string;
  members: string[];
  memberCount?: number;
  coverPhoto?: string;
  isPrivate?: boolean;
  createdAt?: string;
}

export const useCommunities = () => {
  return useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data } = await api.get('/communities');
      return data.data.communities as Community[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCommunity = (slug: string) => {
  return useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      const { data } = await api.get(`/communities/${slug}`);
      return data.data.community;
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityData: Partial<Community>) => {
      const { data } = await api.post('/communities', communityData);
      return data.data.community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      const { data } = await api.post(`/communities/${communityId}/join`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};
