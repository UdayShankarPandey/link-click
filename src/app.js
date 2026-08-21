import express, { json, urlencoded } from 'express';
import env from './config/env.js';
import cors from 'cors';
import helmet from 'helmet';
import { mongoSanitize } from './middleware/sanitize.middleware.js';
import { globalLimiter, authLimiter } from './middleware/rateLimiter.middleware.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import postRoutes from './routes/post.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import healthRoutes from './routes/health.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import errorMiddleware from './middleware/error.middleware.js';
import morgan from 'morgan';
import { morganStream } from './utils/logger.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

// Trust Render's load balancer proxy — required for correct IP detection
// behind a reverse proxy (fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR).
app.set('trust proxy', 1);

// ─── Security Middleware ────────────────────────────────────────────────────

// Request ID assignment
app.use(requestIdMiddleware);

// HTTP request logging (Custom Morgan format with Request ID)
morgan.token('id', (req) => req.requestId || '-');
app.use(morgan('[:id] :method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// Cookie parser for reading HttpOnly authentication cookies
app.use(cookieParser());

// Helmet — sets secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// CORS — restrict browser access to configured frontend origin(s) with credentials support
const allowedOrigins = new Set((env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server, health checks)
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin) || (env.NODE_ENV === 'production' && origin.endsWith('.vercel.app'))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
}));

// Global rate limiter — 100 requests per 15 minutes per IP
app.use(globalLimiter);

// Standard body parsers with size limits to prevent payload abuse
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }));

// Sanitize user input against NoSQL injection ($gt, $ne, etc.)
app.use(mongoSanitize);

// ─── API Routes ─────────────────────────────────────────────────────────────

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth routes get a stricter rate limiter (brute-force protection)
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check routes
app.use('/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the PEP Project API Server!</h1><p>Check health status at <a href="/health">/health</a></p>');
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use(errorMiddleware);

export default app;
