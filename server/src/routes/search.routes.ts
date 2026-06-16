import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller';

const router = Router();

router.get('/', globalSearch);

export default router;
