import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: string;
  community: string | any;
  organizer: string | any;
  attendees: string[];
  maxAttendees?: number;
  coverPhoto?: string;
}

export const useEvents = (filter?: string, search?: string) => {
  return useQuery({
    queryKey: ['events', filter, search],
    queryFn: async () => {
      let url = '/events?';
      if (filter) url += `filter=${filter}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      
      const { data } = await api.get(url);
      return data.data.events as Event[];
    },
    staleTime: 60 * 1000,
  });
};

export const useCommunityEvents = (communityId: string) => {
  return useQuery({
    queryKey: ['events', 'community', communityId],
    queryFn: async () => {
      const { data } = await api.get(`/events/community/${communityId}`);
      return data.data.events as Event[];
    },
    enabled: !!communityId,
    staleTime: 60 * 1000,
  });
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData: Partial<Event>) => {
      const { data } = await api.post('/events', eventData);
      return data.data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
};

export const useJoinEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data } = await api.post(`/events/${eventId}/join`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}`);
      return data.data.event as Event;
    },
    enabled: !!eventId,
    staleTime: 60 * 1000,
  });
};
