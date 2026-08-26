import { jest } from '@jest/globals';
import request from 'supertest';

const mockLimitTrending = jest.fn();
const mockPopulateCommentsTrending = jest.fn(() => ({
  limit: mockLimitTrending,
}));
const mockPopulateUserTrending = jest.fn(() => ({
  populate: mockPopulateCommentsTrending,
}));
const mockLeanHashtags = jest.fn();
const mockLimitHashtags = jest.fn(() => ({ lean: mockLeanHashtags }));
const mockSortHashtags = jest.fn(() => ({ limit: mockLimitHashtags }));

const mockPostFind = jest.fn(() => ({
  populate: mockPopulateUserTrending,
  sort: mockSortHashtags,
}));

const mockUserFind = jest.fn();

jest.unstable_mockModule('../models/Post.js', () => ({
  default: {
    find: mockPostFind,
  },
}));

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    find: mockUserFind,
  },
}));

const { default: app } = await import('../app.js');

describe('Community Discovery APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts/trending', () => {
    it('should return trending posts based on engagement score', async () => {
      const fakePosts = [
        {
          _id: 'post-1',
          title: 'Trending Tech #tech',
          content: 'Cool tech post #react',
          views: 100,
          likes: ['user-1', 'user-2'],
          comments: [{ _id: 'c1' }],
          user: { _id: 'user-a', name: 'Author A', status: 'active' },
          createdAt: new Date()
        },
        {
          _id: 'post-2',
          title: 'High Reaction Post',
          content: 'Lots of likes',
          views: 10,
          likes: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
          comments: [],
          user: { _id: 'user-b', name: 'Author B', status: 'active' },
          createdAt: new Date()
        }
      ];

      mockLimitTrending.mockResolvedValue(fakePosts);

      const response = await request(app).get('/api/posts/trending?limit=5');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(mockPostFind).toHaveBeenCalled();
    });
  });

  describe('GET /api/posts/popular', () => {
    it('should return popular posts sorted by reaction count', async () => {
      const fakePosts = [
        {
          _id: 'post-1',
          title: 'Post 1',
          likes: ['u1'],
          user: { _id: 'user-a', status: 'active' }
        },
        {
          _id: 'post-2',
          title: 'Post 2',
          likes: ['u1', 'u2', 'u3'],
          user: { _id: 'user-b', status: 'active' }
        }
      ];

      mockLimitTrending.mockResolvedValue(fakePosts);

      const response = await request(app).get('/api/posts/popular');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.posts[0]._id).toBe('post-2');
    });
  });

  describe('GET /api/posts/hashtags/popular', () => {
    it('should extract and normalize hashtags to lowercase', async () => {
      const fakePosts = [
        { title: 'Learning #ReactJS and #NodeJS', content: 'Fun with #reactjs' },
        { title: 'Another #Tech post', content: 'More #TECH stuff' }
      ];

      mockLeanHashtags.mockResolvedValue(fakePosts);

      mockPostFind.mockImplementation((filter, select) => {
        if (select === 'title content') {
          return { sort: mockSortHashtags };
        }
        return { populate: mockPopulateUserTrending };
      });

      const response = await request(app).get('/api/posts/hashtags/popular');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.hashtags).toBeDefined();

      const reactjsTag = response.body.hashtags.find(h => h.tag === '#reactjs');
      expect(reactjsTag).toBeDefined();
      expect(reactjsTag.count).toBe(2);

      const techTag = response.body.hashtags.find(h => h.tag === '#tech');
      expect(techTag).toBeDefined();
      expect(techTag.count).toBe(2);
    });
  });
});
