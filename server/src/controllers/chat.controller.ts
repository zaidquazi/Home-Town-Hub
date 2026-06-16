import { Request, Response, NextFunction } from 'express';
import { Chat } from '../models/Chat.model';
import { Message } from '../models/Message.model';
import { AppError } from '../middlewares/error-handler.middleware';

export const getMyChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'fullName username profilePicture')
      .populate('lastMessage')
      .populate('community', 'name coverPhoto slug')
      .sort({ updatedAt: -1 });

    res.status(200).json({ status: 'success', data: { chats } });
  } catch (error) {
    next(error);
  }
};

export const getChatMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new AppError('Chat not found', 404));
    }

    if (!chat.participants.includes(userId) && chat.type === 'direct') {
       return next(new AppError('Not authorized to view this chat', 403));
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'fullName username profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({ status: 'success', data: { messages } });
  } catch (error) {
    next(error);
  }
};

// Create a direct chat or return existing
export const getOrCreateDirectChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = (req as any).user._id;

    if (targetUserId === currentUserId.toString()) {
      return next(new AppError('Cannot chat with yourself', 400));
    }

    let chat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [currentUserId, targetUserId] }
    }).populate('participants', 'fullName username profilePicture');

    if (!chat) {
      chat = await Chat.create({
        type: 'direct',
        participants: [currentUserId, targetUserId]
      });
      chat = await chat.populate('participants', 'fullName username profilePicture');
    }

    res.status(200).json({ status: 'success', data: { chat } });
  } catch (error) {
    next(error);
  }
};
