import { logger } from '../utils/logger.js';
import imagekit from '../config/imagekit.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import {
  TRENDING_REACTION_WEIGHT,
  TRENDING_COMMENT_WEIGHT,
  TRENDING_VIEW_WEIGHT
} from '../config/constants.js';
import { createNotification } from '../services/notification.service.js';

// Max pagination limit to prevent abuse
const MAX_LIMIT = 50;

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, postType = 'standard', poll } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    let images = req.body.images || [];

    // Legacy single image fields or single file upload
    let imageUrl = req.body.imageUrl;
    let imageThumbnailUrl = req.body.imageThumbnailUrl;
    let imageFileId = req.body.imageFileId;

    if (req.file) {
      const result = await imagekit.files.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `post-${Date.now()}-${req.file.originalname}`,
        folder: '/posts'
      });
      imageUrl = result.url;
      imageThumbnailUrl = result.thumbnailUrl;
      imageFileId = result.fileId;

      images = [{ url: imageUrl, thumbnailUrl: imageThumbnailUrl, fileId: imageFileId }];
    } else if (imageUrl && images.length === 0) {
      images = [{ url: imageUrl, thumbnailUrl: imageThumbnailUrl || imageUrl, fileId: imageFileId || '' }];
    }

    // Require image ONLY for standard posts when poll is not attached
    if (postType === 'standard' && images.length === 0 && !imageUrl) {
      return res.status(400).json({ message: 'Post image is required. Please upload at least one image.' });
    }

    // Process poll if postType is 'poll'
    let pollData = null;
    if (postType === 'poll' && poll) {
      if (!poll.question || !Array.isArray(poll.options) || poll.options.length < 2 || poll.options.length > 6) {
        return res.status(400).json({ message: 'Polls must contain a question and 2 to 6 options.' });
      }

      const formattedOptions = poll.options.map((opt, index) => ({
        optionId: opt.optionId || `opt_${Date.now()}_${index}`,
        text: typeof opt === 'string' ? opt : opt.text,
        votes: []
      }));

      pollData = {
        question: poll.question.trim(),
        options: formattedOptions,
        expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
        totalVotes: 0
      };
    }

    const post = await Post.create({
      user: req.user._id,
      title,
      content,
      postType,
      images,
      imageUrl: images[0]?.url || imageUrl || '',
      imageThumbnailUrl: images[0]?.thumbnailUrl || imageThumbnailUrl || '',
      imageFileId: images[0]?.fileId || imageFileId || '',
      poll: pollData
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

// Delete a post (only allowed for the author or founder)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check authorization (post owner or founder)
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'founder') {
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
    // Cascade purge deleted post from all user bookmarks
    await User.updateMany({}, { $pull: { bookmarks: req.params.id } });
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

    let shouldNotifyLike = false;
    if (index === -1) {
      // Like the post
      post.likes.push(userId);
      shouldNotifyLike = true;
    } else {
      // Unlike the post
      post.likes.splice(index, 1);
    }

    await post.save();
    
    if (shouldNotifyLike) {
      await createNotification({
        recipient: post.user,
        actor: userId,
        type: 'post_like',
        post: post._id
      });
    }
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

    const addedComment = post.comments[post.comments.length - 1];
    await createNotification({
      recipient: post.user,
      actor: req.user._id,
      type: 'post_comment',
      post: post._id,
      commentId: addedComment._id
    });

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

    // Check authorization: comment author, post owner, or founder
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'founder'
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

    const query = {
      $or: [
        { 'reactions.user': userId, 'reactions.type': 'heart' },
        { likes: userId }
      ]
    };

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

// Get trending posts based on weighted engagement score (last 7 days)
export const getTrendingPosts = async (req, res) => {
  try {
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit) || 5));
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    let posts = await Post.find({ createdAt: { $gte: sevenDaysAgo } })
      .populate({
        path: 'user',
        select: 'name email role profilePicUrl bio status',
        match: { status: { $ne: 'deleted' } }
      })
      .populate('comments.user', 'name email role');

    posts = posts.filter(post => post.user && post.user.status !== 'deleted');

    // Fallback: If fewer than 5 qualifying posts exist in last 7 days, fetch all available qualifying posts
    if (posts.length < 5) {
      const fallbackPosts = await Post.find()
        .populate({
          path: 'user',
          select: 'name email role profilePicUrl bio status',
          match: { status: { $ne: 'deleted' } }
        })
        .populate('comments.user', 'name email role');

      posts = fallbackPosts.filter(post => post.user && post.user.status !== 'deleted');
    }

    const scoredPosts = posts.map(post => {
      const reactionsCount = (post.reactions?.length || post.likes?.length || 0);
      const commentsCount = (post.comments?.length || 0);
      const viewsCount = (post.views || 0);

      const score =
        reactionsCount * TRENDING_REACTION_WEIGHT +
        commentsCount * TRENDING_COMMENT_WEIGHT +
        viewsCount * TRENDING_VIEW_WEIGHT;

      return { post, score };
    });

    scoredPosts.sort((a, b) => b.score - a.score);
    const trendingPosts = scoredPosts.slice(0, limit).map(item => item.post);

    res.status(200).json({
      success: true,
      count: trendingPosts.length,
      posts: trendingPosts
    });
  } catch (error) {
    logger.error(`Get Trending Posts Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve trending posts.' });
  }
};

// Get popular posts sorted by reaction/like count DESC
export const getPopularPosts = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit) || 10));

    let posts = await Post.find()
      .populate({
        path: 'user',
        select: 'name email role profilePicUrl bio status',
        match: { status: { $ne: 'deleted' } }
      })
      .populate('comments.user', 'name email role');

    posts = posts.filter(post => post.user && post.user.status !== 'deleted');

    posts.sort((a, b) => {
      const countA = (a.reactions?.length || a.likes?.length || 0);
      const countB = (b.reactions?.length || b.likes?.length || 0);
      return countB - countA;
    });

    const popularPosts = posts.slice(0, limit);

    res.status(200).json({
      success: true,
      count: popularPosts.length,
      posts: popularPosts
    });
  } catch (error) {
    logger.error(`Get Popular Posts Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve popular posts.' });
  }
};

