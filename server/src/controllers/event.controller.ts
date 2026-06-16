import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/Event.model';
import { EventAttendee } from '../models/EventAttendee.model';
import { AppError } from '../middlewares/error-handler.middleware';

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filter, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    let query: any = {};

    // Text Search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Time-based filtering
    const now = new Date();
    if (filter === 'upcoming') {
      query.date = { $gte: now };
    } else if (filter === 'past') {
      query.date = { $lt: now };
    } else if (filter === 'my-events') {
      const userId = (req as any).user?._id;
      if (userId) {
        query.attendees = userId;
      }
    }

    const eventsQuery = Event.find(query).populate('organizer', 'fullName username profilePicture');
    
    if (search) {
      eventsQuery.sort({ score: { $meta: 'textScore' } });
    } else {
      eventsQuery.sort({ date: filter === 'past' ? -1 : 1 });
    }

    const [events, total] = await Promise.all([
      eventsQuery.skip(skip).limit(limit).lean(),
      Event.countDocuments(query)
    ]);

    res.status(200).json({ 
      status: 'success', 
      results: events.length, 
      data: { 
        events, 
        meta: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, date, venue, community, maxAttendees, coverPhoto } = req.body;
    const organizerId = (req as any).user?._id;

    if (!title || !date || !venue || !community) {
      return next(new AppError('Please provide all required fields', 400));
    }

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      community,
      organizer: organizerId,
      maxAttendees,
      coverPhoto,
      attendees: [organizerId],
      attendeeCount: 1
    });

    await EventAttendee.create({
      event: event._id,
      user: organizerId,
      status: 'attending'
    });

    res.status(201).json({ status: 'success', data: { event } });
  } catch (error) {
    next(error);
  }
};

export const getCommunityEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { communityId } = req.params;
    const events = await Event.find({ community: communityId })
      .populate('organizer', 'fullName username profilePicture')
      .sort('date');

    res.status(200).json({ status: 'success', results: events.length, data: { events } });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'fullName username profilePicture')
      .populate('attendees', 'fullName username profilePicture');

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    next(error);
  }
};

export const joinEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params.id;
    const userId = (req as any).user?._id;

    // Check if already attending
    const existingAttendee = await EventAttendee.findOne({ event: eventId, user: userId });
    if (existingAttendee) {
      return next(new AppError('You are already attending this event', 400));
    }

    // Atomic update to prevent overbooking race conditions
    const result = await Event.updateOne(
      { 
        _id: eventId,
        $or: [
          { maxAttendees: { $exists: false } },
          { maxAttendees: null },
          { $expr: { $lt: ["$attendeeCount", "$maxAttendees"] } }
        ]
      },
      { 
        $addToSet: { attendees: userId },
        $inc: { attendeeCount: 1 }
      }
    );

    if (result.modifiedCount === 0) {
      const checkEvent = await Event.findById(eventId);
      if (!checkEvent) return next(new AppError('Event not found', 404));
      return next(new AppError('Event is full', 400));
    }

    // Dual-write compatibility
    await EventAttendee.create({ event: eventId, user: userId, status: 'attending' });

    res.status(200).json({ status: 'success', message: 'Successfully joined event' });
  } catch (error) {
    next(error);
  }
};
