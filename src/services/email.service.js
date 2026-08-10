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

const buildHtml = (verificationUrl) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #111113; color: #F5F0E8; border-radius: 16px;">
    <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Welcome to Link Click</h1>
    <p style="font-size: 14px; color: #9A9A9E; margin: 0 0 24px;">Verify your email to activate your account.</p>
    <a href="${verificationUrl}" style="display: inline-block; background: #E8A838; color: #111113; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none;">Verify Email</a>
    <p style="font-size: 12px; color: #6A6A6E; margin: 24px 0 0;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
  </div>
`;

/**
 * Try sending via a specific SMTP configuration.
 * Returns true on success, throws on failure.
 */
const trySMTP = async ({ host, port, secure, user, pass, from, to, subject, html, label }) => {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      // Accept self-signed certs and don't fail on certificate errors
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({ from, to, subject, html });
  logger.info(`[Email SMTP:${label}] Sent to ${maskEmail(to)} (MessageId: ${info.messageId})`);
  return info;
};

/**
 * Sends the email verification link to a newly registered user.
 *
 * Strategy (tries each in order, stops on first success):
 *   1. Gmail SMTP port 587  — STARTTLS (works on most cloud platforms)
 *   2. Gmail SMTP port 465  — SSL      (works locally, may be blocked on Render)
 *   3. Resend API           — HTTPS    (always works, but sandbox restricts recipient to account owner)
 */
export const sendVerificationEmail = async (to, rawToken) => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;
  const htmlContent = buildHtml(verificationUrl);
  const subject = 'Verify your Link Click email';
  const targetEmail = maskEmail(to);

  if (env.SMTP_USER && env.SMTP_PASS) {
    const smtpUserLower = env.SMTP_USER.toLowerCase();
    const emailFromLower = (env.EMAIL_FROM || '').toLowerCase();
    const isEmailFromGmailAccount =
      emailFromLower.includes(smtpUserLower) && !emailFromLower.includes('@resend.dev');
    const from = isEmailFromGmailAccount
      ? env.EMAIL_FROM
      : `Link Click <${env.SMTP_USER}>`;

    const smtpBase = {
      host: env.SMTP_HOST || 'smtp.gmail.com',
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from,
      to,
      subject,
      html: htmlContent,
    };

    // ── Attempt 1: Port 587 STARTTLS (preferred on cloud — Render allows this) ─
    try {
      await trySMTP({ ...smtpBase, port: 587, secure: false, label: '587/STARTTLS' });
      return;
    } catch (error_) {
      logger.warn(`[Email SMTP] Port 587 failed for ${targetEmail}: ${error_.message}`);
    }

    // ── Attempt 2: Port 465 SSL (works locally, may be blocked by cloud) ───────
    try {
      await trySMTP({ ...smtpBase, port: 465, secure: true, label: '465/SSL' });
      return;
    } catch (error_) {
      logger.warn(`[Email SMTP] Port 465 failed for ${targetEmail}: ${error_.message}`);
      if (!env.RESEND_API_KEY) {
        throw new Error(`SMTP delivery failed on both port 587 and 465: ${error_.message}`);
      }
      logger.warn('[Email SMTP] Falling back to Resend API.');
    }
  }

  // ── Attempt 3: Resend API (HTTPS — always reachable, sandbox restrictions apply) ─
  if (env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      logger.error(
        `[Email Resend] API error sending to ${targetEmail}: ${error.message || JSON.stringify(error)}`
      );
      throw new Error(error.message || 'Email delivery failed via Resend');
    }

    logger.info(`[Email Resend] Sent to ${targetEmail} (ID: ${data?.id})`);
    return;
  }

  throw new Error('Email delivery is not configured. Set SMTP_USER & SMTP_PASS or RESEND_API_KEY.');
};
