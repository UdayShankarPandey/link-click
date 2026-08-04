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
  incrementPostViews,
  reactToPost,
  toggleBookmark,
  getBookmarkedPosts,
  updateComment
} from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

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

// Discovery & Bookmark routes (must be defined before /:id)
router.get('/trending', getTrendingPosts);
router.get('/popular', getPopularPosts);
router.get('/hashtags/popular', getPopularHashtags);
router.get('/bookmarked', protect, getBookmarkedPosts);

// Post routes
router.post('/', protect, upload.single('image'), createPost);
router.get('/', getPosts);

// Get posts by a specific user (must be before /:id to avoid 'user' matching as an ID)
router.get('/user/:userId', getPostsByUser);
router.get('/user/:userId/liked', getLikedPostsByUser);

router.get('/:id', getPostById);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

// Reactions & Bookmarks
router.post('/:id/react', protect, reactToPost);
router.post('/:id/bookmark', protect, toggleBookmark);

// Poll voting & view increment routes
router.post('/:id/vote', protect, votePoll);
router.post('/:id/view', protect, incrementPostViews);

// Legacy Like route for backward compatibility
router.post('/:id/like', protect, likePost);

// Comment routes
router.post('/:id/comments', protect, commentPost);
router.put('/:id/comments/:commentId', protect, updateComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;
