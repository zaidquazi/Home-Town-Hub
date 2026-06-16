import { Router } from 'express';
import { createPost, getCommunityPosts, getFeed, likePost, getPost, sharePost, deletePost } from '../controllers/post.controller';
import { getPostComments, addComment } from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .post(createPost);

router.get('/feed', getFeed);
router.get('/community/:communityId', getCommunityPosts);
router.get('/:id', getPost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/share', sharePost);
router.get('/:id/comments', getPostComments);
router.post('/:id/comments', addComment);

export default router;
