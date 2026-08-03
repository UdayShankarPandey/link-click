import { Router } from 'express';
import multer from 'multer';
import {
  createPost,
  getPosts,
  getPostById,
  getPostsByUser,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  deleteComment,
  getLikedPostsByUser,
  getTrendingPosts,
  getPopularPosts,
  getPopularHashtags,
  votePoll,
  incrementPostViews
} from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Configure multer with memory storage and image-only file filter
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Discovery routes (must be defined before /:id)
router.get('/trending', getTrendingPosts);
router.get('/popular', getPopularPosts);
router.get('/hashtags/popular', getPopularHashtags);

// Post routes
router.post('/', protect, upload.single('image'), createPost);
router.get('/', getPosts);

// Get posts by a specific user (must be before /:id to avoid 'user' matching as an ID)
router.get('/user/:userId', getPostsByUser);
// Get posts liked by a specific user
router.get('/user/:userId/liked', getLikedPostsByUser);

router.get('/:id', getPostById);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

// Poll voting route
router.post('/:id/vote', protect, votePoll);

// Post view increment route
router.post('/:id/view', protect, incrementPostViews);

// Like routes
router.post('/:id/like', protect, likePost);

// Comment routes
router.post('/:id/comments', protect, commentPost);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;
