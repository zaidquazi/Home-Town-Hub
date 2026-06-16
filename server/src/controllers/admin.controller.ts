import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Community } from '../models/Community.model';
import { Post } from '../models/Post.model';
import { Event } from '../models/Event.model';
import { Tag } from '../models/Tag.model';
import { AuditLog } from '../models/AuditLog.model';
import { Report } from '../models/Report.model';
import { AppError } from '../middlewares/error-handler.middleware';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalCommunities, totalPosts, totalEvents] = await Promise.all([
      User.countDocuments(),
      Community.countDocuments(),
      Post.countDocuments(),
      Event.countDocuments()
    ]);

    // Simple placeholder for recent activity
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('fullName username profilePicture createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          users: totalUsers,
          communities: totalCommunities,
          posts: totalPosts,
          events: totalEvents
        },
        recentActivity: recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .select('fullName username email role isActive createdAt profilePicture');

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent changing superadmin role unless it's another superadmin
    if (user.role === 'superadmin' && (req as any).user?.role !== 'superadmin') {
      return next(new AppError('Only superadmins can modify other superadmins', 403));
    }

    if (role) user.role = role;
    if (permissions) user.permissions = permissions;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'superadmin') {
      return next(new AppError('Cannot deactivate a superadmin', 403));
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    next(error);
  }
};

export const approveCommunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const community = await Community.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    
    if (!community) return next(new AppError('Community not found', 404));

    await AuditLog.create({
      admin: (req as any).user._id,
      action: 'APPROVE_COMMUNITY',
      targetType: 'Community',
      targetId: community._id
    });

    res.status(200).json({ status: 'success', data: { community } });
  } catch (error) { next(error); }
};

export const rejectCommunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const community = await Community.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    
    if (!community) return next(new AppError('Community not found', 404));

    await AuditLog.create({
      admin: (req as any).user._id,
      action: 'REJECT_COMMUNITY',
      targetType: 'Community',
      targetId: community._id
    });

    res.status(200).json({ status: 'success', data: { community } });
  } catch (error) { next(error); }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await AuditLog.find().populate('admin', 'fullName username').sort('-createdAt').limit(100);
    res.status(200).json({ status: 'success', data: { logs } });
  } catch (error) { next(error); }
};

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await Report.find().populate('reporter', 'fullName username').sort('-createdAt');
    res.status(200).json({ status: 'success', data: { reports } });
  } catch (error) { next(error); }
};

export const resolveReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    const report = await Report.findByIdAndUpdate(id, { 
      status, 
      actionTaken, 
      reviewedBy: (req as any).user._id 
    }, { new: true });

    if (!report) return next(new AppError('Report not found', 404));

    await AuditLog.create({
      admin: (req as any).user._id,
      action: 'RESOLVE_REPORT',
      targetType: 'Report',
      targetId: report._id,
      details: { status, actionTaken }
    });

    res.status(200).json({ status: 'success', data: { report } });
  } catch (error) { next(error); }
};

export const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body;
    const tag = await Tag.create({ name, slug });
    res.status(201).json({ status: 'success', data: { tag } });
  } catch (error) { next(error); }
};

export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await Tag.find().sort('-usageCount');
    res.status(200).json({ status: 'success', data: { tags } });
  } catch (error) { next(error); }
};
