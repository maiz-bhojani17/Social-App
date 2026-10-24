import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversations
} from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth protect guard to all chat routes (Item 4 & 19)
router.use(protect);

router.get('/conversations/all', getConversations);
router.post('/', sendMessage);
router.get('/:otherUserId', getMessages);

export default router;
