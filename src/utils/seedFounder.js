import env from '../config/env.js';
import User from '../models/User.js';
import { logger } from './logger.js';

export const seedFounder = async () => {
  if (!env.FOUNDER_EMAIL) return;

  const founderEmail = env.FOUNDER_EMAIL.trim().toLowerCase();
  try {
    const user = await User.findOne({ email: founderEmail });
    if (user && user.role !== 'founder') {
      user.role = 'founder';
      await user.save();
      logger.info(`👑 Successfully promoted ${founderEmail} to Founder role.`);
    }
  } catch (error) {
    logger.error(`Seed Founder Error: ${error.message}`);
  }
};
