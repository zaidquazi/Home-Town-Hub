import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment.model';
import { Post } from '../models/Post.model';
import { AppError } from '../middlewares/error-handler.middleware';

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id || req.params.postId;
    const { content } = req.body;
    const authorId = (req as any).user?._id;

    if (!content) {
      return next(new AppError('Comment content cannot be empty', 400));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    const comment = await Comment.create({
      content,
      author: authorId,
      post: postId,
    });

    const populatedComment = await comment.populate('author', 'fullName username profilePicture');

    post.commentCount += 1;
    await post.save();

    // Emit socket event for new comment
    const io = req.app.get('io');
    if (io) {
      io.to(`post_${postId}`).emit('comment:new', populatedComment);
    }

    res.status(201).json({ status: 'success', data: { comment: populatedComment } });
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id || req.params.postId;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const comments = await Comment.find({ post: postId })
      .populate('author', 'fullName username profilePicture')
      .sort('createdAt')
      .limit(limit)
      .lean();

    res.status(200).json({ status: 'success', results: comments.length, data: { comments } });
  } catch (error) {
    next(error);
  }
};
