import { jest } from '@jest/globals';
import request from 'supertest';

// Mock models
const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockFind = jest.fn();
const mockCountDocuments = jest.fn();
const mockUpdateMany = jest.fn();

jest.unstable_mockModule('../models/Notification.js', () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
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
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should create post_like notification if no identical unread exists', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ _id: 'notif-1' });

      const result = await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_like',
        post: 'post-1'
      });

      expect(mockFindOne).toHaveBeenCalledWith({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_like',
        post: 'post-1',
        isRead: false
      });
      expect(mockCreate).toHaveBeenCalled();
      expect(result).not.toBeNull();
    });

    it('should suppress post_like notification if identical unread exists', async () => {
      mockFindOne.mockResolvedValue({ _id: 'notif-existing' });

      const result = await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_like',
        post: 'post-1'
      });

      expect(mockCreate).not.toHaveBeenCalled();
      expect(result._id).toBe('notif-existing');
    });

    it('should NOT suppress post_comment if commentId is different', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ _id: 'notif-comment' });

      const result = await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_comment',
        post: 'post-1',
        commentId: 'comment-abc'
      });

      expect(mockFindOne).toHaveBeenCalledWith({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'post_comment',
        post: 'post-1',
        commentId: 'comment-abc',
        isRead: false
      });
      expect(mockCreate).toHaveBeenCalled();
    });
    
    it('should suppress user_link notification if identical unread exists', async () => {
      mockFindOne.mockResolvedValue({ _id: 'notif-link' });

      await createNotification({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'user_link'
      });

      expect(mockFindOne).toHaveBeenCalledWith({
        recipient: 'user-1',
        actor: 'user-2',
        type: 'user_link',
        isRead: false
      });
      expect(mockCreate).not.toHaveBeenCalled();
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
