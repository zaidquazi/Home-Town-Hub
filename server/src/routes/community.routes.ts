import { Router } from 'express';
import { createCommunity, getCommunities, getCommunity, joinCommunity } from '../controllers/community.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.route('/')
  .get(getCommunities)
  .post(protect, createCommunity);

router.route('/:slug')
  .get(getCommunity);

router.post('/:id/join', protect, joinCommunity);

export default router;
