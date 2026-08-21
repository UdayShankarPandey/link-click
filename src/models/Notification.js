import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required']
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor is required']
    },
    type: {
      type: String,
      enum: ['post_like', 'post_comment', 'post_reaction', 'user_link'],
      required: [true, 'Notification type is required']
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
      reactionType: {
        type: String,
        enum: ['heart', 'thumbs_up', 'laugh', 'surprised', 'sad']
      }
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Primary query pattern: fetch a user's notifications, newest first
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Optimize querying for unread count
notificationSchema.index({ recipient: 1, isRead: 1 });

// Deduplication support: index on combination of fields to quickly find identical unread notifications
notificationSchema.index({ recipient: 1, actor: 1, type: 1, post: 1 }, { background: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
