import env from '../config/env.js';
import { logger } from '../utils/logger.js';

const sanitizeLogValue = (value) =>
  String(value ?? '').replace(/[\r\n\t]/g, ' ');

const errorMiddleware = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.statusCode >= 500) {
    const requestId = sanitizeLogValue(req.requestId || '-');
    const method = sanitizeLogValue(req.method);
    const url = sanitizeLogValue(req.originalUrl);
    const errorMessage = sanitizeLogValue(err.message);

    logger.error(
      `[${requestId}] ${method} ${url} - ${errorMessage}`
    );
  }

  const message =
    env.NODE_ENV === 'production' && err.statusCode >= 500
      ? 'Internal server error'
      : err.message;

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message,
    ...(err.isOperational && err.data),
  });
};

export default errorMiddleware;
