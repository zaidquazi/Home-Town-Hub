import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(protect);

router.post('/', upload.single('image'), uploadImage);

export default router;
