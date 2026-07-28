import { logger } from '../utils/logger.js';
import imagekit from '../config/imagekit.js';
import Post from '../models/Post.js';

// Max pagination limit to prevent abuse
const MAX_LIMIT = 50;

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    let imageUrl = req.body.imageUrl;
    let imageThumbnailUrl = req.body.imageThumbnailUrl;
    let imageFileId = req.body.imageFileId;

    // Handle direct image file upload via multer
    if (req.file) {
      const result = await imagekit.files.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `post-${Date.now()}-${req.file.originalname}`,
        folder: '/posts'
      });
      imageUrl = result.url;
      imageThumbnailUrl = result.thumbnailUrl;
      imageFileId = result.fileId;
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Post image is required. Please upload an image file or provide a valid imageUrl.' });
    }

    const post = await Post.create({
      user: req.user._id,
      title,
      content,
      imageUrl,
      imageThumbnailUrl,
      imageFileId
    });

    res.status(201).json({
      message: 'Post created successfully.',
      post
    });
  } catch (error) {
    logger.error("Create Post Error:", { error });
    res.status(500).json({ message: 'Failed to create post.' });
  }
};

// Get all posts (newest first, with pagination)
export const getPosts = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate('user', 'name email role')
        .populate('comments.user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments()
    ]);

    res.status(200).json({
      posts,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    logger.error(`Get Posts Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve posts.' });
  }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('comments.user', 'name email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    res.status(200).json(post);
  } catch (error) {
    logger.error(`Get Post Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve post.' });
  }
};

// Get posts by a specific user
export const getPostsByUser = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ user: req.params.userId })
        .populate('user', 'name email role')
        .populate('comments.user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ user: req.params.userId })
    ]);

    res.status(200).json({
      posts,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    logger.error(`Get User Posts Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve user posts.' });
  }
};

// Update a post (only allowed for the author)
export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this post.' });
    }

    if (title) post.title = title;
    if (content !== undefined) post.content = content;

    // Handle image update via file upload
    if (req.file) {
      // Delete old image from ImageKit if it exists
      if (post.imageFileId) {
        try {
          await imagekit.files.deleteFile(post.imageFileId);
        } catch (ikError) {
          logger.error(`Failed to delete old image from ImageKit: ${ikError.message}`);
        }
      }

      const result = await imagekit.files.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `post-${Date.now()}-${req.file.originalname}`,
        folder: '/posts'
      });
      post.imageUrl = result.url;
      post.imageThumbnailUrl = result.thumbnailUrl;
      post.imageFileId = result.fileId;
    }

    const updatedPost = await post.save();
    res.status(200).json({
      message: 'Post updated successfully.',
      post: updatedPost
    });
  } catch (error) {
    logger.error(`Update Post Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to update post.' });
  }
};

// Delete a post (only allowed for the author or an admin)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check authorization (post owner or admin)
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this post.' });
    }

    // Delete image from ImageKit if imageFileId is stored
    if (post.imageFileId) {
      try {
        await imagekit.files.deleteFile(post.imageFileId);
      } catch (ikError) {
        logger.error(`Failed to delete image from ImageKit: ${ikError.message}`);
        // We log the error but don't block post deletion in DB if it was already deleted or not found
      }
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    logger.error(`Delete Post Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to delete post.' });
  }
};

// Toggle like/unlike on a post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const userId = req.user._id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      // Like the post
      post.likes.push(userId);
    } else {
      // Unlike the post
      post.likes.splice(index, 1);
    }

    await post.save();
    res.status(200).json({
      message: index === -1 ? 'Post liked successfully.' : 'Post unliked successfully.',
      likesCount: post.likes.length,
      likes: post.likes
    });
  } catch (error) {
    logger.error(`Like Post Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to toggle like on post.' });
  }
};

// Add a comment to a post
export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    // Limit comment length to prevent abuse
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Comment must be 2000 characters or less.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const newComment = {
      user: req.user._id,
      text
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name email role')
      .populate('comments.user', 'name email');

    res.status(201).json({
      message: 'Comment added successfully.',
      post: updatedPost
    });
  } catch (error) {
    logger.error(`Comment Post Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to add comment.' });
  }
};

// Delete a comment from a post
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Check authorization: comment author, post owner, or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({
      message: 'Comment deleted successfully.',
      comments: post.comments
    });
  } catch (error) {
    logger.error(`Delete Comment Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to delete comment.' });
  }
};

// Get posts liked by a user
export const getLikedPostsByUser = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const userId = req.params.userId;

    const query = { likes: userId };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('user', 'name role')
      .populate('comments.user', 'name role')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: posts.length,
      totalPosts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      posts
    });
  } catch (error) {
    logger.error(`Get Liked Posts By User Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch liked posts.' });
  }
};
