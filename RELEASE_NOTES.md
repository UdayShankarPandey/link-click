# Link Click — Release Notes
## Version 0.11.0 (Sprint 11)

**Release Date:** August 5, 2026  
**Sprint Name:** Sprint 11 — Official Branding, Progressive Web App (PWA) & Production Polish  
**Production URL:** [https://link-click-six.vercel.app](https://link-click-six.vercel.app)

---

## 🌟 Version 0.11.0 Highlights

Version 0.11.0 completes the official brand transformation and establishes full Progressive Web App (PWA) capabilities for **Link Click**. The application is now fully installable on desktop and mobile browsers, supports offline shell availability, includes intelligent network & media caching via Workbox, features a global React Error Boundary, and provides an end-to-end SEO package.

---

## ✨ Features & Enhancements

### 🎨 1. Official Brand Identity (Phase 1 & 1.5)
- **Logomark Integration**: Replaced placeholder `<Camera>` icon with the official 5-person multicolor community logomark (`src/assets/branding/logomark.svg` / `logomark.png`).
- **100% Background Transparency**: Keyed out white square canvas and background disc using exact pixel transparency preserving original shape curves, gradients, and anti-aliasing.
- **Centralized Brand Configuration**: Created `src/config/branding.js` as single source of truth for name, tagline, description, URLs, theme color (`#111113`), and versioning (`0.11.0`).
- **Complete Icon Set**: Deployed `favicon.svg`, `favicon-32x32.png`, `favicon-16x16.png`, `favicon.ico`, `apple-touch-icon.png` (180×180), `android-chrome-192x192.png`, `android-chrome-512x512.png`, and `og-image.png` (1200×630).

### 📱 2. Progressive Web App (PWA) Support (Phase 2)
- **Workbox Service Worker**: Integrated `vite-plugin-pwa` generating `dist/sw.js` and `dist/workbox-*.js` with 36 precached assets.
- **Custom Install Experience**: Implemented `PWAInstallPrompt.jsx` capturing `beforeinstallprompt`, suppressing native browser banners, and offering a persistent **14-day dismissal window** in `localStorage`.
- **Non-Disruptive Updates**: Implemented `PWAUpdateBanner.jsx` displaying a *"Reload to Update"* toast upon deployment without force-reloading active user sessions.
- **Branded Offline Fallback**: Implemented `Offline.jsx` page at `/offline` featuring connection auto-reconnect detection, retry trigger, and return home navigation.

### 🛡️ 3. Resilience & Error Boundaries (Phase 3)
- **Global React Error Boundary**: Implemented `ErrorBoundary.jsx` wrapping `<App />` in `main.jsx` to catch uncaught rendering exceptions and prevent white-screen crashes.
- **Dev-Only Debugging**: Displays a unique Error ID and reference message in development mode (`import.meta.env.DEV`), keeping production builds clean and secure.

### 🔍 4. SEO & Performance Polish (Phase 3)
- **Search Engine Crawlers**: Created `client/public/robots.txt` specifying route indexing rules and linking to `sitemap.xml`.
- **Sitemap**: Created `client/public/sitemap.xml` referencing indexable public pages.
- **Canonical URL**: Added `<link rel="canonical" href="https://link-click-six.vercel.app/" />` to `index.html`.
- **Schema.org Data**: Embedded `SocialNetworkingApplication` JSON-LD structured metadata in `index.html`.
- **CDN Preconnect**: Added `<link rel="preconnect" href="https://ik.imagekit.io" crossorigin />` to eliminate DNS/TLS latency for media assets.

---

## ⚡ Caching & Security Matrix

- **App Shell & Vite Bundles**: Workbox precached (`CacheFirst`).
- **Google Fonts**: `CacheFirst` (1-year expiration).
- **ImageKit CDN Media**: `CacheFirst` (30 days, LRU capped at 100 entries).
- **Static Media Assets**: `StaleWhileRevalidate` (30 days).
- **Public Feed APIs (`/api/posts`)**: `NetworkFirst` (3s network timeout).
- **Authentication Endpoints (`/api/auth/*`)**: `NetworkOnly` (**NEVER CACHED** for security).

---

## ♿ Accessibility Improvements (WCAG 2.1 AA)

- Added `aria-label="Link Click — Home"` to Navbar brand link.
- Added `role="dialog"` and focus trap handling to `PWAInstallPrompt.jsx`.
- Added `role="status"` and `aria-live="polite"` to `PWAUpdateBanner.jsx`.
- Added `role="alert"` and `aria-live="assertive"` to `ErrorBoundary.jsx`.
- Preserved keyboard navigation and amber focus rings (`focus-visible:ring-amber`) across all UI controls.

---

## ⚠️ Known Limitations

1. **iOS Safari Install Prompt**: iOS Safari does not support the `beforeinstallprompt` event. iOS users must use native Share → *Add to Home Screen*.
2. **Offline Scope**: Offline support covers app shell availability, cached media viewing, and an offline status page. Offline post creation and background sync are reserved for future sprints.

---

## 🚫 Breaking Changes

- **None.** All changes are backward compatible. Backend API contracts and database schemas remain untouched.

---

## 🔮 Next Sprint Preview (Sprint 12)

- Dynamic per-post Open Graph cards for shared post links.
- IndexedDB syncing for post draft resilience.
- Extended performance analytics and lighthouse monitoring.
