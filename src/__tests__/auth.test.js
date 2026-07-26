import request from 'supertest';
import app from '../app.js';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should reject invalid registration data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'U',
          email: 'invalid-email',
          password: '123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Name must be at least 2 characters');
      expect(response.body.message).toContain('Invalid email address');
      expect(response.body.message).toContain('Password must be at least 6 characters');
    });
  });
});
