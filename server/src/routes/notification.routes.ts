import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller';

const router = express.Router();

router.use(protect); // All notification routes require authentication

router.route('/')
  .get(getNotifications);

router.route('/mark-all-read')
  .patch(markAllAsRead);

router.route('/:id/read')
  .patch(markAsRead);

export default router;
