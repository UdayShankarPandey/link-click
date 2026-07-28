import { logger } from './utils/logger.js';
import env from './config/env.js';
import { connectDB, disconnectDB } from './db.js';
import app from './app.js';

const PORT = env.PORT;

let server;
let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      logger.info(`Server is running and listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

await startServer();

const gracefulShutdown = (signal) => {
  if (isShuttingDown) {
    logger.warn(`${signal} received while shutdown is already in progress.`);
    return;
  }

  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  const forceShutdownTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);

  forceShutdownTimer.unref();

  if (!server) {
    disconnectDB().finally(() => {
      clearTimeout(forceShutdownTimer);
      process.exit(0);
    });
    return;
  }

  server.close(async () => {
    clearTimeout(forceShutdownTimer);

    logger.info('HTTP server closed.');

    await disconnectDB();

    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
