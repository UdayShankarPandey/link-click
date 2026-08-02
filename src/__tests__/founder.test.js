import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockCreate = jest.fn();
const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockSelect = jest.fn();
const mockCountDocuments = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    create: mockCreate,
    findOne: mockFindOne,
    findById: mockFindById,
    countDocuments: mockCountDocuments,
  },
}));

jest.unstable_mockModule('../models/Post.js', () => ({
  default: {
    countDocuments: jest.fn().mockResolvedValue(5),
  },
}));

jest.unstable_mockModule('../services/email.service.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.unstable_mockModule('../models/AuditLog.js', () => ({
  default: {
    create: jest.fn().mockResolvedValue({}),
    find: jest.fn(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn(() => ({
          sort: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([]),
          })),
        })),
      })),
    })),
  },
}));

const { default: app } = await import('../app.js');
const { authService } = await import('../services/auth.service.js');

describe('Founder Platform & Security Architecture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Registration Role Assignment', () => {
    it('should assign role = "user" when registering a standard email address', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockImplementation((data) => Promise.resolve({ _id: 'user-1', ...data }));

      await authService.registerUser({
        name: 'Standard User',
        email: 'user@example.com',
        password: 'Password123',
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          role: 'user',
        })
      );
    });

    it('should assign role = "founder" when registering with FOUNDER_EMAIL', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockImplementation((data) => Promise.resolve({ _id: 'founder-1', ...data }));

      const founderEmail = process.env.FOUNDER_EMAIL || 'udayshankarpandey.03@gmail.com';

      await authService.registerUser({
        name: 'Platform Founder',
        email: founderEmail,
        password: 'Password123',
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: founderEmail.toLowerCase(),
          role: 'founder',
        })
      );
    });
  });

  describe('2. Dashboard Middleware Protection (checkFounder)', () => {
    it('should block a non-founder user from accessing dashboard stats with 403 Forbidden', async () => {
      const normalUser = {
        _id: 'user-100',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        status: 'active',
      };

      mockFindById.mockReturnValue({
        select: jest.fn().mockResolvedValue(normalUser),
      });

      const token = jwt.sign({ id: normalUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('Founder privileges required');
    });

    it('should allow founder account to access dashboard stats with 200 OK', async () => {
      const founderUser = {
        _id: 'founder-100',
        name: 'Platform Founder',
        email: process.env.FOUNDER_EMAIL || 'udayshankarpandey.03@gmail.com',
        role: 'founder',
        status: 'active',
      };

      mockFindById.mockReturnValue({
        select: jest.fn().mockResolvedValue(founderUser),
      });

      mockCountDocuments.mockResolvedValue(10);

      const token = jwt.sign({ id: founderUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.platformHealth).toBe('operational');
    });
  });

  describe('3. Founder Immutability Safeguards', () => {
    it('should block attempts to suspend the Founder account with 403 Forbidden', async () => {
      const founderUser = {
        _id: 'founder-100',
        name: 'Platform Founder',
        email: process.env.FOUNDER_EMAIL || 'udayshankarpandey.03@gmail.com',
        role: 'founder',
        status: 'active',
        save: jest.fn().mockResolvedValue({}),
      };

      mockFindById.mockImplementation((id) => {
        const queryObj = Promise.resolve(founderUser);
        queryObj.select = jest.fn().mockResolvedValue(founderUser);
        return queryObj;
      });

      const token = jwt.sign({ id: founderUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .put('/api/dashboard/users/founder-100/suspend')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Malicious attempt' });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('Founder account cannot be suspended');
    });

    it('should block attempts to soft delete the Founder account with 403 Forbidden', async () => {
      const founderUser = {
        _id: 'founder-100',
        name: 'Platform Founder',
        email: process.env.FOUNDER_EMAIL || 'udayshankarpandey.03@gmail.com',
        role: 'founder',
        status: 'active',
        save: jest.fn().mockResolvedValue({}),
      };

      mockFindById.mockImplementation((id) => {
        const queryObj = Promise.resolve(founderUser);
        queryObj.select = jest.fn().mockResolvedValue(founderUser);
        return queryObj;
      });

      const token = jwt.sign({ id: founderUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .delete('/api/dashboard/users/founder-100/soft-delete')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('Founder account cannot be deleted');
    });

    it('should allow Founder to suspend a normal user account', async () => {
      const founderUser = {
        _id: 'founder-100',
        role: 'founder',
        status: 'active',
      };
      const normalUser = {
        _id: 'user-200',
        name: 'Normal User',
        role: 'user',
        status: 'active',
        save: jest.fn().mockResolvedValue({}),
      };

      mockFindById.mockImplementation((id) => {
        if (id === 'founder-100') {
          const queryObj = Promise.resolve(founderUser);
          queryObj.select = jest.fn().mockResolvedValue(founderUser);
          return queryObj;
        }
        return Promise.resolve(normalUser);
      });

      const token = jwt.sign({ id: founderUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .put('/api/dashboard/users/user-200/suspend')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Spamming' });

      expect(response.statusCode).toBe(200);
      expect(normalUser.status).toBe('suspended');
      expect(normalUser.save).toHaveBeenCalled();
    });
  });

  describe('4. Suspended and Soft-Deleted Lifecycle Restrictions', () => {
    it('should block suspended user from logging in or accessing protected routes', async () => {
      const suspendedUser = {
        _id: 'user-suspended',
        email: 'suspended@example.com',
        emailVerified: true,
        role: 'user',
        status: 'suspended',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockFindOne.mockResolvedValue(suspendedUser);

      await expect(
        authService.loginUser({ email: 'suspended@example.com', password: 'Password123' })
      ).rejects.toThrow('Account is suspended.');
    });

    it('should block soft-deleted user from logging in and anonymize display identity', async () => {
      const deletedUser = {
        _id: 'user-deleted',
        email: 'deleted@example.com',
        emailVerified: true,
        role: 'user',
        status: 'deleted',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockFindOne.mockResolvedValue(deletedUser);

      await expect(
        authService.loginUser({ email: 'deleted@example.com', password: 'Password123' })
      ).rejects.toThrow('Account has been deactivated.');
    });
  });
});
