/**
 * Link Click — Centralized Branding Configuration
 *
 * Single source of truth for all brand identity values.
 * Import from this file wherever branding strings are needed
 * to avoid scattered hardcoded duplicates.
 *
 * @module branding
 */

export const BRAND = {
  /** Full application name */
  name: 'Link Click',

  /** Short name for OS/app launcher contexts (≤12 chars) */
  shortName: 'Link Click',

  /** Primary brand tagline */
  tagline: 'Connect. Share. Discover. Belong.',

  /** Meta description used in HTML head and OG tags */
  description:
    'Link Click — Share visual stories, engage with your community through image-first posts, likes, and conversations.',

  /** Production frontend URL */
  url: 'https://link-click-six.vercel.app',

  /** Absolute URL for Open Graph / Twitter Card image (1200×630) */
  ogImageUrl: 'https://link-click-six.vercel.app/og-image.png',

  /** Theme color — matches CSS --color-canvas */
  themeColor: '#111113',

  /** Background color for PWA splash screens — matches CSS --color-canvas */
  backgroundColor: '#111113',

  /** Primary brand accent color */
  accentColor: '#E8A838',

  /** Application release version */
  version: '0.11.0',

  /** Service worker cache version tag */
  cacheVersion: 'v0.11.0',
};

export default BRAND;
