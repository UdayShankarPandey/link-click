import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import env from '../config/env.js';
import { logger } from '../utils/logger.js';

const maskEmail = (email) => {
  if (typeof email !== 'string' || !email.includes('@')) return '[sanitized-email]';
  const clean = email.replace(/[\r\n]/g, '');
  const [local, domain] = clean.split('@');
  if (local.length <= 2) return `*@${domain}`;
  return `${local[0]}***${local.at(-1)}@${domain}`;
};

/**
 * Sends the email verification link to a newly registered user.
 * Supports SMTP (e.g. Gmail App Password) for 100% unrestricted recipient delivery,
 * and Resend API.
 */
export const sendVerificationEmail = async (to, rawToken) => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #111113; color: #F5F0E8; border-radius: 16px;">
      <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Welcome to Link Click</h1>
      <p style="font-size: 14px; color: #9A9A9E; margin: 0 0 24px;">Verify your email to activate your account.</p>
      <a href="${verificationUrl}" style="display: inline-block; background: #E8A838; color: #111113; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none;">Verify Email</a>
      <p style="font-size: 12px; color: #6A6A6E; margin: 24px 0 0;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  const targetEmail = maskEmail(to);

  // Option 1: SMTP / Gmail App Password (delivers to 100% of recipient email addresses without restrictions)
  if (env.SMTP_USER && env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: env.SMTP_HOST ? undefined : 'gmail',
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(env.SMTP_PORT) || 587,
        secure: env.SMTP_PORT === '465',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      const sender = env.EMAIL_FROM?.includes('@resend.dev')
        ? `Link Click <${env.SMTP_USER}>`
        : env.EMAIL_FROM;

      const info = await transporter.sendMail({
        from: sender,
        to,
        subject: 'Verify your Link Click email',
        html: htmlContent,
      });

      logger.info(`[Email SMTP] Verification email sent successfully to ${targetEmail} (MessageId: ${info.messageId})`);
      return;
    } catch (err) {
      logger.error(`[Email SMTP Error] Failed to send email via SMTP to ${targetEmail}: ${err.message}`);
      if (!env.RESEND_API_KEY) throw err;
    }
  }

  // Option 2: Resend API
  if (env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Verify your Link Click email',
      html: htmlContent,
    });

    if (error) {
      logger.error(`[Email Error] Resend API error sending to ${targetEmail}: ${error.message || JSON.stringify(error)}`);
      throw new Error(error.message || 'Email delivery failed via Resend');
    }

    logger.info(`[Email Resend] Verification email sent successfully to ${targetEmail} (ID: ${data?.id})`);
    return;
  }

  throw new Error('Email delivery is not configured. Set SMTP_USER & SMTP_PASS or RESEND_API_KEY.');
};

