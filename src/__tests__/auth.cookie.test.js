import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockSelect = jest.fn();
const mockFindById = jest.fn(() => ({
  select: mockSelect,
}));

const mockRegisterUser = jest.fn();
const mockLoginUser = jest.fn();
const mockGetCurrentUser = jest.fn();

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    findById: mockFindById,
  },
}));

jest.unstable_mockModule('../services/auth.service.js', () => ({
  authService: {
    registerUser: mockRegisterUser,
    loginUser: mockLoginUser,
    getCurrentUser: mockGetCurrentUser,
    updateProfilePicture: jest.fn(),
  },
}));

const { default: app } = await import('../app.js');
const { getCookieOptions, parseExpiresInMs } = await import('../utils/cookie.js');

describe('HttpOnly Cookie Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register cookie handling', () => {
    it('should set HttpOnly authentication cookie on successful registration', async () => {
      const serviceResult = {
        token: 'test-register-jwt-token',
        user: {
          id: 'user-123',
          name: 'New User',
          email: 'newuser@domain.com',
          role: 'user',
        },
      };

      mockRegisterUser.mockResolvedValue(serviceResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@domain.com',
          password: 'securePassword123',
        });

      expect(response.statusCode).toBe(201);
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'].join(';');
      expect(cookies).toContain('token=test-register-jwt-token');
      expect(cookies).toContain('HttpOnly');
    });
  });

  describe('POST /api/auth/login cookie handling', () => {
    it('should set HttpOnly authentication cookie on successful login', async () => {
      const serviceResult = {
        token: 'test-login-jwt-token',
        user: {
          id: 'user-456',
          name: 'Login User',
          email: 'loginuser@domain.com',
          role: 'user',
        },
      };

      mockLoginUser.mockResolvedValue(serviceResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@domain.com',
          password: 'securePassword123',
        });

      expect(response.statusCode).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'].join(';');
      expect(cookies).toContain('token=test-login-jwt-token');
      expect(cookies).toContain('HttpOnly');
    });
  });

  describe('POST /api/auth/logout cookie handling', () => {
    it('should clear token cookie on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Logged out successfully.');
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'].join(';');
      expect(cookies).toContain('token=;');
    });
  });

  describe('GET /api/auth/me cookie authentication', () => {
    it('should succeed when valid token cookie is provided', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const authenticatedUser = {
        _id: userId,
        name: 'Cookie User',
        email: 'cookieuser@domain.com',
        role: 'user',
      };

      mockSelect.mockResolvedValue(authenticatedUser);
      mockGetCurrentUser.mockResolvedValue(authenticatedUser);

      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`]);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(authenticatedUser);
    });

    it('should reject requests with missing cookie', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Not authorized, no token provided.');
    });

    it('should reject requests with malformed/invalid JWT cookie', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=invalid-malformed-jwt']);

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Not authorized, token failed.');
    });
  });

  describe('Cookie Expiration Parsing & Validation', () => {
    it('should correctly parse valid duration strings', () => {
      expect(parseExpiresInMs('30d')).toBe(30 * 24 * 60 * 60 * 1000);
      expect(parseExpiresInMs('24h')).toBe(24 * 60 * 60 * 1000);
      expect(parseExpiresInMs('60m')).toBe(60 * 60 * 1000);
      expect(parseExpiresInMs('3600s')).toBe(3600 * 1000);
    });

    it('should throw Error for invalid or malformed duration strings', () => {
      expect(() => parseExpiresInMs('invalid')).toThrow('Invalid JWT_EXPIRES_IN format');
      expect(() => parseExpiresInMs('30x')).toThrow('Invalid JWT_EXPIRES_IN format');
      expect(() => parseExpiresInMs('')).toThrow('Invalid JWT_EXPIRES_IN format');
    });
  });

  describe('Cookie Configuration Helper', () => {
    it('should configure development cookie options (sameSite lax, secure false)', () => {
      const options = getCookieOptions();
      expect(options.httpOnly).toBe(true);
      expect(options.path).toBe('/');
      expect(options.sameSite).toBe('lax');
      expect(options.secure).toBe(false);
    });
  });
});
