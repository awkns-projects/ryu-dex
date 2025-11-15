#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Ryu Development Environment Quick Start Script
# ═══════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f "env.dev.template" ]; then
        cp env.dev.template .env
        print_info "✓ Created .env from template"
        print_warning "⚠️  Please edit .env and fill in required values:"
        print_warning "   - DATA_ENCRYPTION_KEY (run: ./scripts/setup_encryption.sh)"
        print_warning "   - JWT_SECRET (run: ./scripts/setup_encryption.sh)"
        echo ""
        read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
    else
        print_error "env.dev.template not found. Please create .env manually."
        exit 1
    fi
fi

# Check if config.json exists
if [ ! -f "config.json" ]; then
    print_warning "config.json not found. Creating from template..."
    if [ -f "config.json.example" ]; then
        cp config.json.example config.json
        print_info "✓ Created config.json from template"
    else
        print_warning "config.json.example not found. You may need to create config.json manually."
    fi
fi

# Check encryption setup
if [ ! -f "secrets/rsa_key" ] || [ ! -f "secrets/rsa_key.pub" ]; then
    print_warning "Encryption keys not found. Setting up encryption..."
    if [ -f "scripts/setup_encryption.sh" ]; then
        print_info "Running encryption setup..."
        echo -e "Y\nn\nn" | bash scripts/setup_encryption.sh || {
            print_error "Encryption setup failed. Please run manually: ./scripts/setup_encryption.sh"
            exit 1
        }
        print_success "✓ Encryption keys generated"
    else
        print_warning "scripts/setup_encryption.sh not found. Encryption keys may be required."
    fi
fi

# Start services
print_info "Starting development environment..."
echo ""
print_info "📦 Building images (first time may take 5-10 minutes for TA-Lib compilation)..."
print_info "   Subsequent starts will be much faster!"
echo ""

docker compose -f docker-compose.dev.yml up -d --build

echo ""
print_success "Services started!"
echo ""
print_info "Services:"
print_info "  • PostgreSQL:  localhost:${POSTGRES_PORT:-5432}"
print_info "  • Go Backend:  http://localhost:${NOFX_BACKEND_PORT:-8080}"
print_info "  • Next.js:     http://localhost:${RYU_NEXT_PORT:-3000}"
print_info ""
print_info "📊 Database Visualization Tools:"
print_info "  • pgAdmin (PostgreSQL): http://localhost:${PGADMIN_PORT:-5050}"
print_info "    Login: ${PGADMIN_EMAIL:-admin@ryu.local} / ${PGADMIN_PASSWORD:-admin}"
print_info "    Server: postgres:5432 (use POSTGRES_USER/POSTGRES_PASSWORD from .env)"
print_info "  • SQLite Web Viewer: http://localhost:${SQLITE_WEB_PORT:-8081}"
print_info "    View Go backend's config.db database"
echo ""
print_info "💡 Development Mode Features:"
print_info "  • Source code is mounted as volumes (hot reload enabled)"
print_info "  • Go backend: Code changes don't require image rebuilds"
print_info "  • Next.js: Automatic hot reload on file changes"
print_info "  • Database: Shared SQLite database accessible by both backend and frontend"
print_info "  • Restart containers to apply Go code changes:"
print_info "    docker compose -f docker-compose.dev.yml restart nofx-backend"
echo ""
print_info "Next steps:"
print_info "  1. Wait for services to be healthy (check with: docker compose -f docker-compose.dev.yml ps)"
print_info "  2. Initialize database:"
print_info "     docker compose -f docker-compose.dev.yml exec ryu-next npm run db:migrate"
print_info "  3. Access Next.js app at http://localhost:3000"
echo ""
print_info "Useful commands:"
print_info "  • View logs:    docker compose -f docker-compose.dev.yml logs -f"
print_info "  • View backend logs: docker compose -f docker-compose.dev.yml logs -f nofx-backend"
print_info "  • View frontend logs: docker compose -f docker-compose.dev.yml logs -f ryu-next"
print_info "  • Status:       docker compose -f docker-compose.dev.yml ps"
print_info "  • Restart:      docker compose -f docker-compose.dev.yml restart"
print_info "  • Restart backend only: docker compose -f docker-compose.dev.yml restart nofx-backend"
echo ""
print_info "🛑 Graceful Shutdown:"
print_info "  To stop services gracefully (recommended):"
print_info "    docker compose -f docker-compose.dev.yml down"
print_info ""
print_info "  This will:"
print_info "    • Stop all containers gracefully (30s grace period)"
print_info "    • Preserve all data (databases, volumes remain intact)"
print_info "    • Clean up network resources"
print_info ""
print_info "  To stop and remove volumes (⚠️  deletes all data):"
print_info "    docker compose -f docker-compose.dev.yml down -v"
print_info ""
print_info "  To stop without removing containers:"
print_info "    docker compose -f docker-compose.dev.yml stop"
echo ""

