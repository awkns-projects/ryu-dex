# Docker Compose Development Setup

This docker-compose file sets up a complete local development environment for the Ryu project, including:

- **PostgreSQL Database** - For Next.js app data storage
- **Go Backend** - NOFX trading system API
- **Next.js Frontend** - Ryu web application

## Quick Start

### 1. Prepare Environment Variables

```bash
# Copy the example environment file
cp .env.example.dev .env

# Edit .env and fill in required values
nano .env
```

**Required variables:**
- `DATA_ENCRYPTION_KEY` - Generate using: `./scripts/setup_encryption.sh`
- `JWT_SECRET` - Generate using: `./scripts/setup_encryption.sh`

### 2. Prepare Configuration Files

```bash
# Copy config template if it doesn't exist
cp config.json.example config.json
```

### 3. Start All Services

```bash
# Build and start all services
docker compose -f docker-compose.dev.yml up -d --build

# Or for development with logs
docker compose -f docker-compose.dev.yml up --build
```

### 4. Initialize Database

After services are running, initialize the Prisma database:

```bash
# Run migrations
docker compose -f docker-compose.dev.yml exec ryu-next npm run db:migrate

# Or generate Prisma client and push schema (development)
docker compose -f docker-compose.dev.yml exec ryu-next npm run db:push
```

### 5. Access Services

- **Next.js Frontend**: http://localhost:3000
- **Go Backend API**: http://localhost:8080
- **PostgreSQL Database**: localhost:5432
  - User: `ryu_user` (or your POSTGRES_USER)
  - Password: `ryu_password` (or your POSTGRES_PASSWORD)
  - Database: `ryu_db` (or your POSTGRES_DB)

## Development Workflow

### View Logs

```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f ryu-next
docker compose -f docker-compose.dev.yml logs -f nofx-backend
docker compose -f docker-compose.dev.yml logs -f postgres
```

### Execute Commands in Containers

```bash
# Next.js container (run migrations, etc.)
docker compose -f docker-compose.dev.yml exec ryu-next npm run db:studio
docker compose -f docker-compose.dev.yml exec ryu-next npm run db:migrate:dev

# PostgreSQL container (direct database access)
docker compose -f docker-compose.dev.yml exec postgres psql -U ryu_user -d ryu_db
```

### Restart Services

```bash
# Restart all services
docker compose -f docker-compose.dev.yml restart

# Restart specific service
docker compose -f docker-compose.dev.yml restart ryu-next
```

### Stop Services

```bash
# Stop all services (keeps data)
docker compose -f docker-compose.dev.yml stop

# Stop and remove containers (keeps volumes/data)
docker compose -f docker-compose.dev.yml down

# Stop and remove everything including volumes (⚠️ deletes data)
docker compose -f docker-compose.dev.yml down -v
```

## Hot Reload Development

Both services support hot reload for fast development:

