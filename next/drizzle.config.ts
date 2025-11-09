import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment from local .env file
config({ path: './.env.local' });

export default defineConfig({
  // Use relative paths from the package directory
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // biome-ignore lint: Forbidden non-null assertion.
    url: process.env.POSTGRES_URL!,
  },
});
