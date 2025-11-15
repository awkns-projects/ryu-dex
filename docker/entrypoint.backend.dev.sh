#!/bin/sh
# Development entrypoint for Go backend
# Handles database path setup without modifying Go code

set -e

cd /app

# Create data directory if it doesn't exist and set permissions
mkdir -p /app/data
chmod 777 /app/data

# Ensure config.json exists (create from example if needed)
if [ ! -f /app/config.json ]; then
    if [ -f /app/config.json.example ]; then
        echo "📄 Creating config.json from config.json.example"
        cp /app/config.json.example /app/config.json
    else
        echo "⚠️  Warning: config.json not found and no config.json.example available"
        echo "   Creating minimal config.json..."
        cat > /app/config.json <<EOF
{
  "beta_mode": false,
  "registration_enabled": true,
  "leverage": {
    "btc_eth_leverage": 5,
    "altcoin_leverage": 5
  },
  "use_default_coins": true,
  "api_server_port": 8080,
  "jwt_secret": ""
}
EOF
    fi
fi

# Remove config.db if it exists as a directory (from previous failed attempts)
if [ -d /app/config.db ]; then
    echo "⚠️  Removing config.db directory (should be a file/symlink)"
    rm -rf /app/config.db
fi

# Create symlink from config.db to data/config.db if it doesn't exist
# This allows the Go code to use "config.db" while storing it in the volume
if [ ! -f /app/config.db ] && [ ! -L /app/config.db ]; then
    # If data/config.db exists, symlink to it
    if [ -f /app/data/config.db ]; then
        echo "📦 Creating symlink to existing database: config.db -> data/config.db"
        ln -sf /app/data/config.db /app/config.db
    else
        # Create the database file in the data directory and symlink
        echo "📦 Creating new database in data directory and symlinking"
        touch /app/data/config.db
        chmod 666 /app/data/config.db
        ln -sf /app/data/config.db /app/config.db
    fi
elif [ -L /app/config.db ]; then
    echo "✓ Symlink already exists: config.db -> $(readlink /app/config.db)"
else
    echo "⚠️  config.db exists as a regular file, not creating symlink"
fi

# Check if air is installed (hot reload tool)
if command -v air &> /dev/null; then
    echo "🚀 Starting backend with hot reload (air)..."
    exec air
else
    echo "🚀 Starting backend with go run..."
    echo "💡 Tip: Install 'air' for true hot reload: go install github.com/cosmtrek/air@latest"
    exec go run main.go
fi
