import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiPost } from '../api';
import type { Notification } from '@/types';
import api from '../api';

interface NotificationsResponse {
  status: string;
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    pages: number;
  };
}

import { useAuthStore } from '@/store';

export const useNotifications = (page = 1, limit = 20) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async (): Promise<NotificationsResponse> => {
      const { data } = await api.get(`/notifications?page=${page}&limit=${limit}`);
      return data;
    },
    enabled: isAuthenticated && !!accessToken,
    refetchInterval: 60000, // Poll every 60s as fallback if socket fails
    staleTime: 30000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/notifications/mark-all-read');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
