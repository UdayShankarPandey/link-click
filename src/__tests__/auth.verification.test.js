import { jest } from '@jest/globals';
import request from 'supertest';
import crypto from 'node:crypto';

// ── Mock setup ──────────────────────────────────────────────────────────────

const mockSelect = jest.fn();
const mockFindById = jest.fn(() => ({
  select: mockSelect,
}));
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    findById: mockFindById,
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

const mockSendVerificationEmail = jest.fn();
jest.unstable_mockModule('../services/email.service.js', () => ({
  sendVerificationEmail: mockSendVerificationEmail,
}));

const { default: app } = await import('../app.js');
const { hashToken, generateVerificationToken } = await import('../utils/verificationToken.js');

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Email Verification Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendVerificationEmail.mockResolvedValue(undefined);
  });

  // ── Registration ────────────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('should create unverified user and send verification email', async () => {
      mockFindOne.mockResolvedValue(null); // No existing user
      mockCreate.mockResolvedValue({
        _id: 'user-new',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        emailVerified: false,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toContain('check your email');
      // Must NOT set auth cookie
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        expect(cookies.join(';')).not.toContain('token=');
      }
      // Must call sendVerificationEmail
      expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mockSendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
      );
      // Must create user with emailVerified: false and hashed token
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerified: false,
          emailVerificationTokenHash: expect.any(String),
          emailVerificationExpires: expect.any(Date),
          emailVerificationSentAt: expect.any(Date),
        }),
      );
    });

    it('should store hashed token, not the raw token', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        _id: 'user-hash-test',
        email: 'hash@example.com',
        emailVerified: false,
      });

      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hash User',
          email: 'hash@example.com',
          password: 'Password123!',
        });

      const createArgs = mockCreate.mock.calls[0][0];
      const storedHash = createArgs.emailVerificationTokenHash;
      const rawTokenSentViaEmail = mockSendVerificationEmail.mock.calls[0][1];

      // The stored hash must be the SHA-256 of the raw token
      const expectedHash = crypto.createHash('sha256').update(rawTokenSentViaEmail).digest('hex');
      expect(storedHash).toBe(expectedHash);
    });
  });

  // ── Verify Email ────────────────────────────────────────────────────────

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const { rawToken, tokenHash } = generateVerificationToken();
      const mockUser = {
        emailVerified: false,
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: new Date(Date.now() + 86400000),
        emailVerificationSentAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: rawToken });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('verified successfully');
      expect(mockUser.emailVerified).toBe(true);
      expect(mockUser.emailVerificationTokenHash).toBeUndefined();
      expect(mockUser.emailVerificationExpires).toBeUndefined();
      expect(mockUser.emailVerificationSentAt).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      mockFindOne.mockResolvedValue(null); // No matching token

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token-value' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('invalid or has expired');
    });

    it('should reject when token is missing from request body', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('token is required');
    });

    it('should reject already-verified user', async () => {
      const { rawToken, tokenHash } = generateVerificationToken();
      const mockUser = {
        emailVerified: true,
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: new Date(Date.now() + 86400000),
        save: jest.fn(),
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: rawToken });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('already verified');
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should reject expired token (findOne returns null due to $gt check)', async () => {
      mockFindOne.mockResolvedValue(null); // Expired token won't match query

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'some-expired-token' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('invalid or has expired');
    });
  });

  // ── Resend Verification ─────────────────────────────────────────────────

  describe('POST /api/auth/resend-verification', () => {
    it('should send new verification email for unverified user', async () => {
      const mockUser = {
        email: 'unverified@example.com',
        emailVerified: false,
        emailVerificationSentAt: new Date(Date.now() - 120000), // 2 min ago (past cooldown)
        save: jest.fn().mockResolvedValue(true),
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'unverified@example.com' });

      expect(response.statusCode).toBe(200);
      expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mockUser.save).toHaveBeenCalled();
      // Token fields should be updated
      expect(mockUser.emailVerificationTokenHash).toBeDefined();
      expect(mockUser.emailVerificationExpires).toBeDefined();
      expect(mockUser.emailVerificationSentAt).toBeDefined();
    });

    it('should reject resend for already-verified user', async () => {
      const mockUser = {
        email: 'verified@example.com',
        emailVerified: true,
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'verified@example.com' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('already verified');
    });

    it('should return 200 for non-existent email (enumeration protection)', async () => {
      mockFindOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'nobody@example.com' });

      expect(response.statusCode).toBe(200);
      expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should enforce 60-second cooldown and return structured retryAfter metadata', async () => {
      const mockUser = {
        email: 'cooldown@example.com',
        emailVerified: false,
        emailVerificationSentAt: new Date(Date.now() - 10000), // 10 seconds ago
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'cooldown@example.com' });

      expect(response.statusCode).toBe(429);
      expect(response.body.message).toContain('wait');
      expect(response.body.retryAfter).toBeGreaterThan(0);
      expect(typeof response.body.retryAfter).toBe('number');
      expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should reject when email is missing from request body', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Email is required');
    });

    // ── NoSQL Injection Protection ──────────────────────────────────────

    it('should reject object-shaped email (NoSQL operator injection)', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: { $gt: '' } });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Invalid email');
      // Must NOT have queried the database
      expect(mockFindOne).not.toHaveBeenCalled();
      expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should reject array-shaped email input', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: ['attack@example.com'] });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Invalid email');
      expect(mockFindOne).not.toHaveBeenCalled();
    });

    it('should reject $ne operator injection', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: { $ne: null } });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Invalid email');
      expect(mockFindOne).not.toHaveBeenCalled();
    });

    it('should reject numeric email input', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 12345 });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Invalid email');
      expect(mockFindOne).not.toHaveBeenCalled();
    });

    it('should accept valid string email and preserve anti-enumeration response', async () => {
      mockFindOne.mockResolvedValue(null); // unknown user

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'unknown@example.com' });

      expect(response.statusCode).toBe(200);
      expect(mockFindOne).toHaveBeenCalledWith({ email: 'unknown@example.com' });
      expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  // ── Login with Verification Guard ───────────────────────────────────────

  describe('POST /api/auth/login (email verification guard)', () => {
    it('should reject login for unverified user with 403', async () => {
      const mockUser = {
        _id: 'user-unverified',
        email: 'unverified@example.com',
        emailVerified: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'password123',
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('verify your email');
      expect(response.body.emailVerified).toBe(false);
    });

    it('should allow login for verified user', async () => {
      const mockUser = {
        _id: 'user-verified',
        name: 'Verified User',
        email: 'verified@example.com',
        role: 'user',
        emailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'verified@example.com',
          password: 'password123',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Login successful.');
      // Should set auth cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'].join(';');
      expect(cookies).toContain('HttpOnly');
    });
  });

  // ── Verification Token Utility ──────────────────────────────────────────

  describe('Verification Token Utility', () => {
    it('should generate unique tokens on each call', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();

      expect(token1.rawToken).not.toBe(token2.rawToken);
      expect(token1.tokenHash).not.toBe(token2.tokenHash);
    });

    it('should produce consistent hashes for the same input', () => {
      const raw = 'test-token-value';
      expect(hashToken(raw)).toBe(hashToken(raw));
    });

    it('should produce 64-character hex raw tokens', () => {
      const { rawToken } = generateVerificationToken();
      expect(rawToken).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should set expiration 24 hours in the future', () => {
      const before = Date.now();
      const { expires } = generateVerificationToken();
      const after = Date.now();

      const expectedMin = before + 24 * 60 * 60 * 1000;
      const expectedMax = after + 24 * 60 * 60 * 1000;

      expect(expires.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(expires.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    it('should include sentAt timestamp', () => {
      const before = Date.now();
      const { sentAt } = generateVerificationToken();
      const after = Date.now();

      expect(sentAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(sentAt.getTime()).toBeLessThanOrEqual(after);
    });
  });
});
