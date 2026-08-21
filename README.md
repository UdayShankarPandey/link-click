# Link Click — Modern Full-Stack Social Platform

**Link Click** is a modern, full-stack social media application built with Node.js, Express, MongoDB, React 18, Vite, and Tailwind CSS v4. Designed around a signature **"Lightbox" aesthetics design system** with warm amber accents, glassmorphism, and smooth micro-animations, Link Click offers a rich social experience with posts, media carousel lightbox, interactive polls, rich text editing, unified emoji reactions, nested comment replies, user bookmarks, user linking (follow system), email verification, community discovery feeds, a dedicated single-Founder platform, and an installable Progressive Web App (PWA) experience.

---

## 🌐 Live Production Deployment

- **Frontend Application (Vercel)**: [https://link-click-six.vercel.app](https://link-click-six.vercel.app)
- **Backend API Service (Render)**: [https://link-click-api.onrender.com](https://link-click-api.onrender.com)
- **Interactive Swagger API Docs**: [https://link-click-api.onrender.com/api/docs](https://link-click-api.onrender.com/api/docs)

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ Project Architecture & Directory Structure](#️-project-architecture--directory-structure)
- [🛠️ Technology Stack](#️-technology-stack)
- [📋 Environment Variables](#-environment-variables)
- [🚀 Quick Start & Installation Guide](#-quick-start--installation-guide)
- [🔌 API Routes & Endpoints](#-api-routes--endpoints)
- [🎨 Design System Specification](#-design-system-specification)
- [🐳 Docker & Deployment Architecture](#-docker--deployment-architecture)
- [🏆 Engineering Sprint Reports & Project Evolution](#-engineering-sprint-reports--project-evolution)
  - [Sprint 1 — Project Foundation & Initial Setup](#sprint-1--project-foundation--initial-setup)
  - [Sprint 2 — Authentication & User Management](#sprint-2--authentication--user-management)
  - [Sprint 3 — Core Posting System](#sprint-3--core-posting-system)
  - [Sprint 4 — Comments & User Interaction](#sprint-4--comments--user-interaction)
  - [Sprint 5 — Media Upload & Content Management](#sprint-5--media-upload--content-management)
  - [Sprint 6 — Deployment, CI/CD & DevOps](#sprint-6--deployment-cicd--devops)
  - [Sprint 7 — Email Verification & Security Hardening](#sprint-7--email-verification--security-hardening)
  - [Sprint 8 — Branding & UI Polish](#sprint-8--branding--ui-polish)
  - [Sprint 9 — Social Experience & Founder Platform](#sprint-9--social-experience--founder-platform)
  - [Sprint 10 — Community Discovery & Rich Social Engagement](#sprint-10--community-discovery--rich-social-engagement)
  - [Sprint 11 — Official Branding, Progressive Web App & Production Polish](#sprint-11--official-branding-progressive-web-app--production-polish)
- [📐 Sprint 11 Implementation & Architectural Specification](#-sprint-11-implementation--architectural-specification)
- [📐 Sprint 10 Implementation & Architectural Specification](#-sprint-10-implementation--architectural-specification)
- [📋 Pre-Release Checklist & Quality Gates](#-pre-release-checklist--quality-gates)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [🛠️ Operational Scripts](#️-operational-scripts)
- [⚡ Client Engine & Vite Setup](#-client-engine--vite-setup)
- [🤝 Contributing & License](#-contributing--license)

---

## ✨ Key Features

### 📱 Progressive Web App (PWA) & Offline Shell
- **Full Installability**: Desktop and mobile install support via `site.webmanifest` and custom `PWAInstallPrompt.jsx`.
- **Intelligent Workbox Caching**: Service worker (`dist/sw.js`) precaching 36 static assets with runtime strategies (`CacheFirst` for fonts/media, `NetworkFirst` for public feeds, `NetworkOnly` for security-sensitive auth routes).
- **Custom Install Experience**: Captures native `beforeinstallprompt` event with a **14-day persistent dismissal window** stored in `localStorage`.
- **Non-Disruptive Updates**: `PWAUpdateBanner.jsx` displays a *"Reload to Update"* toast without interrupting active user sessions.
- **Branded Offline Fallback**: Dedicated `/offline` route (`Offline.jsx`) featuring auto-reconnect detection, manual retry trigger, and return home navigation.

### 🎨 Official Branding & Lightbox Aesthetics
- **Official Brand Identity**: Centralized configuration (`src/config/branding.js`) and 5-person multicolor community vortex logomark with 100% transparent pixel keying.
- **Complete Favicon & Icon Set**: `favicon.svg`, `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` (180×180), `android-chrome-192x192.png`, `android-chrome-512x512.png`, and `og-image.png` (1200×630).
- **Lightbox Aesthetic**: Custom design language with high contrast dark backgrounds (`#111113` canvas, `#1a1a1f` surface), warm amber glows (`#E8A838`), glassmorphism, and sleek micro-interactions.
- **Interactive Social Feed**: Real-time media feeds supporting `Latest` (newest first), `Trending` (7-day decay algorithm), and `Popular` (highest reactions) filters with skeleton loaders.

### ✍️ Rich Content Creation & Profiles
- **Rich Text Editor**: `PostEditor.jsx` with strict `DOMPurify` HTML sanitization (bold `<b>`, italic `<i>`, hyperlinks `<a>` with `target="_blank"` and `rel="noopener noreferrer"`). Capped at 5,000 characters.
- **Image Lightbox & Zoom**: `ImageCarousel.jsx` multi-image uploads (1 to 4 images) with desktop drag/drop and mobile reordering, touch swipe, keyboard navigation (`←`, `→`, `Escape`), backdrop close, and click/double-tap 1x/2x zoom. Serves ImageKit responsive variants (`w-800, q-80, f-auto`).
- **Interactive Polls**: `PollCard.jsx` 2–6 option polls with expiry presets (`1 day`, `3 days`, `7 days`, `30 days`, `No expiry`), single-vote enforcement, real-time percentage bars, and read-only expired states.
- **Draft Auto-Saving**: Automatically saves post drafts to `localStorage` key `link_click_post_draft` every 20s. Features a restore/discard banner and automatic post-publish cleanup.
- **Rich Profiles**: User profile headers with aspect 3:1 cover image banner, avatar upload, bio (max 280 chars), GitHub/Twitter/Portfolio social links, profile completion meter (`ProfileCompletionBar.jsx`), pinned post (`📌 Pinned`), and tabbed views for `My Posts`, `Liked Posts`, and `Saved Posts`.
- **"Linking" Network**: Follower system allowing users to "Link" with each other, track mutual connections, and inspect author cards via hover previews (`AuthorHovercard.jsx`).

### 💬 Social Engagement & Discovery
- **Unified Reactions System**: 5-emoji reaction set (❤️, 👍, 😂, 😮, 😢). Single active reaction per user per post. Selecting another emoji replaces previous reaction; selecting same emoji removes it. ❤️ syncs to `likes` array for legacy API compatibility.
- **Zero-Overflow Action Bar (`PostActions.jsx`)**: Clean icon-only action bar (`[ ❤️ 1 ] [ 💬 0 ] [ 🔖 ] [ 🔗 ]`) with hover tooltips ensuring buttons never overflow or clip across any screen width or grid container.
- **Bookmark System**: `POST /api/posts/:id/bookmark` toggles post saved state. `GET /api/posts/bookmarked` populates "Saved Posts" tab in Profile ordered newest-first. Deleted posts are automatically purged via `User.updateMany({}, { $pull: { bookmarks: postId } })`.
- **Nested Comment Replies**: 1-level nested comment replies (`parentCommentId`), ordered oldest-first, collapsed after 3 replies with a "Show X more replies" trigger button.
- **Comment Editing & Deletion**: Inline comment editing with `(edited)` indicator; comment deletion requires `ConfirmDialog.jsx` modal confirmation.
- **Share Action**: Native `navigator.share()` API with fallback `navigator.clipboard.writeText()` + `"✓ Link copied"` toast.
- **Hashtags**: `#[\w_]+` regex normalized to lowercase (max 30 chars) filtering feeds dynamically.
- **View Counter**: `IntersectionObserver` counts non-author views after 50% visibility for 2.5s continuously, deduplicated per session via `sessionStorage`.

### 🛡️ Resilience & SEO
- **Global Error Boundary**: `ErrorBoundary.jsx` wraps `<App />` in `main.jsx` to catch uncaught rendering exceptions, providing branded fallback UI and dev-only Error ID debugging (`crypto.randomUUID()`).
- **Complete SEO Suite**: Includes `robots.txt`, `sitemap.xml`, `<link rel="canonical">`, Open Graph cards, Twitter Cards, ImageKit preconnect hints, and Schema.org `SocialNetworkingApplication` JSON-LD structured data.

### 🔐 Security & Authentication
- **Secure Auth Pipeline**: JWT-based session security with support for HttpOnly cookies and `Authorization: Bearer` headers.
- **Strong Password Enforcement**: Zod backend schema (`auth.validator.js`) enforcing 8+ characters, uppercase, lowercase, numbers, and special characters, complete with a live real-time requirement checklist (`Register.jsx`).
- **Show/Hide Password Visibility Toggles**: Interactive `Eye` / `EyeOff` visibility controls on Login & Register forms.
- **Drift-Free Resend Verification Timer**: Timestamp-based (`Date.now()`) countdown timer persisting across page refreshes.
- **Dual Email Engine**: Supports both Nodemailer SMTP (Gmail App Passwords for unrestricted 100% recipient delivery) and Resend API (`/verify-email`).
- **Role-Based Access Control (RBAC)**: Role hierarchy (`user`, `founder`) protecting administrative operations.
- **Hardened Security Middleware**:
  - `helmet`: Secure HTTP headers protection.
  - `express-rate-limit`: Global rate limiting (100 reqs / 15 min) and stricter auth rate limiting (10 reqs / 15 min).
  - `mongoSanitize`: Prevention against NoSQL query injection payloads (`$gt`, `$ne`).
  - `cors`: Configured origin control with credential pass-through and Vercel preview domain wildcards.
  - `requestIdMiddleware`: Assigns unique `UUIDv4` request IDs attached to Morgan HTTP logs for end-to-end audit tracing.

### 👑 Single-Founder Platform & Governance
- **Founder Dashboard**: High-level platform statistics (total members, active accounts, post counts, system health).
- **User Governance**: Multi-select batch actions, user role management, account suspension/activation, and verified email filtering (`emailVerified: true`).
- **Immutability Safeguards**: Core founder account matching `FOUNDER_EMAIL` cannot be edited, suspended, or deleted by any administrative operation.
- **System Audit Logs**: Log of administrative actions saved to `AuditLog` collection.

---

## 🏗️ Project Architecture & Directory Structure

```text
pep-project/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml             # Backend CI testing & security audit pipeline
│       └── main_link-click-frontend.yml # Frontend Vite build & Azure Web App deployment
├── client/                            # Frontend Single Page Application (React 18 + Vite)
│   ├── public/                        # Static web assets, icons & webmanifest
│   │   ├── android-chrome-*.png       # PWA android icons
│   │   ├── apple-touch-icon.png       # iOS home screen icon
│   │   ├── favicon.svg / .ico         # Browser tab icons
│   │   ├── og-image.png               # Open Graph preview card
│   │   ├── robots.txt                 # Search crawler rules
│   │   ├── site.webmanifest           # PWA web app manifest
│   │   └── sitemap.xml                # Search index sitemap
│   ├── src/
│   │   ├── assets/                    # Brand identity assets
│   │   │   └── branding/
│   │   │       └── logomark.png       # Official transparent community logomark
│   │   ├── components/                # Modular UI components
│   │   │   ├── AdminRoute.jsx         # Guard component for admin routes
│   │   │   ├── AuthorHovercard.jsx    # User hovercard preview popup
│   │   │   ├── CommentSection.jsx     # Post comments & 1-level nested replies interface
│   │   │   ├── ConfirmDialog.jsx      # Modal confirmation dialog
│   │   │   ├── EmptyState.jsx         # Reusable empty content placeholder presets
│   │   │   ├── ErrorBoundary.jsx      # Global React Error Boundary with dev-only Error ID
│   │   │   ├── FounderBadge.jsx       # Crown badge for founder user role
│   │   │   ├── FounderRoute.jsx       # Guard component for founder-only routes
│   │   │   ├── ImageCarousel.jsx      # Multi-image slider with lightbox & 1x/2x zoom
│   │   │   ├── Navbar.jsx             # Top navigation bar with official logomark & menu
│   │   │   ├── Pagination.jsx         # Accessible pagination control
│   │   │   ├── PollCard.jsx           # Interactive poll card with expiry handling
│   │   │   ├── PostActions.jsx        # Shared action bar for reactions, bookmarks & share
│   │   │   ├── PostCard.jsx           # Feed post card component
│   │   │   ├── PostEditor.jsx         # DOMPurify rich text editor
│   │   │   ├── ProfileCompletionBar.jsx # User profile completion percentage meter
│   │   │   ├── ProtectedRoute.jsx     # Authenticated user route guard
│   │   │   ├── PWAInstallPrompt.jsx   # Custom 14-day persistent PWA install prompt
│   │   │   ├── PWAUpdateBanner.jsx    # Non-disruptive Service Worker update toast
│   │   │   ├── SidebarWidgets.jsx     # Home page sidebar (trending/hashtags/suggested users)
│   │   │   └── Skeleton.jsx          # UI loading skeletons (feed & widget skeletons)
│   │   ├── config/
│   │   │   └── branding.js            # Central branding configuration & versioning
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global state management for authentication
│   │   ├── pages/                     # Application pages / views
│   │   │   ├── AdminUsers.jsx         # Founder user management interface
│   │   │   ├── CheckEmail.jsx         # Registration success / check inbox page
│   │   │   ├── CreatePost.jsx         # Post creation (drafts, multi-images, polls, rich text)
│   │   │   ├── Dashboard.jsx          # Founder overview & system metrics dashboard
│   │   │   ├── EditPost.jsx           # Post editing screen
│   │   │   ├── Home.jsx               # Main feed page (Latest, Trending, Popular tabs)
│   │   │   ├── Login.jsx              # User sign-in page
│   │   │   ├── Offline.jsx            # Branded offline fallback status page
│   │   │   ├── PostDetail.jsx         # Dedicated single post page with full comments & actions
│   │   │   ├── Profile.jsx            # Profile manager (My Posts, Liked Posts, Saved Posts)
│   │   │   ├── Register.jsx           # User sign-up page
│   │   │   ├── UserProfile.jsx        # Public user profile view
│   │   │   └── VerifyEmail.jsx        # Email verification landing page
│   │   ├── services/
│   │   │   └── api.js                 # Axios client instance with cookie & auth interceptors
│   │   ├── utils/
│   │   │   └── imageKit.js            # ImageKit responsive transformation helper
│   │   ├── App.jsx                    # Main application router layout & PWA handlers
│   │   ├── index.css                  # Global Tailwind v4 styles & Lightbox design tokens
│   │   └── main.jsx                   # React entry point wrapped in ErrorBoundary
│   ├── .oxlintrc.json                 # Oxlint configuration
│   ├── package.json                   # Frontend dependencies & scripts
│   ├── server.js                      # Production static server for client
│   └── vite.config.js                 # Vite & VitePWA Workbox build configuration
├── docs/                              # Project documentation & sprint reports
├── logs/                              # Server logs directory (winston transport outputs)
├── scripts/                           # Maintenance & utility scripts
│   ├── migrate-email-verified.js      # One-time migration for legacy user accounts
│   └── seed-founder.js                # Automatic Founder promotion script
├── src/                               # Backend Express.js API Application
│   ├── __tests__/                     # Integration & unit test suites (Jest + Supertest)
│   │   ├── auth.cookie.test.js
│   │   ├── auth.mocked.test.js
│   │   ├── auth.protected.test.js
│   │   ├── auth.test.js
│   │   ├── auth.verification.test.js
│   │   ├── discovery.test.js
│   │   ├── founder.test.js
│   │   ├── health.test.js
│   │   ├── posts.mocked.test.js
│   │   ├── posts.test.js
│   │   ├── richContent.test.js
│   │   ├── socialEngagement.test.js
│   │   └── user.model.test.js
│   ├── config/                        # Environment & cloud configuration
│   │   ├── constants.js               # Discovery decay & engagement weights
│   │   ├── env.js                     # Zod-validated environment config
│   │   └── imagekit.js                # ImageKit SDK client instance
│   ├── controllers/                   # Request handler controllers
│   │   ├── auth.controller.js         # Register, login, logout, verification handlers
│   │   ├── dashboard.controller.js    # Metrics, user management, audit log handlers
│   │   ├── health.controller.js       # Health check handlers
│   │   ├── post.controller.js         # Post CRUD, reactions, bookmarks, comments, polls, views
│   │   ├── upload.controller.js       # ImageKit auth params & multi-image upload handlers
│   │   └── user.controller.js         # Profile, suggested users & user linking handlers
│   ├── docs/
│   │   └── swagger.js                 # OpenAPI 3.0 specification setup
│   ├── errors/
│   │   └── AppError.js                # Custom operational error class
│   ├── middleware/                    # Express middlewares
│   │   ├── auth.middleware.js         # JWT validation & role authorization guards
│   │   ├── error.middleware.js        # Global error response handler
│   │   ├── rateLimiter.middleware.js  # Global & Auth rate limiters
│   │   ├── requestId.middleware.js    # Request UUID generator
│   │   ├── sanitize.middleware.js     # NoSQL payload sanitizer
│   │   └── validate.middleware.js     # Schema validation middleware
│   ├── models/                        # Mongoose database models
│   │   ├── AuditLog.js                # Administrative action audit trails
│   │   ├── Post.js                    # Post schema (images, polls, views, reactions, comments)
│   │   └── User.js                    # User schema (roles, verified state, links, bookmarks)
│   ├── routes/                        # Express API route modules
│   │   ├── auth.routes.js             # /api/auth routes
│   │   ├── dashboard.routes.js        # /api/dashboard routes
│   │   ├── health.routes.js           # /health routes
│   │   ├── post.routes.js             # /api/posts routes
│   │   ├── upload.routes.js           # /api/upload routes
│   │   └── user.routes.js             # /api/users routes
│   ├── services/                      # Business logic layer
│   │   ├── auth.service.js            # Auth business rules, password verification, tokens
│   │   ├── email.service.js           # Email sending service (Nodemailer SMTP & Resend integration)
│   │   └── health.service.js          # DB health probe service
│   ├── utils/                         # Helper utilities
│   │   ├── apiResponse.js             # Standardized API JSON envelope responses
│   │   ├── asyncHandler.js            # Async wrapper for route handlers
│   │   ├── cookie.js                  # HttpOnly cookie setter/clearer
│   │   ├── logger.js                  # Winston logger instance
│   │   └── verificationToken.js       # Crypto token generator for email verification
│   ├── validators/                    # Request payload validation schemas
│   │   └── auth.validator.js          # Zod authentication input validation
│   ├── app.js                         # Express app middleware & route composition
│   ├── db.js                          # MongoDB Mongoose connection manager
│   └── server.js                      # Server startup & graceful shutdown listener
├── .dockerignore                      # Docker context ignore rules
├── .env.example                       # Example environment variables template
├── .gitignore                         # Git ignore rules
├── Dockerfile                         # Alpine Node 22 production container specification
├── FUTURE_IMPROVEMENTS.md             # Technical debt & roadmap backlog
├── package.json                       # Backend node package dependencies & scripts
├── RELEASE_NOTES.md                   # Complete Version 0.11.0 release notes
├── requests.http                      # REST Client API request test file
└── README.md                          # Master project documentation
```

---

## 🛠️ Technology Stack

### Backend Services
- **Runtime**: Node.js (v22 LTS)
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose v9 ODM
- **Authentication**: JSON Web Token (`jsonwebtoken`), `cookie-parser`, `bcryptjs`
- **Email Engines**: Nodemailer (Gmail App Password) & Resend (`resend`)
- **Media Management**: ImageKit SDK (`@imagekit/nodejs`), Multer (`multer`)
- **Input Validation**: Zod (`zod`)
- **Sanitization & Security**: DOMPurify (`dompurify`), `helmet`, `express-rate-limit`, `cors`, `mongoSanitize`, `morgan`, `winston`
- **API Documentation**: Swagger UI Express (`swagger-ui-express`, `swagger-jsdoc`)

### Frontend Web Application
- **Library**: React 18
- **Build Tool**: Vite
- **Progressive Web App**: `vite-plugin-pwa`, Workbox (`generateSW`), `site.webmanifest`
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Iconography**: Lucide React
- **Notifications**: React Hot Toast

### Testing & DevOps
- **Test Framework**: Jest v30, Supertest v7 (13 test suites, 75 passing unit tests)
- **Static Analysis**: Oxlint (0 errors)
- **Containerization**: Docker (Alpine Linux node:22-alpine)
- **CI/CD Workflows**: GitHub Actions (`backend-ci.yml`, `main_link-click-frontend.yml`)
- **Hosting Platforms**: Vercel (Frontend SPA) & Render (Backend API Web Service)

---

## 📋 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

| Environment Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT auth tokens | `your_jwt_secret_key` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CORS_ORIGIN` | Allowed origin for CORS client requests | `https://link-click-six.vercel.app` |
| `FRONTEND_URL` | Frontend client application base URL | `https://link-click-six.vercel.app` |
| `FOUNDER_EMAIL` | Email address promoted to Founder role | `udayshankarpandey.03@gmail.com` |
| `SMTP_USER` | Gmail address for unrestricted email delivery | `yourname@gmail.com` |
| `SMTP_PASS` | 16-character Google App Password | `abcd efgh ijkl mnop` |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public access key | `public_xxx` |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private API key | `private_xxx` |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit base URL endpoint | `https://ik.imagekit.io/your_id` |
| `RESEND_API_KEY` | Resend API key for transactional emails | `re_xxx` |
| `EMAIL_FROM` | Sender address for transactional emails | `Link Click <noreply@yourdomain.com>` |

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- **Node.js** (v18.x or v22.x LTS recommended)
- **npm** (v10+ or v11+)
- **MongoDB** instance (local process or MongoDB Atlas cluster)
- **ImageKit Account** (for post image & avatar uploads)

### 1. Clone Repository & Setup Environment

```bash
git clone https://github.com/UdayShankarPandey/pep-project.git
cd pep-project

# Create root environment file
cp .env.example .env
```

### 2. Backend Setup & Run

```bash
# Install backend dependencies
npm install

# (Optional) Seed the Founder account into DB
node scripts/seed-founder.js

# Start backend in development mode with Nodemon
npm run dev
```

The API server will start on `http://localhost:3000`. You can explore the interactive API documentation at `http://localhost:3000/api/docs`.

### 3. Frontend Setup & Run

```bash
# In a new terminal window, navigate to the client directory
cd client

# Install client dependencies
npm install

# Start Vite dev server
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🔌 API Routes & Endpoints

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new account & trigger email verification |
| `POST` | `/api/auth/login` | Public | Authenticate user & set HttpOnly token cookie |
| `POST` | `/api/auth/logout` | Authenticated | Logout user & clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |
| `POST` | `/api/auth/send-verification-email` | Authenticated | Resend email verification link |
| `GET` | `/api/auth/verify-email` | Public | Verify user email via token query parameter |

### 👤 User Management & Linking (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile/:id` | Public / Auth | Get user profile details by User ID |
| `PUT` | `/api/users/profile` | Authenticated | Update bio, avatar, location, or user details |
| `POST` | `/api/users/link/:id` | Authenticated | Toggle "Linking" (follow/unfollow) with a user |
| `GET` | `/api/users/suggested` | Public / Auth | Get suggested creators (Founder first, max 5) |
| `GET` | `/api/users/search` | Public | Search users by username or name |

### 📝 Posts, Social Interactions & Feed Discovery (`/api/posts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Fetch paginated post feed (`Latest`) |
| `GET` | `/api/posts/trending` | Public | Fetch 7-day weighted decay feed (`Trending`) |
| `GET` | `/api/posts/popular` | Public | Fetch highest reaction feed (`Popular`) |
| `GET` | `/api/posts/hashtags/popular` | Public | Fetch popular normalized hashtags |
| `GET` | `/api/posts/bookmarked` | Authenticated | Fetch authenticated user's saved posts |
| `POST` | `/api/posts` | Authenticated | Create a new post (rich content, multi-images, poll) |
| `GET` | `/api/posts/:id` | Public | Get single post details with comments & poll data |
| `PUT` | `/api/posts/:id` | Author / Founder | Update post content |
| `DELETE` | `/api/posts/:id` | Author / Founder | Delete post and cascade purge from user bookmarks |
| `POST` | `/api/posts/:id/react` | Authenticated | Update emoji reaction (❤️, 👍, 😂, 😮, 😢) |
| `POST` | `/api/posts/:id/bookmark` | Authenticated | Toggle post bookmark state |
| `POST` | `/api/posts/:id/vote` | Authenticated | Vote on a poll post |
| `POST` | `/api/posts/:id/view` | Authenticated | Increment post views (non-author, 50% visibility / 2.5s) |
| `POST` | `/api/posts/:id/comments` | Authenticated | Add a comment or 1-level reply to post |
| `PUT` | `/api/posts/:id/comments/:commentId` | Commenter / Founder | Edit comment text (sets `isEdited = true`) |
| `DELETE` | `/api/posts/:id/comments/:commentId` | Commenter / Founder | Delete a comment |

### 👑 Founder Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Founder | Retrieve platform metrics and usage statistics |
| `GET` | `/api/dashboard/users` | Founder | Retrieve paginated list of all system users |
| `PATCH` | `/api/dashboard/users/:id/role` | Founder | Promote/demote user roles (`user`, `founder`) |
| `PUT` | `/api/dashboard/users/:id/suspend` | Founder | Suspend or restore user account |
| `DELETE` | `/api/dashboard/users/:id/soft-delete` | Founder | Soft-delete user account |
| `GET` | `/api/dashboard/audit-logs` | Founder | Retrieve system operational audit logs |

### 🖼️ File Upload Authorization (`/api/upload`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/upload/auth` | Authenticated | Obtain signed token and parameters for client ImageKit upload |
| `POST` | `/api/upload/multiple` | Authenticated | Upload up to 4 images to ImageKit (max 50MB per file) |

### 🏥 System Health (`/health`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | General system health status check |
| `GET` | `/health/liveness` | Public | Kubernetes / Docker liveness probe |
| `GET` | `/health/readiness` | Public | Database readiness probe |

---

## 🎨 Design System Specification

### 1. Design Philosophy
Link Click's visual identity is **modern, minimal, premium, human, calm, and accessible**. The UI acts as a refined frame celebrating community visual content.

#### Core Principles
- **Restraint over Flash**: Avoid excessive neon accents, heavy glowing gradients, laser effects, or distracting visual noise.
- **Subtle Elevation**: Depth is communicated primarily through clean border contrasts (`#1f1f25`, `#2a2a30`, `#2a2a32`) and soft surfaces, rather than heavy drop shadows.
- **Purposeful Motion**: Micro-interactions (like-pops, subtle fades, slide-ups) exist to confirm user intent and provide intuitive feedback.
- **Human & Calm**: Warm dark tones (`#111113` canvas, `#E8A838` amber accent) create a cozy, high-end studio aesthetic.
- **Accessibility First**: Color contrast, keyboard focus indicators, and screen reader attributes are integrated into every component by default.

### 2. Color System & Design Tokens
Built with CSS custom variables under Tailwind CSS v4 `@theme`:

#### Surfaces & Canvas
- `--color-canvas`: `#111113` (Main app background canvas)
- `--color-surface`: `#1a1a1f` (Cards, forms, panels, navbar dropdowns)
- `--color-surface-raised`: `#222228` (Secondary containers, active item backgrounds)
- `--color-surface-overlay`: `#2a2a32` (Modal overlays, hover states on cards)

#### Border Tokens
- `--color-border`: `#2a2a30` (Primary container borders)
- `--color-border-subtle`: `#1f1f25` (Inner dividers, subtle list item borders)

#### Brand & Accent Palette
- `--color-amber`: `#E8A838` (Primary brand hero color, active tabs, primary buttons)
- `--color-amber-hover`: `#F0B84C` (Primary button hover state)
- `--color-amber-muted`: `#E8A83820` (Subtle active badges, icon background fills)
- `--color-amber-glow`: `#E8A83812` (Subdued focus rings and glow highlights)
- `--color-coral`: `#E85D5D` (Heart likes, engagement badges)
- `--color-teal`: `#3DBBA0` (Success badges, verified indicators)
- `--color-danger`: `#D35454` (Destructive buttons, error alerts)
- `--color-danger-muted`: `#D3545418` (Error alert background fill)

#### Text & Content Scale
- `--color-text-primary`: `#F5F0E8` (~14.8:1 AAA contrast)
- `--color-text-secondary`: `#9A9690` (~6.5:1 AA contrast)
- `--color-text-tertiary`: `#8C8780` (~4.6:1 AA contrast)
- `--color-text-inverse`: `#111113` (~14.8:1 AAA contrast)

### 3. Typography Scale (Inter Font)
- **Page Header (H1)**: `text-2xl sm:text-3xl font-extrabold tracking-tight` (24px–30px / 800)
- **Section Header (H2)**: `text-lg sm:text-xl font-bold tracking-tight` (18px–20px / 700)
- **Card Title (H3)**: `text-base font-bold` (16px / 700)
- **Body Text**: `text-sm font-normal` (14px / 400)
- **Labels & Buttons**: `text-sm font-semibold` (14px / 600)
- **Captions / Meta**: `text-xs font-medium` (12px / 500)

### 4. Container Max-Width Categories
- **Auth Pages**: `max-w-sm` (384px) — `Login`, `Register`, `CheckEmail`, `VerifyEmail`
- **Form / Editor Pages**: `max-w-2xl` (672px) — `CreatePost`, `EditPost`
- **Detail Pages**: `max-w-3xl` (768px) — `PostDetail`
- **Feed & Profile Pages**: `max-w-5xl` (1024px) — `Home`, `Profile`, `UserProfile`
- **Admin Dashboard**: `max-w-6xl` (1152px) — `Dashboard`, `AdminUsers`

### 5. Motion Principles & Keyframe Animations
- `fade-in`: `opacity: 0 -> 1`, `translateY(8px -> 0)` (350ms ease-out)
- `slide-up`: `opacity: 0 -> 1`, `translateY(12px -> 0)` (300ms ease-out)
- `like-pop`: `scale(1 -> 1.3 -> 1)` (300ms ease-out)
- `shimmer`: Linear gradient skeleton loader animation (1.5s infinite)
- **Accessibility**: All animations respect `prefers-reduced-motion: reduce` by setting animation/transition durations to `0.01ms`.

---

## 🐳 Docker & Deployment Architecture

### Azure Environment
- **Hosting Service**: Azure App Service (`link-click-api`)
- **OS & Runtime**: Linux / Docker Container
- **Region**: Southeast Asia (Azure for Students region compliance)
- **App Service Plan**: `asp-link-click-prod` (Free F1 tier)

### Deployment Pipeline
```text
GitHub Push (main)
  ↓
GitHub Actions Workflow
  ↓
Docker Image Compilation (node:22-alpine)
  ↓
Container Registry Publishing
  ↓
Azure App Service Web App Deployment
  ↓
MongoDB Atlas Cluster
```

### Docker Execution Commands
```bash
# Build production Alpine Docker image
docker build -t link-click-api .

# Run container on port 3000
docker run -d -p 3000:3000 --env-file .env --name link-click-container link-click-api
```

---

## 🏆 Engineering Sprint Reports & Project Evolution

### Sprint 1 — Project Foundation & Initial Setup
- **Objective**: Establish core repository architecture, Express server framework, MongoDB connection manager, and React 18 SPA template.
- **Achievements**: Configured Node 22 ESM structure, Express application setup, Mongoose schema integration, initial React 18 + Vite scaffolding, and base CSS design variables.

### Sprint 2 — Authentication & User Management
- **Objective**: Implement secure authentication pipeline with JWT tokens, password hashing, user registration, and login flows.
- **Achievements**: Built `/api/auth/register`, `/api/auth/login`, HttpOnly auth cookies, password encryption via `bcryptjs`, Zod input validation schemas, and global `AuthContext.jsx`.

### Sprint 3 — Core Posting System
- **Objective**: Build fundamental post creation, feed retrieval, pagination, and post CRUD controller APIs.
- **Achievements**: Designed `Post` schema, created `POST /api/posts`, `GET /api/posts` with pagination controls, post deletion authorization, and base `PostCard.jsx` UI layout.

### Sprint 4 — Comments & User Interaction
- **Objective**: Enable user interaction through post likes, real-time comments, user profiles, and follower connections ("Linking").
- **Achievements**: Implemented post liking, comment creation/deletion endpoints, user profile inspection (`Profile.jsx`, `UserProfile.jsx`), and user linking (`/api/users/link/:id`).

### Sprint 5 — Media Upload & Content Management
- **Objective**: Integrate cloud media management with ImageKit SDK for user avatars, post attachments, and client upload signing.
- **Achievements**: Built `/api/upload/auth` for signed client uploads, avatar image picker, image attachments in posts, and responsive URL transformations.

### Sprint 6 — Deployment, CI/CD & DevOps
- **Objective**: Containerize backend API with Docker, set up Azure App Service environment, and configure automated GitHub Actions CI/CD workflows.
- **Achievements**: Authored Alpine `Dockerfile`, established GitHub Actions pipelines (`backend-ci.yml`, `main_link-click-frontend.yml`), configured Azure App Service (`link-click-api`), and defined health probes (`/health/liveness`, `/health/readiness`).

### Sprint 7 — Email Verification & Security Hardening
- **Objective**: Add user email verification tokens via Resend API, enforce security headers (`helmet`), rate limiting, and NoSQL sanitization.
- **Achievements**: Built `/verify-email` pipeline with Resend integration, rate limiters (`express-rate-limit`), NoSQL injection protection (`mongoSanitize`), unique request UUID tracking (`requestIdMiddleware`), and legacy migration scripts.

### Sprint 8 — Branding & UI Polish
- **Objective**: Establish a systematic design token architecture, standardize UI components, enforce mobile touch ergonomics (44px touch targets), and verify production build stability.
- **Achievements**: Refactored 20 client components/pages, centralized CSS variables in `index.css`, built accessible pagination and navigation, verified zero linter errors, and validated 57/57 Jest test suites passing.

### Sprint 9 — Social Experience & Founder Platform
- **Objective**: Introduce a single-Founder platform model, social identity profile headers, and administrative governance.
- **Achievements**: Implemented single Founder role architecture (`FOUNDER_EMAIL`), hardened backend Founder immutability safeguards (403 Forbidden on suspend/delete), created widescreen profile cover banners, profile completion strength meter (`ProfileCompletionBar.jsx`), pinned post support (`📌 Pinned`), security audit logging (`AuditLog`), and code-split route architecture (`React.lazy`/`<Suspense>`). 63/63 Jest tests passing.

### Sprint 10 — Community Discovery & Rich Social Engagement
- **Objective**: Transform Link Click into a community-driven platform with intelligent discovery, rich content creation, and interactive social engagement.
- **Achievements**:
  - **Phase 1**: 7-day weighted trending formula ($w_{\text{react}}=3, w_{\text{comment}}=2, w_{\text{view}}=0.5$), suggested users ranking, popular hashtags aggregation, feed tabs (`Latest`, `Trending`, `Popular`), dynamic sidebar widgets.
  - **Phase 2**: `PostEditor.jsx` rich text editor with DOMPurify whitelist, ImageKit `ImageCarousel.jsx` with touch swipe & 1x/2x zoom, `PollCard.jsx` interactive polls (2–6 options, expiry presets), client draft auto-saving (20s interval), 50% visibility / 2.5s view counter.
  - **Phase 3**: Unified 5-emoji reactions (❤️, 👍, 😂, 😮, 😢), shared `PostActions.jsx`, Bookmarks system with automatic deletion cascade, Web Share API with clipboard fallback, 1-level nested comment replies, inline comment editing.
  - **Phase 4**: Production polish, useCallback memoization, WCAG 2.1 AA compliance, SonarQube quality audit, documentation, and 75/75 Jest unit tests passing across 13 test suites.

### Sprint 11 — Official Branding, Progressive Web App & Production Polish
- **Objective**: Transform Link Click into a fully installable, production-ready Progressive Web App (PWA) with official brand identity, offline shell resilience, error boundaries, SEO suite, and release polish.
- **Achievements**:
  - **Phase 1 & 1.5**: Integrated 5-figure multicolor community logomark with 100% transparent pixel keying, deployed browser favicons & icons (`favicon.svg`, `apple-touch-icon.png`, `android-chrome-*.png`), and created central `branding.js` configuration.
  - **Phase 2**: Configured `vite-plugin-pwa` generating `dist/sw.js` with 36 precached assets, intelligent Workbox runtime caching matrix (`NetworkOnly` for auth, `CacheFirst` for fonts/media, `NetworkFirst` for feeds), custom `PWAInstallPrompt.jsx` (14-day dismissal window), non-disruptive `PWAUpdateBanner.jsx`, and branded `Offline.jsx` status page.
  - **Phase 3**: Implemented global `ErrorBoundary.jsx` with dev-only Error ID debugging (`crypto.randomUUID()`), deployed SEO package (`robots.txt`, `sitemap.xml`, `<link rel="canonical">`, Schema.org JSON-LD structured data, ImageKit preconnect), created `RELEASE_NOTES.md`, and optimized master brand assets.
  - **Quality & Governance**: Filtered user roster to verified email accounts (`emailVerified: true`), resolved SonarQube quality gate findings, and validated 75/75 Jest unit tests passing across 13 test suites.

---

## 📐 Sprint 11 Implementation & Architectural Specification

Sprint 11 completes the **Official Branding, Progressive Web App (PWA) Integration, and Production Polish** for Link Click:

### 🎨 Phase 1 & 1.5: Official Branding & Asset Keying
- **Official Logomark**: Integrated 5-figure multicolor community vortex logomark into Navbar (`src/assets/branding/logomark.png`).
- **Transparency Keying**: Executed exact pixel transparency processing removing outer canvas and inner disc backgrounds while preserving coral red, amber, cream, purple, and teal gradients.
- **Central Branding Config**: Established `src/config/branding.js` for single-source-of-truth brand constants, versioning (`0.11.0`), and URLs.
- **Browser Icons**: Deployed complete icon set (`favicon.svg`, `favicon-32x32.png`, `favicon-16x16.png`, `favicon.ico`, `apple-touch-icon.png`, `android-chrome-*.png`, `og-image.png`).

### 📱 Phase 2: Progressive Web App (PWA) & Workbox Caching
- **Vite PWA Plugin**: Integrated `vite-plugin-pwa` generating `dist/sw.js` and `dist/workbox-*.js` with 36 precached assets.
- **Workbox Caching Matrix**:
  - `CacheFirst`: Google Fonts & ImageKit CDN media images (30-day expiration, max 100 entries).
  - `NetworkFirst`: Public feed API requests (`/api/posts`, 3s timeout).
  - `StaleWhileRevalidate`: Static media assets.
  - `NetworkOnly`: All authentication routes (`/api/auth/*`) — **Never Cached for security**.
- **In-App Install Experience**: Implemented `PWAInstallPrompt.jsx` capturing `beforeinstallprompt` with a 14-day persistent dismissal window in `localStorage`.
- **Non-Disruptive Updates**: Implemented `PWAUpdateBanner.jsx` displaying a *"Reload to Update"* toast without interrupting active user sessions.
- **Branded Offline Fallback**: Implemented `Offline.jsx` page at `/offline` with connection retry handler and auto-reload on network recovery.

### 🛡️ Phase 3: Resilience, SEO & Production Polish
- **Global Error Boundary**: Implemented `ErrorBoundary.jsx` wrapping `<App />` in `main.jsx` with branded fallback UI and dev-only Error ID debugging (`crypto.randomUUID()`).
- **SEO Assets**: Deployed `public/robots.txt` and `public/sitemap.xml`.
- **HTML Metadata**: Added `<link rel="canonical">`, ImageKit preconnect hint, and Schema.org `SocialNetworkingApplication` JSON-LD structured data in `index.html`.
- **Documentation**: Created `RELEASE_NOTES.md` for Version 0.11.0.

---

## 📐 Sprint 10 Implementation & Architectural Specification

### Core Scope Boundaries & Refinements
1. **Unified Reactions Model**: The legacy `likes` array model is fully replaced by the unified `reactions` model. ❤️ (heart) acts as the exact equivalent of a like. The reaction set is frozen to exactly 5 emojis: ❤️, 👍, 😂, 😮, and 😢.
2. **Draft Post System**: Client-side auto-save to `localStorage` (`link_click_post_draft`) every 20 seconds. Exactly ONE draft is stored; creating a new draft overwrites the previous one. Unfinished drafts auto-restore when reopening `CreatePost.jsx`.
3. **Multi-Image Upload & Reordering**: Max 4 images, formats `JPG`/`PNG`/`WEBP`, max size `50 MB` per image. Includes pre-publishing image reordering controls.
4. **Formatted Content Limit**: Post content capped at **5,000 characters** maximum.
5. **Hashtag Normalization**: Regex `#[\w_]+` normalized to lowercase (max 30 chars).
6. **Poll Architecture**: Optional (`postType: 'standard' | 'poll'`). Expiry presets: `1 day`, `3 days`, `7 days`, `30 days`, `No expiry`. Creators follow identical single-vote rules. Expired polls are read-only.
7. **Strict Rich Text Security**: `PostEditor.jsx` enforces `DOMPurify` whitelist rendering ONLY `<b>`/`<strong>`, `<i>`/`<em>`, and `<a href="..." target="_blank">`. All links receive `rel="noopener noreferrer"`.
8. **Bookmark Cascade Purge**: Bookmarks display newest first in Profile. Bookmarks are purged automatically whenever a post is deleted (`User.updateMany({}, { $pull: { bookmarks: postId } })`).
9. **View Counter Specifications**: Non-author views increment after 50% element visibility for 2.5 seconds continuously. Resets timer if visibility drops below 50%. Deduplicated per session via `sessionStorage`.

---

## 📋 Pre-Release Checklist & Quality Gates

Version tag `v0.11.0` Quality Gates:

- [x] **Vite Client Production Build**: Executed `cd client && npm run build`. Built cleanly in 763ms with zero errors.
- [x] **Jest Test Suite**: Executed `npm test`. All 13 test suites passed (**75/75 individual unit tests passing**).
- [x] **Linter & Static Analysis**: Executed `npx oxlint`. **0 errors**, **0 blocking warnings**.
- [x] **Responsive Layout Verification**: Audited viewports 320px, 375px, 768px, 1024px, and 1440px+ across Feed, Profile, Saved Posts, Post Detail, Create Post, Polls, Lightbox Carousel, PWA Install Banner, Offline Status Page, and Reaction Popovers. Zero content clipping or horizontal overflow.
- [x] **Accessibility Audit (WCAG 2.1 AA)**: Verified keyboard navigation, visible focus states (`focus-visible:ring-2 focus-visible:ring-amber`), semantic HTML structure (`<section>`, proper heading hierarchy `h1` per page), and ARIA attributes across all components.
- [x] **SonarQube Quality Standards**: Cognitive complexity kept low, nested ternaries eliminated, array index keys avoided, optional chaining used, zero unused variables, cryptographically secure PRNG (`crypto.randomUUID()`), explicit `type="button"` attributes on buttons.
- [x] **Founder Platform Protections**: Verified Founder-first role security, single Founder account constraint, Founder protection against suspension/soft deletion, verified email roster filtering (`emailVerified: true`), and audit logging.

---

## 🧪 Testing & Quality Assurance

The repository includes complete test coverage across authentication, cookie security, route authorization, founder safeguards, discovery APIs, rich content, reactions, polls, and model schemas using **Jest** and **Supertest**.

```bash
# Run all backend & integration tests
npm test

# Run tests with coverage output
npm test -- --coverage
```

### Complete Test Suite Inventory (`src/__tests__/`)
1. `auth.test.js`: User registration and authentication logic.
2. `auth.cookie.test.js`: HttpOnly cookie issuance and header authentication.
3. `auth.mocked.test.js`: Unit tests for auth controller methods.
4. `auth.protected.test.js`: Protected route middleware authorization guards.
5. `auth.verification.test.js`: Verification token generation and email validation flows.
6. `discovery.test.js`: Community discovery APIs (`trending`, `popular`, `hashtags`, `suggested users`).
7. `founder.test.js`: Operational role security and Founder account immutability safeguards.
8. `health.test.js`: Health check probes (`/health`, `/liveness`, `/readiness`).
9. `posts.test.js`: Feed fetching, post creation, and like interactions.
10. `posts.mocked.test.js`: Unit tests for post controller methods.
11. `richContent.test.js`: Multi-image uploads, poll voting endpoints, and view increment API.
12. `socialEngagement.test.js`: Reaction updating, bookmark toggling, saved posts API, comment editing.
13. `user.model.test.js`: Mongoose model validations and password hashing pre-save hooks.

---

## 🛠️ Operational Scripts

The `scripts/` directory provides essential maintenance utilities:

### 1. Founder Account Seeding (`scripts/seed-founder.js`)
Promotes the user account matching `FOUNDER_EMAIL` in `.env` to the `founder` role.
```bash
node scripts/seed-founder.js
```

### 2. Legacy Email Verification Migration (`scripts/migrate-email-verified.js`)
Idempotent database script that sets `emailVerified: true` for accounts created before email verification was introduced.
```bash
MONGODB_URI="your_mongodb_uri" node scripts/migrate-email-verified.js
```

---

## ⚡ Client Engine & Vite Setup

The frontend Single Page Application is built with **React 18** and **Vite**:

- **Fast HMR & Oxc**: Configured with `@vitejs/plugin-react` utilizing Oxc for development compilation speed.
- **Oxlint Analysis**: Standardized static linting via `.oxlintrc.json` ensuring clean syntax and prop hygiene.
- **PWA Service Worker**: `vite-plugin-pwa` generating Workbox service worker (`dist/sw.js`) with precached assets and custom update handling.
- **Production Bundle**: Bundles assets cleanly into `dist/` in ~760ms with code-split page chunks.

---

## 🔮 Future Improvements & Accepted Technical Debt

For comprehensive details on postponed features and long-term backlog items, see [FUTURE_IMPROVEMENTS.md](file:///c:/Users/Uday%20Shankar%20Pandey/Downloads/PEP%20Project/FUTURE_IMPROVEMENTS.md).

### SonarQube Accepted Technical Debt & Refactoring Roadmap
- **Rich Text Editor Modernization (`PostEditor.jsx`)**: Replace deprecated `document.execCommand()` formatting calls with a modern headless editor framework (e.g., Tiptap or Slate.js) for enhanced cross-browser rich text editing capabilities.
- **Cryptographic Shuffling (`user.controller.js`)**: Upgrade `Math.random()` array sorting in Suggested Users (`nonFounders.sort(() => Math.random() - 0.5)`) to Fisher-Yates shuffle utilizing Node.js `crypto.getRandomValues()` or `crypto.randomInt()`.
- **API Gateway Payload Protection (`post.routes.js` & `upload.routes.js`)**: Supplement the intentional 50 MB rich media upload limit with reverse-proxy payload streaming validation (NGINX `client_max_body_size 50m`) and `express-rate-limit` middleware on file upload endpoints.

---

## 🤝 Contributing & License

Contributions, bug reports, and feature requests are welcome!

This project is licensed under the **MIT License**.

---

## 🔔 Sprint 12 Phase 1: Notification Foundation & Architecture

The backend foundation for the In-App Notifications System is designed for scalability and performance. 
It supports multiple notification types (`post_like`, `post_comment`, `post_reaction`, `user_link`) while intelligently deduplicating events to prevent notification spam.

**Key Features & API Contracts:**
- **Data Model (`Notification.js`)**: Tracks `recipient`, `actor`, `type`, `post`, `commentId`, and `isRead` status.
- **Service (`notification.service.js`)**: Centralizes creation logic and implements type-aware deduplication. For example, repeated likes from the same user on the same post will not create duplicate unread notifications, whereas separate comments will.
- **Protected Endpoints**:
  - `GET /api/notifications` — Fetches paginated, rich notifications.
  - `GET /api/notifications/unread-count` — Returns the user's current unread count.
  - `PUT /api/notifications/:id/read` — Marks a specific notification as read.
  - `PUT /api/notifications/read-all` — Marks all unread notifications as read.
- **Indexes**: Query patterns are heavily optimized with compound indexes (e.g., `{ recipient: 1, createdAt: -1 }`).

### 🚨 Known Limitations & Technical Debt (Multer OOM Risk)
During the Sprint 12 Audit, a severe vulnerability was identified in the current upload architecture:
- **Issue**: `post.routes.js` relies on `multer.memoryStorage()` with a 50MB file limit for image uploads.
- **Risk**: A small burst of concurrent large uploads will buffer entirely in RAM, leading to immediate Out-Of-Memory (OOM) crashes and server restarts on standard cloud container instances.
- **Resolution Path**: This must be addressed in a dedicated technical debt task by refactoring `multer` to use `diskStorage` or direct-to-cloud streams prior to scaling production traffic.
