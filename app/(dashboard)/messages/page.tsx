'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store';
import { useSocket } from '@/lib/providers/SocketProvider';
import { useMyChats, useChatMessages, ChatRoom, ChatMessage } from '@/lib/hooks/useChat';
import { Avatar, Input, Button } from '@/components/ui';
import { Search, Send, Loader2, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessagesPage() {
  const user = useAuthStore(s => s.user);
  const { socket } = useSocket();
  const { data: chats, isLoading: chatsLoading } = useMyChats();
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const { data: initialMessages, isLoading: messagesLoading } = useChatMessages(activeChat?._id || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial messages when chat selected
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
      scrollToBottom();
    }
  }, [initialMessages]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket || !activeChat) return;

    socket.emit('join_chat', activeChat._id);

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.emit('leave_chat', activeChat._id);
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    socket.emit('send_message', {
      chatId: activeChat._id,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  const getChatName = (chat: ChatRoom) => {
    if (chat.type === 'group' && chat.community) return chat.community.name;
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.fullName || 'Unknown User';
  };

  const getChatAvatar = (chat: ChatRoom) => {
    if (chat.type === 'group' && chat.community) return chat.community.coverPhoto || `https://ui-avatars.com/api/?name=${chat.community.name}`;
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.profilePicture || `https://ui-avatars.com/api/?name=${otherParticipant?.fullName}`;
  };

  return (
    <div className="flex h-[calc(100vh-[4.5rem])] md:h-[calc(100vh-0rem)] overflow-hidden -mx-4 md:-m-8 md:mt-0 border-t border-neutral-200 dark:border-neutral-800 md:border-none relative bg-white dark:bg-[#121214]">
      
      {/* Sidebar: Chat List */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-[#121214] border-r-0 md:border-r border-neutral-200 dark:border-neutral-800/50 transition-all ${activeChat ? 'hidden md:flex' : 'flex'} z-10 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none`}>
        <div className="p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800/50 shrink-0 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Messages</h1>
            <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 flex items-center justify-center border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <MessageSquarePlus className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </Button>
          </div>
          <Input 
            placeholder="Search messages..." 
            leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
            className="bg-neutral-100 dark:bg-neutral-900/50 border-transparent focus:border-primary-500 rounded-xl"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="p-8 flex justify-center text-neutral-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : chats?.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No messages yet. Start a conversation!
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
              {chats?.map(chat => (
                <button
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full text-left p-4 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${activeChat?._id === chat._id ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
                >
                  <Avatar src={getChatAvatar(chat)} alt={getChatName(chat)} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`text-sm font-semibold truncate ${activeChat?._id === chat._id ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-900 dark:text-white'}`}>
                        {getChatName(chat)}
                      </p>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-neutral-500 shrink-0">
                          {new Date(chat.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 truncate">
                      {chat.lastMessage?.content || 'Say hello!'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Active Chat */}
      <div className={`flex-1 flex flex-col bg-neutral-50/50 dark:bg-neutral-900/20 relative ${!activeChat ? 'hidden md:flex' : 'flex'} absolute md:relative inset-0 w-full h-full md:w-auto md:h-auto z-20 md:z-0 bg-white dark:bg-[#121214]`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <header className="h-[72px] px-4 md:px-6 bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800/50 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors -ml-2"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <Avatar src={getChatAvatar(activeChat)} alt={getChatName(activeChat)} size="md" className="shadow-sm" />
                  <div>
                    <h2 className="font-extrabold text-[17px] text-neutral-900 dark:text-white leading-tight">{getChatName(activeChat)}</h2>
                    {activeChat.type === 'group' && <p className="text-xs font-medium text-neutral-500">Group Chat</p>}
                  </div>
                </div>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {messagesLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-neutral-500">
                  This is the beginning of your conversation.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender._id === user?._id;
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].sender._id !== msg.sender._id);
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg._id} 
                      className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-8 shrink-0">
                          {showAvatar && <Avatar src={msg.sender.profilePicture || `https://ui-avatars.com/api/?name=${msg.sender.fullName}`} alt={msg.sender.fullName} size="sm" className="w-8 h-8" />}
                        </div>
                      )}
                      
                      <div className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white dark:bg-neutral-800/80 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-700/50 rounded-tl-sm'}`}>
                        {!isMe && showAvatar && (
                          <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">{msg.sender.fullName}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 md:p-4 bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800/50 shrink-0 sticky bottom-0 z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] dark:shadow-none pb-safe">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2 w-full mx-auto relative">
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-neutral-100 dark:bg-neutral-900/80 border-transparent border focus:border-primary-500/50 rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:ring-0 resize-none max-h-32 min-h-[52px] leading-relaxed"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button type="submit" disabled={!newMessage.trim()} className="rounded-full w-12 h-12 md:w-[52px] md:h-[52px] p-0 flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 shrink-0 shadow-md hover:shadow-lg transition-all mb-0.5">
                  <Send className="w-5 h-5 ml-0.5 text-white" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500">
            <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="font-medium text-neutral-900 dark:text-white">Your Messages</p>
            <p className="text-sm mt-1 max-w-xs text-center">Select a conversation from the sidebar or start a new one.</p>
          </div>
        )}
      </div>

    </div>
  );
}
