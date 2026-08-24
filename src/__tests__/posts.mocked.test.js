import { jest } from '@jest/globals';
import request from 'supertest';

const mockLimit = jest.fn();
const mockSkip = jest.fn(() => ({
  limit: mockLimit,
}));
const mockSort = jest.fn(() => ({
  skip: mockSkip,
}));
const mockPopulateComments = jest.fn(() => ({
  sort: mockSort,
}));
const mockPopulateUser = jest.fn(() => ({
  populate: mockPopulateComments,
}));
const mockFind = jest.fn(() => ({
  populate: mockPopulateUser,
}));

const mockFindByIdPopulateComments = jest.fn();

const mockFindByIdPopulateUser = jest.fn(() => ({
  populate: mockFindByIdPopulateComments,
}));

const mockFindById = jest.fn(() => ({
  populate: mockFindByIdPopulateUser,
}));

const mockCountDocuments = jest.fn();

jest.unstable_mockModule('../models/Post.js', () => ({
  default: {
    find: mockFind,
    findById: mockFindById,
    countDocuments: mockCountDocuments,
  },
}));

const { default: app } = await import('../app.js');

describe('Posts API with mocked database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should return paginated posts', async () => {
      const fakePosts = [
        {
          _id: 'post-1',
          title: 'First Post',
          content: 'Test content',
          imageUrl: 'https://example.com/image.jpg',
        },
      ];

      mockLimit.mockResolvedValue(fakePosts);
      mockCountDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/posts');

      expect(response.statusCode).toBe(200);
      expect(response.body.posts).toEqual(fakePosts);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.totalPosts).toBe(1);

      expect(mockFind).toHaveBeenCalled();
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(20);
    });

    it('should cap the pagination limit at 50', async () => {
      mockLimit.mockResolvedValue([]);
      mockCountDocuments.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/posts?page=2&limit=1000');

      expect(response.statusCode).toBe(200);

      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(50);
      expect(response.body.totalPosts).toBe(0);

      expect(mockSkip).toHaveBeenCalledWith(50);
      expect(mockLimit).toHaveBeenCalledWith(50);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by ID', async () => {
      const fakePost = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Post',
        content: 'Test content',
        imageUrl: 'https://example.com/image.jpg',
      };

      mockFindByIdPopulateComments.mockResolvedValue(fakePost);

      const response = await request(app)
        .get('/api/posts/507f1f77bcf86cd799439011');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(fakePost);

      expect(mockFindById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockFindByIdPopulateUser).toHaveBeenCalledWith(
        'user',
        'name email role'
      );
      expect(mockFindByIdPopulateComments).toHaveBeenCalledWith(
        'comments.user',
        'name email'
      );
    });

    it('should return 404 when the post does not exist', async () => {
      mockFindByIdPopulateComments.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/posts/507f1f77bcf86cd799439012');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Post not found.');
    });
  });
});
