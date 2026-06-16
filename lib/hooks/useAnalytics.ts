import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api';

interface StatsResponse {
  totalUsers: number;
  totalCommunities: number;
  totalPosts: number;
  totalEvents: number;
}

export function useAppStats() {
  return useQuery({
    queryKey: ['app-stats'],
    queryFn: async () => {
      const response = await apiGet<{ data: StatsResponse }>('/analytics/stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
