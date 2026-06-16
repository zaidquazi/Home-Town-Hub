import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Community } from '../models/Community.model';
import { Post } from '../models/Post.model';
import { Event } from '../models/Event.model';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(200).json({
        success: true,
        data: { users: [], communities: [], posts: [], events: [] }
      });
    }

    // Run parallel text searches across the 4 main collections
    const [users, communities, posts, events] = await Promise.all([
      User.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .select('fullName username profilePicture bio')
        .limit(5)
        .lean(),
        
      Community.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .select('name slug description coverPhoto memberCount')
        .limit(5)
        .lean(),
        
      Post.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .populate('author', 'fullName username profilePicture')
        .limit(5)
        .lean(),
        
      Event.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .select('title venue date coverPhoto category')
        .limit(5)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        communities,
        posts,
        events
      }
    });
  } catch (error) {
    next(error);
  }
};
