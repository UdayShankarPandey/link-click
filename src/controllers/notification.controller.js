import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

// Get paginated notifications for the authenticated user
export const getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .populate('actor', 'name email role profilePicUrl')
        .populate('post', 'title imageUrl postType status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      notifications,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total
    });
  } catch (error) {
    logger.error(`Get Notifications Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
};

// Get the count of unread notifications
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    logger.error(`Get Unread Count Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to get unread count.' });
  }
};

// Mark a specific notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or unauthorized.' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    logger.error(`Mark Notification Read Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to mark notification as read.' });
  }
};

// Mark all unread notifications as read for the authenticated user
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    logger.error(`Mark All Read Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to mark all notifications as read.' });
  }
};
