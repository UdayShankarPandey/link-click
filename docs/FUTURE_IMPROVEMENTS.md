# Future Improvements & Backlog — Post Sprint 9

This document outlines potential enhancements and long-term roadmap items identified during Sprint 9 planning and execution.

---

## 1. Social Experience Enhancements

- **Direct Member Messaging**: Lightweight private messaging / DMs between linked members.
- **Activity Stream / Notifications Feed**: In-app notifications panel for post likes, comments, and links.
- **Rich Post Formatting**: Support for lightweight Markdown formatting in post content.
- **Media Lightbox**: Expanded full-screen viewer for post images and cover banners.

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
