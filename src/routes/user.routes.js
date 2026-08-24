import { Router } from 'express';
import { protect, checkFounder, optionalAuth } from '../middleware/auth.middleware.js';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  toggleLinkUser,
  getSuggestedUsers,
  getRecentlyJoinedUsers,
  getPublicPlatformStats
} from '../controllers/user.controller.js';
import { validateObjectId } from '../middleware/validateObjectId.middleware.js';

const router = Router();

// Public & Optional Auth User discovery routes
router.get('/suggested', optionalAuth, getSuggestedUsers);
router.get('/recently-joined', getRecentlyJoinedUsers);
router.get('/public-stats', getPublicPlatformStats);
router.get('/:id/profile', validateObjectId('id'), getUserProfile);

// Protect remaining user routes requiring auth
router.use(protect);

router.post('/:id/link', validateObjectId('id'), toggleLinkUser);

// Founder only management routes
router.use(checkFounder);

// Routes for /api/users
router.route('/')
  .post(createUser)
  .get(getUsers);

// Routes for /api/users/:id
router.route('/:id')
  .all(validateObjectId('id'))
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;

