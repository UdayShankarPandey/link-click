import { Router } from 'express';
import multer from 'multer';
import { uploadImage, uploadMultipleImages } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/', protect, upload.single('image'), uploadImage);
router.post('/multiple', protect, upload.array('images', 4), uploadMultipleImages);

export default router;
