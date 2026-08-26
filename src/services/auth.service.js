import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import imagekit from '../config/imagekit.js';
import AppError from '../errors/AppError.js';
import env from '../config/env.js';
import { generateVerificationToken, hashToken } from '../utils/verificationToken.js';
import { sendVerificationEmail } from './email.service.js';
import { logger } from '../utils/logger.js';

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
      if (userExists.emailVerified) {
        throw new AppError('User already exists with this email.', 400);
      }
      // If user exists but is unverified, remove stale attempt to allow fresh registration
      await User.deleteOne({ _id: userExists._id });
    }

    const { rawToken, tokenHash, expires, sentAt } = generateVerificationToken();

    const isFounder = Boolean(env.FOUNDER_EMAIL && email === env.FOUNDER_EMAIL?.trim().toLowerCase());
    const role = isFounder ? 'founder' : 'user';

    await User.create({
      name,
      email,
      password,
      role,
      emailVerified: false,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: expires,
      emailVerificationSentAt: sentAt,
    });

    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;

    // Fire-and-forget: respond to user immediately; email sends in background.
    sendVerificationEmail(email, rawToken).catch((err) => {
      logger.error(`[Auth Service] Verification email not delivered to ${email}: ${err.message}`);
      logger.info(`[Auth Fallback Link] Direct URL: ${verificationUrl}`);
    });

    return { email, verificationUrl };
  },

  async loginUser({ email: rawEmail, password }) {
    const email = sanitizeEmail(rawEmail);
    const user = await User.findOne({ email });
    if (!user || !(await user?.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user?.emailVerified) {
      throw new AppError('Please verify your email before logging in.', 403, { emailVerified: false });
    }

    if (user?.status === 'suspended') {
      throw new AppError('Account is suspended.', 403);
    }

    if (user?.status === 'deleted') {
      throw new AppError('Account has been deactivated.', 403);
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

    if (user?.emailVerified) {
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

    if (user?.emailVerified) {
      throw new AppError('Email is already verified.', 400);
    }

    // Enforce 60-second cooldown using emailVerificationSentAt
    if (user?.emailVerificationSentAt) {
      const elapsed = Date.now() - user.emailVerificationSentAt?.getTime();
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

    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;

    // Fire-and-forget: respond immediately, email sends in background.
    sendVerificationEmail(email, rawToken).catch((err) => {
      logger.error(`[Auth Service] Resend verification email not delivered to ${email}: ${err.message}`);
      logger.info(`[Auth Fallback Link] Direct URL: ${verificationUrl}`);
    });

    return {
      message: 'If that email is registered, a verification link has been sent.',
      verificationUrl,
    };
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
      file: file?.buffer,
      fileName: `avatar-${Date.now()}-${file?.originalname}`,
      folder: '/avatars'
    });

    user.profilePicUrl = result.url;
    
    try {
      await user.save();
    } catch (saveError) {
      try { await imagekit.files.deleteFile(result.fileId); }
      catch (ikError) { logger.error(`Failed to cleanup new ImageKit avatar on user save failure: ${ikError.message}`); }
      throw saveError;
    }

    return {
      profilePicUrl: user?.profilePicUrl
    };
  },

  async updateCoverPicture(userId, file) {
    if (!file) {
      throw new AppError('No file uploaded.', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const result = await imagekit.files.upload({
      file: file?.buffer,
      fileName: `cover-${Date.now()}-${file?.originalname}`,
      folder: '/covers'
    });

    user.coverPicUrl = result.url;
    
    try {
      await user.save();
    } catch (saveError) {
      try { await imagekit.files.deleteFile(result.fileId); }
      catch (ikError) { logger.error(`Failed to cleanup new ImageKit cover on user save failure: ${ikError.message}`); }
      throw saveError;
    }

    return {
      coverPicUrl: user?.coverPicUrl
    };
  },

  async removeCoverPicture(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    user.coverPicUrl = '';
    await user.save();

    return { message: 'Cover picture removed successfully.', coverPicUrl: '' };
  },

  async updateUserProfile(userId, { name, bio, socials, pinnedPost }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (name && typeof name === 'string') user.name = name.trim();
    if (bio !== undefined && typeof bio === 'string') user.bio = bio.trim();
    if (socials && typeof socials === 'object') {
      user.socials = {
        github: socials.github?.trim() || '',
        twitter: socials.twitter?.trim() || '',
        website: socials.website?.trim() || ''
      };
    }
    if (pinnedPost !== undefined) {
      user.pinnedPost = pinnedPost || null;
    }

    await user.save();
    return user;
  }
};
