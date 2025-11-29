# NHS EPROMS - Production Deployment Guide

## Prerequisites

- VPS with Docker and Docker Compose installed
- Traefik reverse proxy configured (dtc-base_traefik network)
- PostgreSQL database (external, not containerized for production)
- Domain: doctorsthatcode.com with DNS configured

## Deployment Path

The application will be deployed at: `https://doctorsthatcode.com/client/eproms/`

## Setup Instructions

### 1. Clone the Repository

```bash
cd /opt
git clone <your-repo-url> DTC_eProms
cd DTC_eProms
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
nano .env
```

Add the following production configurations:

```env
# Production mode
NODE_ENV=production

# Database (external PostgreSQL)
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=eproms_db
DB_USER=eproms_user
DB_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://doctorsthatcode.com/client/eproms

# Domain
DOMAIN=doctorsthatcode.com

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Build and Deploy with Production Profile

The unified `docker-compose.yml` uses profiles:
- **dev** profile: Local development with PostgreSQL container
- **prod** profile: Production deployment without PostgreSQL

Deploy to production:

```bash
# Build the containers
docker compose --profile prod build

# Start the services
docker compose --profile prod up -d
```

### 4. Verify Deployment

Check container status:
```bash
docker compose --profile prod ps
```

Check logs:
```bash
docker compose --profile prod logs -f backend-prod
docker compose --profile prod logs -f frontend
```

### 5. Database Setup

Ensure your external PostgreSQL database is set up:

```sql
CREATE DATABASE eproms_db;
CREATE USER eproms_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE eproms_db TO eproms_user;
```

Then run migrations or initialization scripts as needed.

### 6. Access the Application

Navigate to: `https://doctorsthatcode.com/client/eproms/`

## Container Details

### Backend Container (Production)
- **Service:** backend-prod
- **Name:** eproms-backend
- **Port:** 3001 (internal only)
- **Network:** eproms-network
- **Health Check:** `/health` endpoint

### Frontend Container
- **Service:** frontend
- **Name:** eproms-frontend
- **Port:** 80 (internal only)
- **Networks:** eproms-network, dtc-base_traefik
- **Exposed via:** Traefik reverse proxy
- **Route:** `/client/eproms/`

## Traefik Configuration

The frontend container uses these Traefik labels:
- Host: `doctorsthatcode.com` (configurable via DOMAIN env var)
- Path Prefix: `/client/eproms/`
- TLS: Let's Encrypt (letsencrypt resolver)
- Priority: 100

## Development vs Production

### Development Mode
```bash
# Start with dev profile (includes PostgreSQL)
docker compose --profile dev up -d

# Access at http://localhost:3000
```

### Production Mode
```bash
# Start with prod profile (no PostgreSQL, uses external DB)
docker compose --profile prod up -d

# Access via Traefik at https://doctorsthatcode.com/client/eproms/
```

## Updating the Application

```bash
cd /opt/DTC_eProms

# Pull latest changes
git pull

# Rebuild and restart
docker compose --profile prod down
docker compose --profile prod build
docker compose --profile prod up -d
```

## Troubleshooting

### Check Container Logs
```bash
docker compose --profile prod logs -f backend-prod
docker compose --profile prod logs -f frontend
```

### Check Container Health
```bash
docker inspect eproms-backend | grep -A 10 Health
docker inspect eproms-frontend | grep -A 10 Health
```

### Access Backend Container
```bash
docker exec -it eproms-backend sh
```

### Access Frontend Container
```bash
docker exec -it eproms-frontend sh
```

### Test Backend Health Endpoint
```bash
docker exec eproms-backend wget -O- http://localhost:3001/health
```

### Common Issues

**Frontend not loading:**
- Check Traefik labels are correct
- Verify dtc-base_traefik network exists: `docker network ls`
- Check nginx configuration in frontend container
- Verify Traefik is routing correctly

**API calls failing:**
- Verify backend container is running
- Check backend health endpoint
- Verify nginx proxy configuration for `/client/eproms/api/`
- Check backend logs for errors

**Database connection errors:**
- Check database credentials in .env file
- Verify database is accessible from backend container
- Test connection: `docker exec eproms-backend sh -c 'nc -zv $DB_HOST $DB_PORT'`
- Check database host/port configuration

**Container won't start:**
- Check logs: `docker compose --profile prod logs backend-prod`
- Verify all required environment variables are set
- Check if ports are already in use
- Verify external network exists: `docker network inspect dtc-base_traefik`

## Backup and Maintenance

### Database Backup
```bash
# Backup external database
pg_dump -h your-postgres-host -U eproms_user -d eproms_db > backup_$(date +%Y%m%d).sql
```

### View All Running Services
```bash
docker compose --profile prod ps
```

### Stop All Services
```bash
docker compose --profile prod down
```

### Remove All Containers and Volumes
```bash
docker compose --profile prod down -v
```

## Security Considerations

- **JWT_SECRET** should be a strong, randomly generated key (use `openssl rand -base64 32`)
- Database credentials should be unique and strong
- Keep all dependencies updated
- Regularly backup the database
- Monitor container logs for suspicious activity
- Use HTTPS only (enforced by Traefik)
- Never commit `.env` file to version control

## Environment Variables Reference

Required environment variables for production:
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS
- `DOMAIN` - Domain name for Traefik

See `backend/.env.example` for all available configuration options.

## Quick Reference

### Production Deployment
```bash
docker compose --profile prod up -d
```

### Development Mode
```bash
docker compose --profile dev up -d
```

### View Logs
```bash
docker compose logs -f
```

### Restart Services
```bash
docker compose --profile prod restart
```

### Check Status
```bash
docker compose --profile prod ps
```