// Get popular hashtags aggregated from post titles and content
export const getPopularHashtags = async (req, res) => {
  try {
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit) || 10));
    const posts = await Post.find({}, 'title content');

    const tagCounts = {};
    for (const post of posts) {
      const combinedText = `${post.title || ''} ${post.content || ''}`;
      const hashtagRegex = /#\w+/g;
      let match;
      while ((match = hashtagRegex.exec(combinedText)) !== null) {
        const normalizedTag = match[0].toLowerCase();
        if (normalizedTag.length <= 30) {
          tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
        }
      }
    }

    const popularHashtags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      hashtags: popularHashtags
    });
  } catch (error) {
    logger.error(`Get Popular Hashtags Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve popular hashtags.' });
  }
};

// Cast vote on a poll post
export const votePoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!optionId) {
      return res.status(400).json({ message: 'Option ID is required.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.postType !== 'poll' || !post.poll) {
      return res.status(400).json({ message: 'This post is not a poll.' });
    }

    if (post.poll.expiresAt && new Date(post.poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'This poll has expired.' });
    }

    // Single vote check across all options
    let alreadyVoted = false;
    post.poll.options.forEach(opt => {
      if (opt.votes.some(v => v.toString() === userId.toString())) {
        alreadyVoted = true;
      }
    });

    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted in this poll.' });
    }

    const targetOption = post.poll.options.find(
      opt => opt.optionId === optionId || opt._id.toString() === optionId
    );
    if (!targetOption) {
      return res.status(404).json({ message: 'Poll option not found.' });
    }

    targetOption.votes.push(userId);

    let total = 0;
    post.poll.options.forEach(opt => {
      total += opt.votes.length;
    });
    post.poll.totalVotes = total;

    await post.save();

    res.status(200).json({
      message: 'Vote recorded successfully.',
      poll: post.poll
    });
  } catch (error) {
    logger.error(`Vote Poll Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to record vote.' });
  }
};

