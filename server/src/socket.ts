import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { Message } from './models/Message.model';
import { Chat } from './models/Chat.model';
import jwt from 'jsonwebtoken';
import { env } from './config/env';

export const initSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        if (origin === env.FRONTEND_URL || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      (socket as any).userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId}`);

    // Join personal room for notifications and DMs
    socket.join(userId.toString());

    // Join specific chat room
    socket.on('join_chat', (chatId) => {
      if (typeof chatId !== 'string' || chatId.length > 50) return;
      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
      if (typeof chatId !== 'string' || chatId.length > 50) return;
      socket.leave(chatId);
    });

    // Join community room for live updates
    socket.on('join_community', (communityId) => {
      if (typeof communityId !== 'string' || communityId.length > 50) return;
      socket.join(`community_${communityId}`);
      console.log(`User ${userId} joined community ${communityId}`);
    });

    socket.on('leave_community', (communityId) => {
      if (typeof communityId !== 'string' || communityId.length > 50) return;
      socket.leave(`community_${communityId}`);
    });

    // Join post room for live comments/likes
    socket.on('join_post', (postId) => {
      if (typeof postId !== 'string' || postId.length > 50) return;
      socket.join(`post_${postId}`);
    });

    socket.on('leave_post', (postId) => {
      if (typeof postId !== 'string' || postId.length > 50) return;
      socket.leave(`post_${postId}`);
    });

    // Handle incoming messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content } = data || {};
        
        if (!content || typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) {
          return socket.emit('error', { message: 'Invalid message content' });
        }
        if (!chatId || typeof chatId !== 'string' || chatId.length > 50) {
          return socket.emit('error', { message: 'Invalid chat ID' });
        }

        // 1. Create message in DB
        const message = await Message.create({
          chat: chatId,
          sender: userId,
          content
        });

        // 2. Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id
        });

        // 3. Populate sender details for frontend
        const populatedMessage = await message.populate('sender', 'fullName username profilePicture');

        // 4. Emit to everyone in the chat room
        io.to(chatId).emit('receive_message', populatedMessage);
        
        // 5. Also emit an alert to the participants (for global unread counter/notifications)
        const chat = await Chat.findById(chatId);
        if (chat) {
          chat.participants.forEach(participant => {
            if (participant.toString() !== userId.toString()) {
               io.to(participant.toString()).emit('new_message_alert', {
                 chatId,
                 message: populatedMessage
               });
            }
          });
        }
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    // Typing indicators
    socket.on('typing', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', { userId, chatId });
    });

    socket.on('stop_typing', ({ chatId }) => {
      socket.to(chatId).emit('user_stop_typing', { userId, chatId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};
