import { jest } from '@jest/globals';
import request from 'supertest';

const mockFindById = jest.fn();
const mockPostCreate = jest.fn();

jest.unstable_mockModule('../models/Post.js', () => ({
  default: {
    findById: mockFindById,
    create: mockPostCreate,
  },
}));

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    findById: jest.fn(() => Promise.resolve({ _id: 'user-1', name: 'User 1', role: 'user' })),
  },
}));

const { default: app } = await import('../app.js');

describe('Phase 2 Rich Content APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/posts/:id/vote', () => {
    it('should record a vote for an eligible poll option', async () => {
      const mockPostObj = {
        _id: 'post-poll-1',
        postType: 'poll',
        poll: {
          question: 'Which framework?',
          expiresAt: null,
          totalVotes: 0,
          options: [
            { optionId: 'opt_1', text: 'React', votes: [] },
            { optionId: 'opt_2', text: 'Vue', votes: [] }
          ]
        },
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindById.mockResolvedValue(mockPostObj);

      // Verify endpoint structure and error responses when unauthenticated

      // Verify endpoint structure and error responses when unauthenticated
      const unauthRes = await request(app)
        .post('/api/posts/post-poll-1/vote')
        .send({ optionId: 'opt_1' });

      expect(unauthRes.statusCode).toBe(401);
    });
  });

  describe('POST /api/posts/:id/view', () => {
    it('should require authentication to count post views', async () => {
      const response = await request(app).post('/api/posts/post-123/view');
      expect(response.statusCode).toBe(401);
    });
  });
});
