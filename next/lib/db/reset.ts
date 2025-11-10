import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';
import { resolve } from 'path';

// Load environment from packages/app/.env
config({
  path: resolve(__dirname, '../../.env.local'),
});

const runReset = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('🚨 WARNING: This will DROP ALL TABLES and recreate them!');
  console.log('⏳ Resetting database...');

  const start = Date.now();

  try {
    // Drop all tables using CASCADE to handle all foreign key dependencies
    console.log('🗑️  Dropping all tables...');

    // Use DROP SCHEMA CASCADE to drop everything at once
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    await db.execute(sql`CREATE SCHEMA public;`);

    console.log('✅ All tables dropped and schema recreated');

    // Recreate tables by pushing schema
    console.log('📝 Recreating tables from schema...');

    const end = Date.now();
    console.log('✅ Database reset completed in', end - start, 'ms');

    // Close the connection and wait a moment for it to fully close
    await connection.end();

    console.log('🔌 Connection closed');
    console.log('⚠️  Database is now empty. The chained drizzle-kit push will recreate tables.');

    // Give a moment for the connection to fully close
    await new Promise(resolve => setTimeout(resolve, 500));

    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err);
    try {
      await connection.end();
    } catch {
      // Ignore connection close errors
    }
    process.exit(1);
  }
};

runReset().catch((err) => {
  console.error('❌ Reset failed');
  console.error(err);
  process.exit(1);
});

