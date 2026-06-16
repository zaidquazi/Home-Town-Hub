import { Router } from 'express';
import { addComment, getPostComments } from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.route('/')
  .get(getPostComments)
  .post(protect, addComment);

export default router;
