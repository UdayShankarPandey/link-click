/**
 * One-time migration: set emailVerified = true for all existing users
 * that predate the email verification feature.
 *
 * IMPORTANT:
 *   - Updates ONLY documents where the emailVerified field does not exist.
 *   - Never overwrites an existing emailVerified value.
 *   - Safe to run multiple times (idempotent).
 *
 * Usage (MongoDB Shell / mongosh):
 *
 *   // 1. Preview — count users that need migration
 *   db.users.countDocuments({ emailVerified: { $exists: false } })
 *
 *   // 2. Run migration
 *   load("scripts/migrate-email-verified.js")
 *
 *   // 3. Verify — count migrated users (should now be 0 pending)
 *   db.users.countDocuments({ emailVerified: { $exists: false } })
 *
 * Usage (Node.js standalone):
 *
 *   MONGODB_URI=<connection-string> node scripts/migrate-email-verified.js
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required.');
  process.exit(1);
}

async function migrate() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  const db = mongoose.connection.db;
  const collection = db.collection('users');

  // Preview: count users that need migration
  const pendingCount = await collection.countDocuments({
    emailVerified: { $exists: false },
  });

  console.log(`Users requiring migration: ${pendingCount}`);

  if (pendingCount === 0) {
    console.log('No migration needed — all users already have emailVerified field.');
    await mongoose.disconnect();
    return;
  }

  // Migrate: set emailVerified = true ONLY where the field does not exist
  const result = await collection.updateMany(
    { emailVerified: { $exists: false } },
    { $set: { emailVerified: true } },
  );

  console.log(`\nMigration complete.`);
  console.log(`  Matched:  ${result.matchedCount}`);
  console.log(`  Modified: ${result.modifiedCount}`);

  // Verify: confirm no users are left without the field
  const remainingCount = await collection.countDocuments({
    emailVerified: { $exists: false },
  });

  console.log(`\nVerification: ${remainingCount} users still missing emailVerified (should be 0).`);

  await mongoose.disconnect();
  console.log('Disconnected.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
