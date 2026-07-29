import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import imagekit from '../config/imagekit.js';
import AppError from '../errors/AppError.js';
import env from '../config/env.js';
import { generateVerificationToken, hashToken } from '../utils/verificationToken.js';
import { sendVerificationEmail } from './email.service.js';

/**
 * Validates and canonicalizes an email input from user-controlled data.
 *
 * Rejects non-string values (objects, arrays, MongoDB operators) BEFORE they
 * can reach a Mongoose query, preventing NoSQL injection. Normalizes the value
 * to match the User schema (lowercase, trimmed).
 */
const sanitizeEmail = (value) => {
  if (typeof value !== 'string') {
    throw new AppError('Invalid email address.', 400);
  }
  return value.trim().toLowerCase();
};

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export const authService = {
  async registerUser({ name, email: rawEmail, password }) {
    const email = sanitizeEmail(rawEmail);
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError('User already exists with this email.', 400);
    }

    const { rawToken, tokenHash, expires, sentAt } = generateVerificationToken();

    await User.create({
      name,
      email,
      password,
      emailVerified: false,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: expires,
      emailVerificationSentAt: sentAt,
    });

    await sendVerificationEmail(email, rawToken);

    return { email };
  },

  async loginUser({ email: rawEmail, password }) {
    const email = sanitizeEmail(rawEmail);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.emailVerified) {
      throw new AppError('Please verify your email before logging in.', 403, { emailVerified: false });
    }

    const token = generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },

  async verifyEmail(rawToken) {
    const tokenHash = hashToken(rawToken);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Verification link is invalid or has expired.', 400);
    }

    if (user.emailVerified) {
      throw new AppError('Email is already verified.', 400);
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationSentAt = undefined;
    await user.save();

    return { message: 'Email verified successfully. You can now log in.' };
  },

  async resendVerification(rawEmail) {
    const email = sanitizeEmail(rawEmail);
    const user = await User.findOne({ email });

    // Return success even if user not found (prevents email enumeration)
    if (!user) {
      return { message: 'If that email is registered, a verification link has been sent.' };
    }

    if (user.emailVerified) {
      throw new AppError('Email is already verified.', 400);
    }

    // Enforce 60-second cooldown using emailVerificationSentAt
    if (user.emailVerificationSentAt) {
      const elapsed = Date.now() - user.emailVerificationSentAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const remaining = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        throw new AppError(`Please wait ${remaining} seconds before requesting another email.`, 429, { retryAfter: remaining });
      }
    }

    const { rawToken, tokenHash, expires, sentAt } = generateVerificationToken();

    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationExpires = expires;
    user.emailVerificationSentAt = sentAt;
    await user.save();

    await sendVerificationEmail(email, rawToken);

    return { message: 'If that email is registered, a verification link has been sent.' };
  },

  async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  },

  async updateProfilePicture(userId, file) {
    if (!file) {
      throw new AppError('No file uploaded.', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const result = await imagekit.files.upload({
      file: file.buffer.toString('base64'),
      fileName: `avatar-${Date.now()}-${file.originalname}`,
      folder: '/avatars'
    });

    user.profilePicUrl = result.url;
    await user.save();

    return {
      profilePicUrl: user.profilePicUrl
    };
  }
};
