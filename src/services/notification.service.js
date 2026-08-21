import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

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

    // Check for existing unread notification matching the deduplication criteria
    const existingUnread = await Notification.findOne(query);

    if (existingUnread) {
      // Instead of creating a new notification, we could update the createdAt timestamp
      // to bump it to the top, but for now we simply suppress the duplicate to avoid spam.
      return existingUnread;
    }

    // Create the new notification
    const notification = await Notification.create({
      recipient,
      actor,
      type,
      post,
      commentId,
      metadata
    });

    return notification;
  } catch (error) {
    logger.error(`Notification Creation Error: ${error.message}`);
    // We don't want a notification failure to crash the main request flow (e.g. failing to like a post)
    return null;
  }
};
