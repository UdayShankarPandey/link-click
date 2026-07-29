import { Router } from 'express';
import { register, login, logout, getMe, updateProfilePic, verifyEmail, resendVerification } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

import multer from 'multer';

const router = Router();

// Configure multer with memory storage and image-only file filter
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Route for register: POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// Route for login: POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// Route for email verification: POST /api/auth/verify-email
router.post('/verify-email', verifyEmail);

// Route for resending verification email: POST /api/auth/resend-verification
router.post('/resend-verification', resendVerification);

// Route for logout: POST /api/auth/logout
router.post('/logout', logout);

// Route for getting current user profile: GET /api/auth/me
router.get('/me', protect, getMe);

// Route for updating profile pic: PUT /api/auth/me/profile-pic
router.put('/me/profile-pic', protect, upload.single('image'), updateProfilePic);

export default router;
