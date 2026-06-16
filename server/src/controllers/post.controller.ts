import { Request, Response, NextFunction } from 'express';
import { Post } from '../models/Post.model';
import { Comment } from '../models/Comment.model';
import { AppError } from '../middlewares/error-handler.middleware';
import { moderateContent } from '../services/moderation.service';
import { Like } from '../models/Like.model';

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, community, media, type } = req.body;
    const authorId = (req as any).user?._id;

    if (!content) {
      return next(new AppError('Post content cannot be empty', 400));
    }

    const moderationResult = await moderateContent(content);

    if (moderationResult.status === 'blocked') {
      return next(new AppError('Your content violates community guidelines and has been blocked.', 400));
    }

    const post = await Post.create({
      content,
      community,
      media: media || [],
      type: type || 'default',
      author: authorId,
      moderation: moderationResult
    });

    const populatedPost = await post.populate('author', 'fullName username profilePicture');

    // Emit socket event for new post
    const io = req.app.get('io');
    if (io) {
      io.to(`community_${community}`).emit('post:new', populatedPost);
    }

    res.status(201).json({ status: 'success', data: { post: populatedPost } });
  } catch (error) {
    next(error);
  }
};

export const getCommunityPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { communityId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const cursor = req.query.cursor as string;

    const query: any = { community: communityId };
    let skip = 0;

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    } else {
      skip = (page - 1) * limit;
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'fullName username profilePicture')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({ community: communityId })
    ]);
    
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;

    res.status(200).json({ 
      status: 'success', 
      results: posts.length, 
      data: { posts, total, page, totalPages: Math.ceil(total / limit), nextCursor } 
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName username profilePicture')
      .populate('community', 'name slug');

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    res.status(200).json({ status: 'success', data: { post } });
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const cursor = req.query.cursor as string;

    const query: any = {};
    let skip = 0;

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    } else {
      skip = (page - 1) * limit;
    }

    // TODO: In a real app, find communities the user is a member of, then fetch posts from them
    // For now, fetch all posts across all communities
    const posts = await Post.find(query)
      .populate('author', 'fullName username profilePicture')
      .populate('community', 'name slug emoji')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;

    res.status(200).json({ status: 'success', results: posts.length, data: { posts, nextCursor } });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    const userId = (req as any).user?._id;
    if (!userId) {
      return next(new AppError('Not authenticated', 401));
    }

    const existingLike = await Like.findOne({ user: userId, targetId: post._id, targetType: 'Post' }).lean();

    let isLiked = false;
    let newLikeCount = post.likeCount;

    if (existingLike) {
      // Unlike
      await Promise.all([
        Like.deleteOne({ _id: existingLike._id }),
        Post.updateOne(
          { _id: post._id },
          { $pull: { likes: userId }, $inc: { likeCount: -1 } }
        )
      ]);
      newLikeCount = Math.max(0, newLikeCount - 1);
    } else {
      // Like
      await Promise.all([
        Like.create({ user: userId, targetId: post._id, targetType: 'Post' }),
        Post.updateOne(
          { _id: post._id },
          { $addToSet: { likes: userId }, $inc: { likeCount: 1 } }
        )
      ]);
      isLiked = true;
      newLikeCount += 1;
    }

    res.status(200).json({ status: 'success', data: { likes: newLikeCount, isLiked } });
  } catch (error) {
    next(error);
  }
};

export const sharePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const originalPostId = req.params.id;
    const { content, community } = req.body;
    const authorId = (req as any).user?._id;

    const originalPost = await Post.findById(originalPostId);
    if (!originalPost) {
      return next(new AppError('Original post not found', 404));
    }

    const post = await Post.create({
      content: content || 'Shared a post',
      community: community || originalPost.community,
      author: authorId,
      sharedFrom: originalPostId
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'fullName username profilePicture')
      .populate('sharedFrom');

    res.status(201).json({ status: 'success', data: { post: populatedPost } });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;
    const authorId = (req as any).user?._id;

    const post = await Post.findById(postId);
    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    if (post.author.toString() !== authorId.toString() && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'superadmin') {
      return next(new AppError('You do not have permission to delete this post', 403));
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ status: 'success', message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
