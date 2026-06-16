import { Request, Response, NextFunction } from 'express';
import { Community } from '../models/Community.model';
import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import { AppError } from '../middlewares/error-handler.middleware';

export const getPendingMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { communityId } = req.params;
    
    const community = await Community.findById(communityId)
      .populate('pendingMembers', 'fullName username profilePicture bio');

    if (!community) {
      return next(new AppError('Community not found', 404));
    }

    res.status(200).json({ status: 'success', data: { pendingMembers: community.pendingMembers } });
  } catch (error) {
    next(error);
  }
};

export const approveMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { communityId, userId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) return next(new AppError('Community not found', 404));

    if (!community.pendingMembers.includes(userId as any)) {
      return next(new AppError('User is not in pending list', 400));
    }

    // Remove from pending, add to members
    community.pendingMembers = community.pendingMembers.filter(id => id.toString() !== userId);
    if (!community.members.includes(userId as any)) {
      community.members.push(userId as any);
      community.memberCount += 1;
    }

    await community.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('notification:new', {
        type: 'community_approved',
        message: `Your request to join ${community.name} has been approved!`
      });
    }

    res.status(200).json({ status: 'success', message: 'Member approved successfully' });
  } catch (error) {
    next(error);
  }
};

export const rejectMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { communityId, userId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) return next(new AppError('Community not found', 404));

    community.pendingMembers = community.pendingMembers.filter(id => id.toString() !== userId);
    await community.save();

    res.status(200).json({ status: 'success', message: 'Member rejected successfully' });
  } catch (error) {
    next(error);
  }
};

export const removePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return next(new AppError('Post not found', 404));

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ status: 'success', message: 'Post removed by moderator' });
  } catch (error) {
    next(error);
  }
};

export const getFlaggedContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flaggedPosts = await Post.find({
      'moderation.status': { $in: ['review', 'warning'] }
    }).populate('author', 'fullName username profilePicture').sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { items: flaggedPosts }
    });
  } catch (error) {
    next(error);
  }
};

export const resolveFlaggedContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, action } = req.params;
    
    if (action === 'approve') {
      await Post.findByIdAndUpdate(id, { 'moderation.status': 'safe' });
    } else if (action === 'reject') {
      await Post.findByIdAndDelete(id);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

export const updateRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { communityId } = req.params;
    const { rules } = req.body;

    const community = await Community.findById(communityId);
    if (!community) return next(new AppError('Community not found', 404));

    community.rules = rules;
    await community.save();

    res.status(200).json({ status: 'success', data: { rules: community.rules } });
  } catch (error) {
    next(error);
  }
};

export const pinPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return next(new AppError('Post not found', 404));

    post.isPinned = !post.isPinned;
    await post.save();

    res.status(200).json({ status: 'success', data: { isPinned: post.isPinned } });
  } catch (error) {
    next(error);
  }
};
