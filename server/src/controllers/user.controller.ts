import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Post } from '../models/Post.model';
import { AppError } from '../middlewares/error-handler.middleware';
import { Follow } from '../models/Follow.model';
import { CommunityMember } from '../models/CommunityMember.model';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('-password -__v')
      .lean();

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Fetch user's posts
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('community', 'name slug')
      .lean();

    // Attach to profile response
    res.status(200).json({
      success: true,
      data: {
        ...user,
        posts
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    
    // Fields allowed to be updated
    const allowedFields = ['fullName', 'bio', 'currentLocation', 'hometown', 'profilePicture', 'coverPhoto', 'occupation', 'education', 'interests', 'socialLinks'];
    const updateData: any = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFollow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user?._id;
    const { id: targetUserId } = req.params;

    if (!currentUserId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (currentUserId.toString() === targetUserId) {
      return next(new AppError('You cannot follow yourself', 400));
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return next(new AppError('User not found', 404));
    }

    // Check Follow collection for robust verification
    const existingFollow = await Follow.findOne({ follower: currentUserId, following: targetUserId });

    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id });
      await User.updateOne(
        { _id: currentUserId }, 
        { $pull: { following: targetUserId }, $inc: { followingCount: -1 } }
      );
      await User.updateOne(
        { _id: targetUserId }, 
        { $pull: { followers: currentUserId }, $inc: { followersCount: -1 } }
      );
    } else {
      // Follow
      await Follow.create({ follower: currentUserId, following: targetUserId });
      await User.updateOne(
        { _id: currentUserId }, 
        { $addToSet: { following: targetUserId }, $inc: { followingCount: 1 } }
      );
      await User.updateOne(
        { _id: targetUserId }, 
        { $addToSet: { followers: currentUserId }, $inc: { followersCount: 1 } }
      );
    }

    res.status(200).json({
      success: true,
      message: existingFollow ? 'Unfollowed successfully' : 'Followed successfully'
    });
  } catch (error) {
    next(error);
  }
};

import { Community } from '../models/Community.model';

export const getUserCommunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('_id');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // We can fetch from CommunityMember collection directly
    const memberships = await CommunityMember.find({ user: user._id, status: 'approved' })
      .populate('community', 'name slug description coverPhoto memberCount createdAt isPrivate')
      .sort({ createdAt: -1 })
      .lean();
    
    // Extract community documents from memberships
    const communities = memberships.map(m => m.community).filter(Boolean);
    
    res.status(200).json({
      success: true,
      data: communities
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide both current and new passwords', 400));
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Incorrect current password', 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
