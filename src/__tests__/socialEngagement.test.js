import { jest } from '@jest/globals';
import request from 'supertest';

const { default: app } = await import('../app.js');

describe('Phase 3 Social Engagement APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/posts/:id/react', () => {
    it('should require authentication for reactions', async () => {
      const response = await request(app)
        .post('/api/posts/post-1/react')
        .send({ type: 'heart' });
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/posts/:id/bookmark', () => {
    it('should require authentication for bookmarking', async () => {
      const response = await request(app).post('/api/posts/post-1/bookmark');
      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/posts/bookmarked', () => {
    it('should require authentication for fetching bookmarks', async () => {
      const response = await request(app).get('/api/posts/bookmarked');
      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/posts/:id/comments/:commentId', () => {
    it('should require authentication for editing comments', async () => {
      const response = await request(app)
        .put('/api/posts/post-1/comments/c-1')
        .send({ text: 'Edited text' });
      expect(response.statusCode).toBe(401);
    });
  });
});
