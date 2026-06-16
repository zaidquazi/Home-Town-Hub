import { Router } from 'express';
import { createEvent, getCommunityEvents, getEvent, joinEvent, getAllEvents } from '../controllers/event.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.route('/')
  .get(getAllEvents)
  .post(protect, createEvent);

router.get('/community/:communityId', getCommunityEvents);

router.route('/:id')
  .get(getEvent);

router.post('/:id/join', protect, joinEvent);

export default router;
