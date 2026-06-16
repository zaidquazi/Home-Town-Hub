import { useQuery } from '@tanstack/react-query';
import api from '../api';
import type { User, Community, Post, Event } from '@/types';

export interface SearchResults {
  users: User[];
  communities: Community[];
  posts: Post[];
  events: Event[];
}

export const useGlobalSearch = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResults> => {
      if (!query.trim()) return { users: [], communities: [], posts: [], events: [] };
      const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
      return data.data;
    },
    enabled: !!query.trim(),
    staleTime: 1000 * 60, // 1 minute
  });
};
