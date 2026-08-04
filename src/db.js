import { logger } from './utils/logger.js';
import mongoose from 'mongoose';
import env from './config/env.js';
import { seedFounder } from '../scripts/seed-founder.js';

const connectDB = async () => {
  const MONGODB_URI = env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    logger.info(`Connected to MongoDB Atlas successfully: ${conn.connection.host}`);
    await seedFounder();
  } catch (error) {
    logger.error(`Failed to connect to MongoDB Atlas: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
  } catch (error) {
    logger.error(`Failed to close MongoDB connection: ${error.message}`);
  }
};

export { connectDB, disconnectDB };
