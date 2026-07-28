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

  describe('POST /api/auth/login', () => {
    it('should reject invalid login data', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: ''
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Invalid email address');
      expect(response.body.message).toContain('Password is required');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject requests without an authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        'Not authorized, no token provided.'
      );
    });
  });
});
