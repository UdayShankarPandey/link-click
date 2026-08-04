import mongoose from 'mongoose';
import env from '../src/config/env.js';
import { seedFounder } from '../src/utils/seedFounder.js';

export { seedFounder };

// If run directly via node scripts/seed-founder.js
if (process.argv[1]?.includes('seed-founder.js')) {
  try {
    await mongoose.connect(env.MONGODB_URI);
    await seedFounder();
    console.log('Founder seed check complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
