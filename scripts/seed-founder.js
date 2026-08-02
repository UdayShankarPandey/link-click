import mongoose from 'mongoose';
import env from '../src/config/env.js';
import User from '../src/models/User.js';
import { logger } from '../src/utils/logger.js';

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

// If run directly via node scripts/seed-founder.js
if (process.argv[1]?.includes('seed-founder.js')) {
  mongoose.connect(env.MONGODB_URI)
    .then(async () => {
      await seedFounder();
      console.log('Founder seed check complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
