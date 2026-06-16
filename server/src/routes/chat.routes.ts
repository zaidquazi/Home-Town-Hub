import { Router } from 'express';
import { getMyChats, getChatMessages, getOrCreateDirectChat } from '../controllers/chat.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getMyChats);
router.post('/direct', getOrCreateDirectChat);
router.get('/:chatId/messages', getChatMessages);

export default router;
