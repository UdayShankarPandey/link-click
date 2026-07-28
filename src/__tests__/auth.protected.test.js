import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockSelect = jest.fn();
const mockFindById = jest.fn(() => ({
  select: mockSelect,
}));

const mockGetCurrentUser = jest.fn();

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    findById: mockFindById,
  },
}));

jest.unstable_mockModule('../services/auth.service.js', () => ({
  authService: {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    getCurrentUser: mockGetCurrentUser,
    updateProfilePicture: jest.fn(),
  },
}));

const { default: app } = await import('../app.js');

describe('Protected Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/me', () => {
    it('should return the authenticated user profile', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const authenticatedUser = {
        _id: userId,
        name: 'Uday',
        email: 'uday@example.com',
        role: 'user',
      };

      mockSelect.mockResolvedValue(authenticatedUser);
      mockGetCurrentUser.mockResolvedValue(authenticatedUser);

      const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'User profile fetched successfully.'
      );
      expect(response.body.data).toEqual(authenticatedUser);

      expect(mockFindById).toHaveBeenCalledWith(userId);
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(mockGetCurrentUser).toHaveBeenCalledWith(userId);
    });
  });
});
