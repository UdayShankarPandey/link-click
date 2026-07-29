import { jest } from '@jest/globals';
import request from 'supertest';
import AppError from '../errors/AppError.js';

const mockRegisterUser = jest.fn();
const mockLoginUser = jest.fn();

jest.unstable_mockModule('../services/auth.service.js', () => ({
  authService: {
    registerUser: mockRegisterUser,
    loginUser: mockLoginUser,
    getCurrentUser: jest.fn(),
    updateProfilePicture: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
  },
}));

const { default: app } = await import('../app.js');

describe('Auth API with mocked service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a user successfully (no session established)', async () => {
      const serviceResult = { email: 'uday@example.com' };

      mockRegisterUser.mockResolvedValue(serviceResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Uday',
          email: 'uday@example.com',
          password: 'secure123',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('check your email');
      expect(response.body.data).toEqual(serviceResult);

      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: 'Uday',
        email: 'uday@example.com',
        password: 'secure123',
      });
    });

    it('should return 400 when the user already exists', async () => {
      mockRegisterUser.mockRejectedValue(
        new AppError('User already exists with this email.', 400)
      );

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Uday',
          email: 'uday@example.com',
          password: 'secure123',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'User already exists with this email.'
      );

      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: 'Uday',
        email: 'uday@example.com',
        password: 'secure123',
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      const serviceResult = {
        token: 'test-jwt-token',
        user: {
          id: 'user-123',
          name: 'Uday',
          email: 'uday@example.com',
          role: 'user',
        },
      };

      mockLoginUser.mockResolvedValue(serviceResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'uday@example.com',
          password: 'secure123',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful.');
      expect(response.body.data).toEqual(serviceResult);

      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'uday@example.com',
        password: 'secure123',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      mockLoginUser.mockRejectedValue(
        new AppError('Invalid email or password.', 401)
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'uday@example.com',
          password: 'wrongpassword',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        'Invalid email or password.'
      );

      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'uday@example.com',
        password: 'wrongpassword',
      });
    });
  });
});
