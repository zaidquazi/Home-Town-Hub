import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export const usePendingMembers = (communityId?: string) => {
  return useQuery({
    queryKey: ['pendingMembers', communityId],
    queryFn: async () => {
      const { data } = await api.get(`/moderation/communities/${communityId}/pending-members`);
      return data.data.pendingMembers;
    },
    enabled: !!communityId,
  });
};

export const useApproveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string, userId: string }) => {
      const { data } = await api.post(`/moderation/communities/${communityId}/members/${userId}/approve`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingMembers', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
};

export const useRejectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string, userId: string }) => {
      const { data } = await api.post(`/moderation/communities/${communityId}/members/${userId}/reject`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingMembers', variables.communityId] });
    },
  });
};

export const useRemovePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, postId }: { communityId: string, postId: string }) => {
      const { data } = await api.delete(`/moderation/communities/${communityId}/posts/${postId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
