import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

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

const VALID_TYPES = new Set(['post_like', 'post_reaction', 'post_comment', 'user_link']);
const VALID_REACTIONS = new Set(['heart', 'thumbs_up', 'laugh', 'surprised', 'sad']);

const validateNotificationData = (data) => {
  const { recipient, actor, type, post, commentId, metadata } = data;
  
  if (!recipient || !mongoose.Types.ObjectId.isValid(recipient)) return null;
  if (!actor || !mongoose.Types.ObjectId.isValid(actor)) return null;
  if (!type || !VALID_TYPES.has(type)) return null;
  
  if (recipient.toString() === actor.toString()) return null;

  const validData = {
    recipient: recipient.toString(),
    actor: actor.toString(),
    type,
    isRead: false
  };

  if (type === 'post_like' || type === 'post_reaction' || type === 'post_comment') {
    if (!post || !mongoose.Types.ObjectId.isValid(post)) return null;
    validData.post = post.toString();
  }

  if (type === 'post_reaction') {
    const reactionType = metadata?.reactionType;
    if (!reactionType || typeof reactionType !== 'string' || !VALID_REACTIONS.has(reactionType)) return null;
    validData.metadata = { reactionType };
  }

  if (type === 'post_comment') {
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) return null;
    validData.commentId = commentId.toString();
  }

  return validData;
};

const buildDeduplicationQuery = (validData) => {
  const query = { 
    recipient: String(validData.recipient), 
    actor: String(validData.actor), 
    type: String(validData.type), 
    isRead: false 
  };

  if (validData.post) query.post = String(validData.post);
  if (validData.commentId) query.commentId = String(validData.commentId);

  return query;
};

const emitNotification = async (notificationId, recipient, eventType = 'notification:new') => {
  try {
    const populatedNotification = await Notification.findById(notificationId)
      .populate('actor', 'name email role profilePicUrl')
      .populate('post', 'title imageUrl postType status')
      .lean();
      
    emitToUser(recipient, {
      type: eventType,
      notification: populatedNotification
    });
  } catch (err) {
    logger.error(`Notification Emission Error: ${err.message}`);
  }
};

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
    const validData = validateNotificationData(data);
    if (!validData) {
      logger.warn('Notification creation failed: invalid or self-referential data');
      return null;
    }

  const query = buildDeduplicationQuery(validData);
  const updatePayload = { $setOnInsert: { ...validData } };

  // If this is a reaction notification, we update the reaction type if it exists,
  // instead of creating a new notification for a changed reaction.
  if (validData.metadata?.reactionType) {
    updatePayload.$set = { 'metadata.reactionType': validData.metadata.reactionType };
    delete updatePayload.$setOnInsert.metadata;
  }

  const result = await Notification.findOneAndUpdate(
    query,
    updatePayload,
    { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
  );

  const notification = result.value;
  const isNew = !result.lastErrorObject?.updatedExisting;

  if (isNew) {
      // Must populate to match REST endpoint structure exactly
      await emitNotification(notification._id, validData.recipient, 'notification:new');
  } else if (validData.metadata?.reactionType) {
      // Emit an update event for existing unread notifications when reaction type changes
      await emitNotification(notification._id, validData.recipient, 'notification:update');
  }

    return notification;
  } catch (error) {
    logger.error(`Notification Creation Error: ${error.message}`);
    // We don't want a notification failure to crash the main request flow (e.g. failing to like a post)
    return null;
  }
};
