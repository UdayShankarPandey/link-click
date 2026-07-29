import crypto from 'node:crypto';

const TOKEN_BYTES = 32;
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Produces the SHA-256 hex digest of a raw token string.
 * Used both when generating a new token (to store the hash)
 * and when verifying an incoming token (to compare against the stored hash).
 */
export const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

/**
 * Generates a cryptographically secure email verification token.
 *
 * Returns:
 *   rawToken  — 64-char hex string sent to the user's email (never stored)
 *   tokenHash — SHA-256 of rawToken (stored in User document)
 *   expires   — Date when the token becomes invalid (24 hours)
 *   sentAt    — Date when the token was generated (used for resend cooldown)
 */
export const generateVerificationToken = () => {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const tokenHash = hashToken(rawToken);
  const now = new Date();

  return {
    rawToken,
    tokenHash,
    expires: new Date(now.getTime() + TOKEN_EXPIRY_MS),
    sentAt: now,
  };
};
