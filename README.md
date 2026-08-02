# Link Click — Modern Full-Stack Social Platform

**Link Click** is a beautifully crafted, modern full-stack social media application built with Node.js, Express, MongoDB, React 18, Vite, and Tailwind CSS v4. Designed around a signature **"Lightbox" aesthetics design system** with warm amber accents, glassmorphism, and smooth micro-animations, Link Click offers a rich social experience with posts, media lightbox, double-tap liking, real-time comment discussions, user linking (follow system), email verification, and a dedicated Founder platform.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ Project Architecture & Directory Structure](#️-project-architecture--directory-structure)
- [🛠️ Technology Stack](#️-technology-stack)
- [📋 Environment Variables](#-environment-variables)
- [🚀 Quick Start & Installation Guide](#-quick-start--installation-guide)
- [🔌 API Routes & Endpoints](#-api-routes--endpoints)
- [🛠️ Operational Scripts](#️-operational-scripts)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [🐳 Docker & Deployment](#-docker--deployment)
- [📖 Documentation Directory](#-documentation-directory)
- [🤝 Contributing & License](#-contributing--license)

---

## ✨ Key Features

### 🎨 Frontend & Design System
- **Lightbox Aesthetic**: Custom design language with high contrast dark backgrounds, warm amber glows (`#f59e0b`), glassmorphism, and sleek micro-interactions.
- **Interactive Social Feed**: Real-time media feeds, double-tap photo liking with animated heart feedback, multi-page pagination, and skeleton loading states.
- **Media Lightbox**: Dedicated full-screen image viewer for high-resolution post uploads.
- **Rich Profiles**: User profile headers with avatar upload, bio, location, join date, interactive profile completion meter, and tabbed view for created posts vs. liked content.
- **"Linking" Network**: Follower system allowing users to "Link" with each other, track mutual connections, and inspect author cards via hover previews (`AuthorHovercard`).
- **Real-Time Toast Feedback**: Contextual alerts for actions using `react-hot-toast`.

### 🔐 Security & Authentication
- **Secure Auth Pipeline**: JWT-based session security with support for HttpOnly cookies and `Authorization: Bearer` headers.
- **Email Verification**: User registration triggers email verification tokens delivered via Resend API (`/verify-email`). Unverified users receive subtle reminder banners.
- **Role-Based Access Control (RBAC)**: Role hierarchy (`user`, `admin`, `founder`) protecting administrative operations.
- **Hardened Security Middleware**:
  - `helmet`: Secure HTTP headers protection.
  - `express-rate-limit`: Global rate limiting (100 reqs / 15 min) and stricter auth rate limiting (10 reqs / 15 min).
  - `mongoSanitize`: Prevention against NoSQL query injection payloads (`$gt`, `$ne`).
  - `cors`: Configured origin control with credential pass-through.
  - `requestIdMiddleware`: Assigns unique `UUIDv4` request IDs attached to Morgan HTTP logs for end-to-end audit tracing.

### 👑 Founder & Admin Operational Platform
- **Operational Dashboard**: High-level platform statistics (total users, active accounts, post counts, system health).
- **User Governance**: Multi-select batch actions, user role management, account suspension/activation, and email verification toggles.
- **Immutability Safeguards**: Core founder account cannot be edited or demoted by standard admins.
- **System Audit Logs**: Log of administrative actions saved to `AuditLog` collection.

---

## 🏗️ Project Architecture & Directory Structure

```text
PEP Project/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml             # Backend CI testing & security audit pipeline
│       └── main_link-click-frontend.yml # Frontend Vite build & Azure Web App deployment
├── client/                            # Frontend Single Page Application (React 18 + Vite)
│   ├── public/                        # Static web assets
│   ├── src/
│   │   ├── components/                # Modular UI components
│   │   │   ├── AdminRoute.jsx         # Guard component for admin routes
│   │   │   ├── AuthorHovercard.jsx    # User hovercard preview popup
│   │   │   ├── CommentSection.jsx     # Post comments & replies interface
│   │   │   ├── ConfirmDialog.jsx      # Modal confirmation dialog
│   │   │   ├── EmptyState.jsx         # Reusable empty content placeholder
│   │   │   ├── FounderBadge.jsx       # Crown badge for founder user role
│   │   │   ├── FounderRoute.jsx       # Guard component for founder-only routes
│   │   │   ├── Navbar.jsx             # Top navigation bar with active links & user menu
│   │   │   ├── Pagination.jsx         # Accessible pagination control
│   │   │   ├── PostCard.jsx           # Post card component with double-tap heart like
│   │   │   ├── ProfileCompletionBar.jsx # User profile completion percentage meter
│   │   │   ├── ProtectedRoute.jsx     # Authenticated user route guard
│   │   │   ├── SidebarWidgets.jsx     # Home page sidebar (trending/links/quick stats)
│   │   │   └── Skeleton.jsx          # UI loading skeletons
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global state management for authentication
│   │   ├── pages/                     # Application pages / views
│   │   │   ├── AdminUsers.jsx         # Founder/Admin user management interface
│   │   │   ├── CheckEmail.jsx         # Registration success / check inbox page
│   │   │   ├── CreatePost.jsx         # Post creation with ImageKit image attachment
│   │   │   ├── Dashboard.jsx          # Admin overview & system metrics dashboard
│   │   │   ├── EditPost.jsx           # Post editing screen
│   │   │   ├── Home.jsx               # Main feed page
│   │   │   ├── Login.jsx              # User sign-in page
│   │   │   ├── PostDetail.jsx         # Dedicated single post page with full comments
│   │   │   ├── Profile.jsx            # Current user profile manager
│   │   │   ├── Register.jsx           # User sign-up page
│   │   │   ├── UserProfile.jsx        # Public user profile view
│   │   │   └── VerifyEmail.jsx        # Email verification landing page
│   │   ├── services/
│   │   │   └── api.js                 # Axios client instance with cookie & auth interceptors
│   │   ├── App.jsx                    # Main application router layout
│   │   ├── index.css                  # Global Tailwind v4 styles & Lightbox design tokens
│   │   └── main.jsx                   # React application entry point
│   ├── .oxlintrc.json                 # Oxlint configuration
│   ├── package.json                   # Frontend dependencies & scripts
│   ├── server.js                      # Production static server for client
│   └── vite.config.js                 # Vite build configuration
├── docs/                              # Project documentation & sprint reports
│   ├── deployment.md                  # Deployment guide for Azure & Docker
│   ├── design-system.md               # Visual design tokens & system guidelines
│   ├── FUTURE_IMPROVEMENTS.md         # Roadmap & feature backlogs
│   ├── RELEASE_CHECKLIST.md           # Pre-launch production verification checklist
│   ├── SPRINT-8-REPORT.md             # Sprint 8 technical deliverables & metrics
│   └── SPRINT-9-REPORT.md             # Sprint 9 security & founder platform report
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
│   │   ├── founder.test.js
│   │   ├── health.test.js
│   │   ├── posts.mocked.test.js
│   │   ├── posts.test.js
│   │   └── user.model.test.js
│   ├── config/                        # Environment & cloud configuration
│   │   ├── env.js                     # Zod-validated environment config
│   │   └── imagekit.js                # ImageKit SDK client instance
│   ├── controllers/                   # Request handler controllers
│   │   ├── auth.controller.js         # Register, login, logout, verification handlers
│   │   ├── dashboard.controller.js    # Metrics, user management, audit log handlers
│   │   ├── health.controller.js       # Health check handlers
│   │   ├── post.controller.js         # Post CRUD, like/unlike, comment handlers
│   │   ├── upload.controller.js       # ImageKit authentication params endpoint
│   │   └── user.controller.js         # Profile management & user linking handlers
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
│   │   ├── Post.js                    # Post schema with author, likes, comments
│   │   └── User.js                    # User schema with roles, verified state, links
│   ├── routes/                        # Express API route modules
│   │   ├── auth.routes.js             # /api/auth routes
│   │   ├── dashboard.routes.js        # /api/dashboard routes
│   │   ├── health.routes.js           # /health routes
│   │   ├── post.routes.js             # /api/posts routes
│   │   ├── upload.routes.js           # /api/upload routes
│   │   └── user.routes.js             # /api/users routes
│   ├── services/                      # Business logic layer
│   │   ├── auth.service.js            # Auth business rules, password verification, tokens
│   │   ├── email.service.js           # Email sending service (Resend integration)
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
├── package.json                       # Backend node package dependencies & scripts
├── requests.http                      # REST Client API request test file
└── README.md                          # Project documentation
```

---

## 🛠️ Technology Stack

### Backend Services
- **Runtime**: Node.js (v22 LTS)
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose v9 ODM
- **Authentication**: JSON Web Token (`jsonwebtoken`), `cookie-parser`, `bcryptjs`
- **Email Service**: Resend (`resend`)
- **Media Management**: ImageKit SDK (`@imagekit/nodejs`), Multer (`multer`)
- **Input Validation**: Zod (`zod`)
- **Security & Utilities**: `helmet`, `express-rate-limit`, `cors`, `morgan`, `winston`
- **API Documentation**: Swagger UI Express (`swagger-ui-express`, `swagger-jsdoc`)

### Frontend Web Application
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Iconography**: Lucide React
- **Notifications**: React Hot Toast

### Testing & DevOps
- **Test Framework**: Jest v30, Supertest v7
- **Containerization**: Docker (Alpine Linux node:22-alpine)
- **CI/CD Workflows**: GitHub Actions (`backend-ci.yml`, `main_link-click-frontend.yml`)
- **Hosting**: Azure Web Apps

---

## 📋 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

| Environment Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pep_project` |
| `JWT_SECRET` | Secret key for signing JWT auth tokens | `your_jwt_secret_key` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CORS_ORIGIN` | Allowed origin for CORS client requests | `http://localhost:5173` |
| `FOUNDER_EMAIL` | Email address promoted to Founder role | `founder@example.com` |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public access key | `public_xxx` |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private API key | `private_xxx` |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit base URL endpoint | `https://ik.imagekit.io/your_id` |
| `RESEND_API_KEY` | Resend API key for verification emails | `re_xxx` |
| `EMAIL_FROM` | Sender address for transactional emails | `noreply@yourdomain.com` |

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
| `GET` | `/api/users/search` | Public | Search users by username or name |

### 📝 Posts & Social Interactions (`/api/posts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Fetch paginated post feed |
| `POST` | `/api/posts` | Authenticated | Create a new post with text and optional media URL |
| `GET` | `/api/posts/:id` | Public | Get single post details with comments |
| `PUT` | `/api/posts/:id` | Author / Admin | Update post content |
| `DELETE` | `/api/posts/:id` | Author / Admin | Delete post |
| `POST` | `/api/posts/:id/like` | Authenticated | Toggle post like state |
| `POST` | `/api/posts/:id/comments` | Authenticated | Add a comment to post |
| `DELETE` | `/api/posts/:id/comments/:commentId` | Commenter / Admin | Delete a comment |

### 👑 Founder & Admin Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Admin / Founder | Retrieve platform metrics and usage statistics |
| `GET` | `/api/dashboard/users` | Admin / Founder | Retrieve paginated list of all system users |
| `PATCH` | `/api/dashboard/users/:id/role` | Founder | Promote/demote user roles (`user`, `admin`) |
| `PATCH` | `/api/dashboard/users/:id/status` | Admin / Founder | Suspend or activate user account |
| `GET` | `/api/dashboard/audit-logs` | Founder | Retrieve system operational audit logs |

### 🖼️ File Upload Authorization (`/api/upload`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/upload/auth` | Authenticated | Obtain signed token and parameters for client ImageKit upload |

### 🏥 System Health (`/health`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | General system health status check |
| `GET` | `/health/liveness` | Public | Kubernetes / Docker liveness probe |
| `GET` | `/health/readiness` | Public | Database readiness probe |

---

## 🛠️ Operational Scripts

The `scripts/` directory provides essential automation utilities:

### 1. Founder Account Seeding (`scripts/seed-founder.js`)
Promotes the user account matching `FOUNDER_EMAIL` in `.env` to the `founder` role.
```bash
node scripts/seed-founder.js
```

### 2. Legacy Email Verification Migration (`scripts/migrate-email-verified.js`)
Idempotent database script that sets `emailVerified: true` for accounts created before email verification was introduced.
```bash
# Node execution:
MONGODB_URI="your_mongodb_uri" node scripts/migrate-email-verified.js
```

---

## 🧪 Testing & Quality Assurance

The repository includes test suites covering authentication, cookie security, route authorization, founder security safeguards, post interactions, and model schemas using **Jest** and **Supertest**.

```bash
# Run all backend tests
npm test

# Run tests with coverage output
npm test -- --coverage
```

### Key Test Suites (`src/__tests__/`)
- `auth.test.js`: Core user registration and authentication logic.
- `auth.cookie.test.js`: HttpOnly cookie issuance and authentication headers.
- `auth.verification.test.js`: Verification token generation and email validation flows.
- `founder.test.js`: Operational role security and founder account immutability safeguards.
- `posts.test.js`: Feed fetching, post creation, and like interactions.
- `health.test.js`: Health endpoint response validation.

---

## 🐳 Docker & Deployment

### Docker Setup

Build and launch the backend using the production-ready `Dockerfile`:

```bash
# Build the Docker image
docker build -t link-click-api .

# Run container on port 3000
docker run -d -p 3000:3000 --env-file .env --name link-click-container link-click-api
```

### CI/CD Pipelines
- **Backend CI (`.github/workflows/backend-ci.yml`)**: Automatically triggers on pushes and PRs to main. Performs `npm ci`, runs code security audits (`npm audit`), and executes all test suites.
- **Frontend CD (`.github/workflows/main_link-click-frontend.yml`)**: Builds Vite client assets and deploys directly to Azure Web App.

---

## 📖 Documentation Directory

For deep-dive specs, inspect the guides in the [`docs/`](file:///c:/Users/Uday%20Shankar%20Pandey/Downloads/PEP%20Project/docs) folder:
- **[`design-system.md`](file:///c:/Users/Uday%20Shankar%20Pandey/Downloads/PEP%20Project/docs/design-system.md)**: Visual architecture, Lightbox design tokens, typography, and UI specs.
- **[`deployment.md`](file:///c:/Users/Uday%20Shankar%20Pandey/Downloads/PEP%20Project/docs/deployment.md)**: Azure environment configuration and Docker runtime notes.
- **[`SPRINT-8-REPORT.md`](file:///c:/Users/Uday%20Shankar%20Pandey/Downloads/PEP%20Project/docs/SPRINT-8-REPORT.md)** & **[`SPRINT-9-REPORT.md`](file:///c:/Users/Uday%20Shankar%20Pandey/Downloads/PEP%20Project/docs/SPRINT-9-REPORT.md)**: Engineering sprint completion reports.
- **[`RELEASE_CHECKLIST.md`](file:///c:/Users/Uday%20Shankar%20Pandey/Downloads/PEP%20Project/docs/RELEASE_CHECKLIST.md)**: Production launch checklist.
- **[`FUTURE_IMPROVEMENTS.md`](file:///c:/Users/Uday%20Shankar%20Pandey/Downloads/PEP%20Project/docs/FUTURE_IMPROVEMENTS.md)**: Architecture roadmap and upcoming features.

---

## 🤝 Contributing & License

Contributions, bug reports, and feature requests are welcome!

This project is licensed under the **MIT License**.
