import { Router } from 'express';
import { protect, checkFounder } from '../middleware/auth.middleware.js';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  toggleLinkUser
} from '../controllers/user.controller.js';

const router = Router();

// Protect all user routes
router.use(protect);

// Public user routes (for logged in users)
router.get('/:id/profile', getUserProfile);
router.post('/:id/link', toggleLinkUser);

// Founder only management routes
router.use(checkFounder);

// Routes for /api/users
router.route('/')
  .post(createUser)
  .get(getUsers);

// Routes for /api/users/:id
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;

