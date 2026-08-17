import { Resend } from 'resend';
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
 * Sends via Brevo Transactional Email HTTP API (HTTPS port 443 — never blocked by cloud providers).
 * Requires BREVO_API_KEY with no IP restriction and a verified sender in Brevo.
 */
const tryBrevoAPI = async ({ to, subject, html, senderName, senderEmail }) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Brevo API ${res.status}: ${data?.message || JSON.stringify(data)}`);
  }

  logger.info(`[Email Brevo API] Sent to ${maskEmail(to)} (ID: ${data?.messageId})`);
  return data;
};

/**
 * Sends the email verification link to a newly registered user.
 *
 * Delivery priority:
 *   1. Brevo HTTP API  — HTTPS port 443, works from any cloud server (Render, Vercel, etc.)
 *   2. Resend API      — HTTPS fallback; sandbox only delivers to account-owner email
 */
export const sendVerificationEmail = async (to, rawToken) => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;
  const htmlContent = buildHtml(verificationUrl);
  const subject = 'Verify your Link Click email';
  const targetEmail = maskEmail(to);

  // Parse sender name and email from EMAIL_FROM (e.g. "Link Click <email@example.com>")
  const fromMatch = (env.EMAIL_FROM || '').match(/^(.*?)\s*<(.+?)>$/);
  const senderName = fromMatch?.[1]?.trim() || 'Link Click';
  const senderEmail = fromMatch?.[2]?.trim() || env.SMTP_USER || 'noreply@example.com';

  // ── Brevo HTTP API (primary — HTTPS, never blocked) ────────────────────────
  if (env.BREVO_API_KEY) {
    try {
      await tryBrevoAPI({ to, subject, html: htmlContent, senderName, senderEmail });
      return;
    } catch (error_) {
      logger.warn(`[Email Brevo API] Failed for ${targetEmail}: ${error_.message}`);
      if (!env.RESEND_API_KEY) {
        throw new Error(`Brevo API delivery failed: ${error_.message}`);
      }
      logger.warn('[Email Brevo API] Falling back to Resend API.');
    }
  }

  // ── Resend API (fallback — sandbox restricts delivery to account-owner email) ─
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

  throw new Error('Email delivery is not configured. Set BREVO_API_KEY or RESEND_API_KEY.');
};