### Next.js Frontend
- Source code is mounted as a volume: `./next:/app`
- Node modules are excluded from mount (uses container's node_modules)
- Changes to files in `next/` directory will trigger hot reload automatically

### Go Backend
- Source code is mounted as a volume: `.:/app`
- Go modules are pre-downloaded in the image (faster startup)
- Uses `go run main.go` for development (no image rebuild needed)
- Large directories (node_modules, .next, etc.) are excluded via anonymous volumes
- **First build**: Takes time to build TA-Lib and download Go modules (cached after first build)
- **Subsequent starts**: Very fast - just mounts volumes and runs

**Performance Tips:**
- First build may take 5-10 minutes (TA-Lib compilation + Go module download)
- Subsequent `docker compose up` starts in seconds
- Code changes don't require image rebuilds - just restart the container if needed
- For true hot reload with Go, consider installing `air` tool (see below)

**Note**: For production builds, use the production Dockerfiles (`Dockerfile.backend` and `Dockerfile.next`) instead.

## Database Management

### Prisma Studio (Database GUI)

```bash
docker compose -f docker-compose.dev.yml exec ryu-next npm run db:studio
```

Then access Prisma Studio at: http://localhost:5555

### Direct PostgreSQL Access

```bash
# Connect to database
docker compose -f docker-compose.dev.yml exec postgres psql -U ryu_user -d ryu_db

# Or from host machine (if you have psql installed)
psql -h localhost -p 5432 -U ryu_user -d ryu_db
```

### Backup Database

```bash
# Create backup
docker compose -f docker-compose.dev.yml exec postgres pg_dump -U ryu_user ryu_db > backup.sql

# Restore backup
docker compose -f docker-compose.dev.yml exec -T postgres psql -U ryu_user ryu_db < backup.sql
```

## Optional: Go Hot Reload with Air

For true hot reload of Go code (auto-restart on file changes), you can use the `air` tool:

1. **Install air in the Dockerfile** (uncomment the line in `docker/Dockerfile.backend.dev`):
   ```dockerfile
   RUN go install github.com/cosmtrek/air@latest
   ```

2. **Use the entrypoint script** (update the Dockerfile to use the entrypoint):
   ```dockerfile
   COPY docker/entrypoint.backend.dev.sh /entrypoint.sh
   RUN chmod +x /entrypoint.sh
   ENTRYPOINT ["/entrypoint.sh"]
   ```

3. **Rebuild the container**:
   ```bash
   docker compose -f docker-compose.dev.yml build nofx-backend
   docker compose -f docker-compose.dev.yml up -d
   ```

Alternatively, you can install `air` manually in the container:
```bash
docker compose -f docker-compose.dev.yml exec nofx-backend go install github.com/cosmtrek/air@latest
```

## Troubleshooting

### Services Won't Start

1. **Check if ports are already in use:**
   ```bash
   # Check port 3000
   lsof -i :3000
   # Check port 8080
   lsof -i :8080
   # Check port 5432
   lsof -i :5432
   ```

2. **Check logs for errors:**
   ```bash
   docker compose -f docker-compose.dev.yml logs
   ```

3. **Verify environment variables:**
   ```bash
   # Check if .env file exists and has required values
   cat .env | grep -E "DATA_ENCRYPTION_KEY|JWT_SECRET"
   ```

### Database Connection Issues

1. **Wait for database to be ready:**
   ```bash
   # Check database health
   docker compose -f docker-compose.dev.yml ps postgres
   ```

2. **Verify DATABASE_URL:**
   ```bash
   docker compose -f docker-compose.dev.yml exec ryu-next printenv DATABASE_URL
   ```

### Next.js Build Errors

1. **Clear Next.js cache:**
   ```bash
   docker compose -f docker-compose.dev.yml exec ryu-next rm -rf .next
   ```

2. **Reinstall dependencies:**
   ```bash
   docker compose -f docker-compose.dev.yml exec ryu-next npm install
   ```

### Go Backend Issues

1. **Check if config.json exists:**
   ```bash
   ls -la config.json
   ```

2. **Verify encryption setup:**
   ```bash
   ls -la secrets/rsa_key*
   ```

## Production vs Development

This compose file is configured for **development**. For production:

1. Change `NODE_ENV=production` in `.env`
2. Modify Next.js service to use production build:
   ```yaml
   command: npm start  # instead of npm run dev
   ```
3. Remove volume mounts for source code
4. Use production-ready secrets management
5. Set up proper SSL/TLS certificates

## Service Dependencies

```
postgres (healthy)
    ↓
nofx-backend (depends on postgres)
    ↓
ryu-next (depends on postgres + nofx-backend)
```

Services start in order: postgres → nofx-backend → ryu-next

## Network

All services are on the `ryu-network` bridge network and can communicate using service names:
- `postgres` - Database hostname
- `nofx-backend` - Go backend hostname
- `ryu-next` - Next.js hostname

## Volumes

- `postgres_data` - Persistent PostgreSQL data
- `./config.db` - Go backend SQLite database (if used)
- `./decision_logs` - Trading decision logs
- `./secrets` - Encryption keys (read-only mount)

## Health Checks

All services have health checks configured:
- **postgres**: Checks if database is ready to accept connections
- **nofx-backend**: Checks `/api/health` endpoint
- **ryu-next**: Checks if web server responds

Use `docker compose ps` to see health status.

