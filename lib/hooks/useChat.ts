import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export interface ChatMessage {
  _id: string;
  chat: string;
  sender: {
    _id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  type: 'direct' | 'group';
  participants: {
    _id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
  }[];
  community?: any;
  lastMessage?: ChatMessage;
  updatedAt: string;
}

export const useMyChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data } = await api.get('/chats');
      return data.data.chats as ChatRoom[];
    },
    staleTime: 30000,
  });
};

export const useChatMessages = (chatId: string) => {
  return useQuery({
    queryKey: ['chats', chatId, 'messages'],
    queryFn: async () => {
      if (!chatId) return [];
      const { data } = await api.get(`/chats/${chatId}/messages`);
      return data.data.messages as ChatMessage[];
    },
    enabled: !!chatId,
  });
};

export const useCreateDirectChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data } = await api.post('/chats/direct', { targetUserId });
      return data.data.chat as ChatRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });
};
