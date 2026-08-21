import { jest } from '@jest/globals';
import request from 'supertest';

// Mock models
const mockFindOneAndUpdate = jest.fn();
const mockFind = jest.fn();
const mockCountDocuments = jest.fn();
const mockUpdateMany = jest.fn();

jest.unstable_mockModule('../models/Notification.js', () => ({
  default: {
    findOneAndUpdate: mockFindOneAndUpdate,
    find: mockFind,
    countDocuments: mockCountDocuments,
    updateMany: mockUpdateMany
  }
}));

const { createNotification } = await import('../services/notification.service.js');
const { default: app } = await import('../app.js');

describe('Notification Service & API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Notification Service (Deduplication Logic)', () => {
    it('should not create notification if actor and recipient are the same', async () => {
      const result = await createNotification({
        recipient: 'user-1',
        actor: 'user-1',
        type: 'post_like',
        post: 'post-1'
      });

      expect(result).toBeNull();
      expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should reject missing required fields', async () => {
      const result = await createNotification({
        actor: 'user-1',
        type: 'post_like'
      });

      expect(result).toBeNull();
      expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should create/upsert post_like notification via findOneAndUpdate', async () => {
      mockFindOneAndUpdate.mockResolvedValue({ _id: 'notif-1' });

      const result = await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_like',
        post: 'post-1'
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        {
          recipient: 'user-1',
          actor: 'user-2',
          type: 'post_like',
          post: 'post-1',
          isRead: false
        },
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({ type: 'post_like' })
        }),
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      expect(result).not.toBeNull();
    });

    it('should reject post_reaction with invalid reactionType', async () => {
      const result = await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_reaction',
        post: 'post-1',
        metadata: { reactionType: 'invalid_type' }
      });

      expect(result).toBeNull();
      expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });
    
    it('should create post_reaction with valid reactionType', async () => {
      mockFindOneAndUpdate.mockResolvedValue({ _id: 'notif-reaction' });

      const result = await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_reaction',
        post: 'post-1',
        metadata: { reactionType: 'heart' }
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        {
          recipient: 'user-1',
          actor: 'user-2',
          type: 'post_reaction',
          post: 'post-1',
          'metadata.reactionType': 'heart',
          isRead: false
        },
        expect.any(Object),
        expect.any(Object)
      );
      expect(result).not.toBeNull();
    });

    it('should NOT suppress post_comment if commentId is different', async () => {
      mockFindOneAndUpdate.mockResolvedValue({ _id: 'notif-comment' });

      await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_comment',
        post: 'post-1',
        commentId: 'comment-abc'
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'post_comment',
          commentId: 'comment-abc'
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
    
    it('should handle user_link notification deduplication', async () => {
      mockFindOneAndUpdate.mockResolvedValue({ _id: 'notif-link' });

      await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'user_link'
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        {
          recipient: 'user-1',
          actor: 'user-2',
          type: 'user_link',
          isRead: false
        },
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('2. Notification API Routes', () => {
    it('should reject GET /api/notifications without authentication', async () => {
      const response = await request(app).get('/api/notifications');
      expect(response.statusCode).toBe(401);
    });

    it('should reject GET /api/notifications/unread-count without authentication', async () => {
      const response = await request(app).get('/api/notifications/unread-count');
      expect(response.statusCode).toBe(401);
    });
  });
});
