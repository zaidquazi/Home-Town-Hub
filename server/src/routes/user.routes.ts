import { Router } from 'express';
import { getUserProfile, updateProfile, toggleFollow, getUserCommunities, changePassword } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:username', getUserProfile);
router.get('/:username/communities', getUserCommunities);
router.patch('/update', protect, updateProfile);
router.post('/:id/follow', protect, toggleFollow);
router.patch('/settings/password', protect, changePassword);

export default router;
