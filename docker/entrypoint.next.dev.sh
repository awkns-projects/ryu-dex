#!/bin/sh
# Development entrypoint for Next.js
# Sets up database symlink so Next.js can access Go backend's config.db

# Create symlink from /data/config.db to /workspace/config.db
# This allows Next.js code to find ../config.db from /app
if [ -f /data/config.db ] && [ ! -f /workspace/config.db ]; then
  ln -sf /data/config.db /workspace/config.db
  echo "✓ Created symlink: /workspace/config.db -> /data/config.db"
fi

# Start Next.js development server
exec npm run dev