// Increment post view count (Author views excluded)
export const incrementPostViews = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Do not count author's own views
    if (req.user && post.user.toString() === req.user._id.toString()) {
      return res.status(200).json({ message: 'Author view ignored.', views: post.views });
    }

    post.views = (post.views || 0) + 1;
    await post.save();

    res.status(200).json({
      message: 'View counted.',
      views: post.views
    });
  } catch (error) {
    logger.error(`Increment Post Views Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to record post view.' });
  }
};

// Unified emoji reactions endpoint
export const reactToPost = async (req, res) => {
  try {
    const { type } = req.body;
    const allowedTypes = ['heart', 'thumbs_up', 'laugh', 'surprised', 'sad'];
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid or missing reaction type.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const userId = req.user._id;
    if (!post.reactions) post.reactions = [];

    const existingIndex = post.reactions.findIndex(
      r => r.user.toString() === userId.toString()
    );

    let activeReaction = null;
    let shouldNotifyReaction = false;

    if (existingIndex > -1) {
      const existingReaction = post.reactions[existingIndex];
      if (existingReaction.type === type) {
        // Remove reaction if same emoji selected again
        post.reactions.splice(existingIndex, 1);
      } else {
        // Replace with new reaction type
        post.reactions[existingIndex].type = type;
        activeReaction = type;
        shouldNotifyReaction = true;
      }
    } else {
      // Add new reaction
      post.reactions.push({ user: userId, type });
      activeReaction = type;
      shouldNotifyReaction = true;
    }

    await post.save();
    
    if (shouldNotifyReaction) {
      await createNotification({
        recipient: post.user,
        actor: userId,
        type: 'post_reaction',
        post: post._id,
        metadata: { reactionType: type }
      });
    }

    const groupedCounts = {
      heart: 0,
      thumbs_up: 0,
      laugh: 0,
      surprised: 0,
      sad: 0
    };
    post.reactions.forEach(r => {
      if (groupedCounts[r.type] !== undefined) {
        groupedCounts[r.type]++;
      }
    });

    res.status(200).json({
      message: 'Reaction updated successfully.',
      reactions: post.reactions,
      likes: post.likes,
      userReaction: activeReaction,
      groupedCounts
    });
  } catch (error) {
    logger.error(`React To Post Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to update reaction.' });
  }
};

// Toggle bookmark status for authenticated user
export const toggleBookmark = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const user = await User.findById(req.user._id);
    if (!user.bookmarks) user.bookmarks = [];

    const index = user.bookmarks.indexOf(postId);
    let isBookmarked = false;

    if (index > -1) {
      user.bookmarks.splice(index, 1);
    } else {
      user.bookmarks.push(postId);
      isBookmarked = true;
    }

    await user.save();

    res.status(200).json({
      message: isBookmarked ? 'Post bookmarked.' : 'Bookmark removed.',
      isBookmarked,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    logger.error(`Toggle Bookmark Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to update bookmark.' });
  }
};

// Get bookmarked posts for authenticated user
export const getBookmarkedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookmarkedIds = user?.bookmarks || [];

    if (bookmarkedIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        posts: []
      });
    }

    let posts = await Post.find({ _id: { $in: bookmarkedIds } })
      .populate({
        path: 'user',
        select: 'name email role profilePicUrl bio status',
        match: { status: { $ne: 'deleted' } }
      })
      .populate('comments.user', 'name email role')
      .sort({ createdAt: -1 });

    posts = posts.filter(post => post.user && post.user.status !== 'deleted');

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    logger.error(`Get Bookmarked Posts Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve saved posts.' });
  }
};

// Update comment text (inline editing)
export const updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: postId, commentId } = req.params;

    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'founder') {
      return res.status(403).json({ message: 'Not authorized to edit this comment.' });
    }

    comment.text = text.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await post.save();

    res.status(200).json({
      message: 'Comment updated successfully.',
      comments: post.comments
    });
  } catch (error) {
    logger.error(`Update Comment Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to update comment.' });
  }
};



