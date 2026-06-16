import { Request, Response, NextFunction } from 'express';
import { Community } from '../models/Community.model';
import { AppError } from '../middlewares/error-handler.middleware';

export const createCommunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, location, category, isPrivate } = req.body;
    const userId = (req as any).user._id;

    const existing = await Community.findOne({ slug });
    if (existing) {
      return next(new AppError('A community with this slug already exists', 400));
    }

    const community = await Community.create({
      name, slug, description, location, category, isPrivate,
      owner: userId,
      moderators: [userId],
      members: [userId],
    });

    res.status(201).json({ status: 'success', data: { community } });
  } catch (error) {
    next(error);
  }
};

export const getCommunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const communities = await Community.find({ isPrivate: false })
      .select('name slug description location memberCount coverPhoto category members')
      .sort('-memberCount');

    res.status(200).json({ status: 'success', results: communities.length, data: { communities } });
  } catch (error) {
    next(error);
  }
};

export const getCommunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const community = await Community.findOne({ slug: req.params.slug })
      .populate('owner', 'fullName username profilePicture')
      .populate('moderators', 'fullName username profilePicture');

    if (!community) {
      return next(new AppError('No community found with that slug', 404));
    }

    res.status(200).json({ status: 'success', data: { community } });
  } catch (error) {
    next(error);
  }
};

export const joinCommunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return next(new AppError('Community not found', 404));
    }

    const userId = (req as any).user._id;

    if (community.members.includes(userId)) {
      return next(new AppError('You are already a member', 400));
    }

    if (community.isPrivate) {
      if (community.pendingMembers.includes(userId)) {
        return next(new AppError('Join request already pending', 400));
      }
      community.pendingMembers.push(userId);
      await community.save();
      return res.status(200).json({ status: 'success', message: 'Join request sent to moderators' });
    } else {
      community.members.push(userId);
      community.memberCount += 1;
      await community.save();
      return res.status(200).json({ status: 'success', message: 'Successfully joined community' });
    }
  } catch (error) {
    next(error);
  }
};
