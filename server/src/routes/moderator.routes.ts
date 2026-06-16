import { Router } from 'express';
import { getPendingMembers, approveMember, rejectMember, removePost, getFlaggedContent, resolveFlaggedContent, updateRules, pinPost } from '../controllers/moderator.controller';
import { protect } from '../middlewares/auth.middleware';
import { Community } from '../models/Community.model';
import { AppError } from '../middlewares/error-handler.middleware';

const router = Router({ mergeParams: true });

// Middleware to check if user is a moderator of the community
const isModerator = async (req: any, res: any, next: any) => {
  try {
    const communityId = req.params.communityId || req.body.communityId;
    if (!communityId) return next(new AppError('Community ID is required', 400));

    const community = await Community.findById(communityId);
    if (!community) return next(new AppError('Community not found', 404));

    const isMod = community.moderators.includes(req.user._id) || community.owner.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isMod && !isSuperAdmin) {
      return next(new AppError('You do not have permission to moderate this community', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

router.use(protect);

router.get('/communities/:communityId/pending-members', isModerator, getPendingMembers);
router.post('/communities/:communityId/members/:userId/approve', isModerator, approveMember);
router.post('/communities/:communityId/members/:userId/reject', isModerator, rejectMember);
router.delete('/communities/:communityId/posts/:postId', isModerator, removePost);
router.put('/communities/:communityId/rules', isModerator, updateRules);
router.post('/communities/:communityId/posts/:postId/pin', isModerator, pinPost);

export default router;
