import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

// Connection manager for SSE
export const clients = new Map();

export const addClient = (userId, res) => {
  const idStr = userId.toString();
  if (!clients.has(idStr)) {
    clients.set(idStr, new Set());
  }
  
  const userClients = clients.get(idStr);
  
  // Abuse Resistance: Enforce a strict limit on concurrent SSE connections per user
  if (userClients.size >= 5) {
    return false;
  }
  
  userClients.add(res);

  res.on('close', () => {
    const activeClients = clients.get(idStr);
    if (activeClients) {
      activeClients.delete(res);
      if (activeClients.size === 0) {
        clients.delete(idStr);
      }
    }
  });
  
  return true;
};

export const emitToUser = (userId, payload) => {
  const userClients = clients.get(userId.toString());
  if (userClients) {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    userClients.forEach(res => res.write(data));
  }
};

// Lightweight heartbeat/keep-alive to prevent broken connections
setInterval(() => {
  clients.forEach((userClients) => {
    userClients.forEach(res => res.write(':\n\n'));
  });
}, 30000).unref();

/**
 * Creates a notification if it passes deduplication rules.
 * @param {Object} data - The notification payload
 * @param {string} data.recipient - User ID receiving the notification
 * @param {string} data.actor - User ID performing the action
 * @param {string} data.type - 'post_like', 'post_reaction', 'post_comment', 'user_link'
 * @param {string} [data.post] - Related Post ID
 * @param {string} [data.commentId] - Related Comment ID
 * @param {Object} [data.metadata] - Optional metadata (e.g. reactionType)
 */
export const createNotification = async (data) => {
  try {
    const { recipient, actor, type, post, commentId, metadata } = data;

    if (!recipient || !actor || !type) {
      logger.warn('Notification creation failed: missing required fields');
      return null;
    }

    // Users should not receive notifications for their own actions
    if (recipient.toString() === actor.toString()) {
      return null;
    }

    // Type-aware deduplication strategy
    let query = { recipient, actor, type, isRead: false };

    if (type === 'post_like') {
      // Prevent duplicate unread like notifications for the same actor + post
      if (!post) return null; // Post is required
      query.post = post;
    } else if (type === 'post_reaction') {
      // Prevent duplicate unread reaction notifications for the same reaction type + actor + post
      if (!post) return null;
      query.post = post;
      if (metadata?.reactionType) {
        query['metadata.reactionType'] = metadata.reactionType;
      }
    } else if (type === 'post_comment') {
      // DO NOT suppress separate comments. Only deduplicate the exact same comment ID.
      if (!post || !commentId) return null;
      query.post = post;
      query.commentId = commentId;
    } else if (type === 'user_link') {
      // Prevent duplicate notifications for the same actor/recipient link relationship
      // No extra query fields needed, actor + recipient + type is enough
    } else {
      logger.warn(`Unknown notification type: ${type}`);
      return null;
    }

    if (type === 'post_reaction') {
      const allowedReactions = ['heart', 'thumbs_up', 'laugh', 'surprised', 'sad'];
      if (!metadata?.reactionType || !allowedReactions.includes(metadata.reactionType)) {
        logger.warn(`Notification creation failed: invalid reaction type ${metadata?.reactionType}`);
        return null;
      }
    }

    // Atomic deduplication & creation to avoid concurrency race conditions
    const result = await Notification.findOneAndUpdate(
      query,
      {
        $setOnInsert: {
          recipient,
          actor,
          type,
          post,
          commentId,
          metadata
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
    );

    const notification = result.value;
    const isNew = !result.lastErrorObject?.updatedExisting;

    if (isNew) {
      // Must populate to match REST endpoint structure exactly
      const populatedNotification = await Notification.findById(notification._id)
        .populate('actor', 'name email role profilePicUrl')
        .populate('post', 'title imageUrl postType status')
        .lean();
        
      emitToUser(recipient, {
        type: 'notification:new',
        notification: populatedNotification
      });
    }

    return notification;
  } catch (error) {
    logger.error(`Notification Creation Error: ${error.message}`);
    // We don't want a notification failure to crash the main request flow (e.g. failing to like a post)
    return null;
  }
};
