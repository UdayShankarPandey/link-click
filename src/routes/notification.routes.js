import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  streamNotifications
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validateObjectId.middleware.js';

const router = Router();

// All notification routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.get('/stream', streamNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', validateObjectId('id'), markAsRead);

export default router;
