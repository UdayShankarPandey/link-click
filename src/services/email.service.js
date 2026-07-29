import { Resend } from 'resend';
import env from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Sends the email verification link to a newly registered user.
 *
 * Requires RESEND_API_KEY in every environment. If the key is not
 * configured, throws immediately with a clear configuration error.
 *
 * Logs never contain email addresses, raw tokens, or verification URLs.
 */
export const sendVerificationEmail = async (to, rawToken) => {
  if (!env.RESEND_API_KEY) {
    throw new Error('Email delivery is not configured. Set the RESEND_API_KEY environment variable.');
  }

  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;
  const resend = new Resend(env.RESEND_API_KEY);

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify your Link Click email',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #111113; color: #F5F0E8; border-radius: 16px;">
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Welcome to Link Click</h1>
        <p style="font-size: 14px; color: #9A9A9E; margin: 0 0 24px;">Verify your email to activate your account.</p>
        <a href="${verificationUrl}" style="display: inline-block; background: #E8A838; color: #111113; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none;">Verify Email</a>
        <p style="font-size: 12px; color: #6A6A6E; margin: 24px 0 0;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });

  logger.info('[Email] Verification email sent');
};

