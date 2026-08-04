# Future Improvements & Backlog — Post Sprint 9 & 10

This document outlines potential enhancements and long-term roadmap items identified during Sprint 9 and Sprint 10 planning and execution.

---

## 1. Social Experience Enhancements

- **Direct Member Messaging**: Lightweight private messaging / DMs between linked members.
- **Activity Stream / Notifications Feed**: In-app notifications panel for post likes, comments, and links.
- **Media Lightbox Enhancements**: Expanded full-screen viewer for post images and cover banners with full EXIF data overlays.

---

## 2. Founder Platform & Governance

- **Custom Domain & Platform Branding Settings**: Enable Founder to configure custom platform title, slogan, and metadata directly from the Dashboard Settings tab.
- **Audit Log Filtering & Export**: Support filtering security audit log events by actor, target, date range, or exporting to CSV.
- **Broadcast System Announcements**: Ability for Founder to pin a platform-wide header alert banner for maintenance or feature updates.

---

## 3. Technical & Infrastructure Optimizations

- **WebP Image Compression**: Automatically convert uploaded cover and profile images to WebP format on the backend before sending to ImageKit.
- **Redis Caching for Feed & Hovercards**: Cache author hovercard data and trending creator feeds in Redis to minimize database lookups.
- **Service Worker / PWA Support**: Enable offline caching of viewed feed items and progressive web app installability.
- **Database Migration (Legacy Likes to Unified Reactions)**: After sufficient production usage, migrate all legacy `Post.likes` documents into the unified `reactions` model. Remove `likes` field, compatibility hook, and legacy compatibility queries to use `Post.reactions` as the single canonical engagement model.

---

## 4. Sprint 10 Postponed Items & Roadmap Backlog

- **Global Search System (`Search.jsx`)**: Comprehensive full-text search across posts, creators, hashtags, and polls (postponed until social graph reaches higher volume).
- **GIF Integration**: Native Giphy/Tenor GIF search and inline embedding in post creation and comment replies.
- **Backend Draft Auto-Saving**: Sync draft posts to MongoDB backend for cross-device draft access (currently handled via client-side `localStorage`).
- **Multi-Level Comment Threads**: Extend 1-level nested comment replies into multi-level tree threading with collapse controls.
- **Push & Web Notification Infrastructure**: Real-time push notifications for post reactions, poll expiration alerts, and comment replies.

---

## 5. SonarQube Accepted Technical Debt & Refactoring Roadmap

- **Rich Text Editor Modernization (`PostEditor.jsx`)**: Replace deprecated `document.execCommand()` formatting calls with a modern headless editor framework (e.g., Tiptap or Slate.js) for enhanced cross-browser rich text editing capabilities.
- **Cryptographic Shuffling (`user.controller.js`)**: Upgrade `Math.random()` array sorting in Suggested Users (`nonFounders.sort(() => Math.random() - 0.5)`) to Fisher-Yates shuffle utilizing Node.js `crypto.getRandomValues()` or `crypto.randomInt()`.
- **API Gateway Payload Protection (`post.routes.js` & `upload.routes.js`)**: Supplement the intentional 50 MB rich media upload limit with reverse-proxy payload streaming validation (NGINX `client_max_body_size 50m`) and `express-rate-limit` middleware on file upload endpoints.
