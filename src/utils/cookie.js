import env from '../config/env.js';

/**
 * Parses JWT expiration string (e.g., '30d', '1d', '24h', '3600s') into milliseconds.
 * Throws an Error if the format is invalid or unparseable.
 */
export const parseExpiresInMs = (expiresIn = '30d') => {
  const match = String(expiresIn).match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(`Invalid JWT_EXPIRES_IN format: "${expiresIn}". Must be a number followed by d, h, m, or s.`);
  }
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return num * 1000;
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'd': return num * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: "${unit}"`);
  }
};

/**
 * Centralized cookie security configuration.
 * Development: httpOnly, secure=false, sameSite='lax'
 * Production:  httpOnly, secure=true,  sameSite='none' (required for cross-site *.azurewebsites.net)
 */
export const getCookieOptions = () => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: parseExpiresInMs(env.JWT_EXPIRES_IN),
    path: '/',
  };
};

/**
 * Sets the HttpOnly authentication cookie on the response.
 */
export const setAuthCookie = (res, token) => {
  res.cookie('token', token, getCookieOptions());
};

/**
 * Clears the authentication cookie on the response.
 */
export const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    ...getCookieOptions(),
    maxAge: 0,
  });
};
