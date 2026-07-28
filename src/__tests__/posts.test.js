import request from 'supertest';
import app from '../app.js';

describe('Posts API', () => {
  describe('POST /api/posts', () => {
    it('should reject post creation without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          caption: 'My first test post',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        'Not authorized, no token provided.'
      );
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should reject post deletion without authentication', async () => {
      const response = await request(app)
        .delete('/api/posts/test-post-id');

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        'Not authorized, no token provided.'
      );
    });
  });
});
