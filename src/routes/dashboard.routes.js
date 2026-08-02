import { Router } from 'express';
import { protect, checkFounder } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getAuditLogs,
  suspendUser,
  restoreUser,
  softDeleteUser,
} from '../controllers/dashboard.controller.js';

const router = Router();

// Protect all dashboard endpoints with protect and checkFounder middleware
router.use(protect);
router.use(checkFounder);

router.get('/stats', getDashboardStats);
router.get('/logs', getAuditLogs);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/restore', restoreUser);
router.delete('/users/:id/soft-delete', softDeleteUser);

export default router;
