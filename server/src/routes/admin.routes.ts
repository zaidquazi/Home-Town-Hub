import { Router } from 'express';
import { getDashboardStats, getAllUsers, updateUserRole, toggleUserStatus, approveCommunity, rejectCommunity, getAuditLogs, getReports, resolveReport, createTag, getTags } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin', 'superadmin'));

// Dashboard Stats
router.get('/stats', getDashboardStats);

// User Management
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id/role')
  .patch(updateUserRole);

router.route('/users/:id/toggle-status')
  .patch(toggleUserStatus);

router.post('/communities/:id/approve', approveCommunity);
router.post('/communities/:id/reject', rejectCommunity);

router.get('/audit-logs', getAuditLogs);

router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);

router.route('/tags')
  .get(getTags)
  .post(createTag);

export default router;
