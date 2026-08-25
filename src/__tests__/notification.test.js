import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';

// Mock models
const mockFindOneAndUpdate = jest.fn();
const mockFind = jest.fn();
const mockCountDocuments = jest.fn();
const mockUpdateMany = jest.fn();
const mockFindById = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439010' })
    })
  })
});

jest.unstable_mockModule('../models/Notification.js', () => ({
  default: {
    findOneAndUpdate: mockFindOneAndUpdate,
    find: mockFind,
    countDocuments: mockCountDocuments,
    updateMany: mockUpdateMany,
    findById: mockFindById
  }
}));

const { createNotification } = await import('../services/notification.service.js');
const { default: app } = await import('../app.js');

const USER_1 = '507f1f77bcf86cd799439011';
const USER_2 = '507f1f77bcf86cd799439012';
const POST_1 = '507f1f77bcf86cd799439013';
const COMMENT_ABC = '507f1f77bcf86cd799439014';

describe('Notification Service & API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Notification Service (Deduplication Logic)', () => {
    it('should not create notification if actor and recipient are the same', async () => {
      const result = await createNotification({
        recipient: USER_1,
        actor: USER_1,
        type: 'post_like',
        post: POST_1
      });

      expect(result).toBeNull();
      expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should reject missing required fields', async () => {
      const result = await createNotification({
        actor: USER_1,
        type: 'post_like'
      });

      expect(result).toBeNull();
      expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should create/upsert post_like notification via findOneAndUpdate', async () => {
      mockFindOneAndUpdate.mockResolvedValue({ value: { _id: '507f1f77bcf86cd799439010' }, lastErrorObject: { updatedExisting: false } });

      const result = await createNotification({
        recipient: USER_1,
        actor: USER_2,
        type: 'post_like',
        post: POST_1
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        {
          recipient: { $eq: USER_1 },
          actor: { $eq: USER_2 },
          type: { $eq: 'post_like' },
          post: { $eq: POST_1 },
          isRead: { $eq: false }
        },
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({ type: 'post_like' })
        }),
        { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
      );
      expect(result).not.toBeNull();
    });

    it('should reject post_reaction with invalid reactionType', async () => {
      const result = await createNotification({
        recipient: USER_1,
        actor: USER_2,
        type: 'post_reaction',
        post: POST_1,
        metadata: { reactionType: 'invalid_type' }
      });

      expect(result).toBeNull();
      expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });
    
    it('should create post_reaction with valid reactionType', async () => {
      mockFindOneAndUpdate.mockResolvedValue({ value: { _id: '507f1f77bcf86cd799439010' }, lastErrorObject: { updatedExisting: false } });

      const result = await createNotification({
        recipient: USER_1,
        actor: USER_2,
        type: 'post_reaction',
        post: POST_1,
        metadata: { reactionType: 'heart' }
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        {
          recipient: { $eq: USER_1 },
          actor: { $eq: USER_2 },
          type: { $eq: 'post_reaction' },
          post: { $eq: POST_1 },
          'metadata.reactionType': { $eq: 'heart' },
          isRead: { $eq: false }
        },
        expect.any(Object),
        expect.any(Object)
      );
      expect(result).not.toBeNull();
    });

    it('should NOT suppress post_comment if commentId is different', async () => {
      mockFindOneAndUpdate.mockResolvedValue({ value: { _id: '507f1f77bcf86cd799439010' }, lastErrorObject: { updatedExisting: false } });

      await createNotification({
        recipient: USER_1,
        actor: USER_2,
        type: 'post_comment',
        post: POST_1,
        commentId: COMMENT_ABC
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: { $eq: 'post_comment' },
          commentId: { $eq: COMMENT_ABC }
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
    
    it('should handle user_link notification deduplication', async () => {
      mockFindOneAndUpdate.mockResolvedValue({ value: { _id: '507f1f77bcf86cd799439010' }, lastErrorObject: { updatedExisting: false } });

      await createNotification({
        recipient: USER_1,
        actor: USER_2,
        type: 'user_link'
      });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        {
          recipient: { $eq: USER_1 },
          actor: { $eq: USER_2 },
          type: { $eq: 'user_link' },
          isRead: { $eq: false }
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
