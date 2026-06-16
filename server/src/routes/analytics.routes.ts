import { Router } from 'express';
import { getStats, getLiveStats } from '../controllers/analytics.controller';

const router = Router();

router.get('/stats', getStats);
router.get('/live-stats', getLiveStats);

export default router;
