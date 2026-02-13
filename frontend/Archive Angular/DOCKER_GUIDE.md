# FamLink Docker Configuration Guide

This guide explains how to set up and run FamLink using Docker containers.

## 🏗️ Architecture Overview

FamLink uses a microservices architecture with the following components:

- **Frontend**: Angular application served by Nginx
- **Backend**: FastAPI Python application
- **Database**: PostgreSQL with extensions
- **Cache**: Redis for session management and caching
- **Reverse Proxy**: Nginx for load balancing and SSL termination
- **Monitoring**: Prometheus and Grafana (optional)

## 📋 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- At least 4GB RAM available for containers
- Ports 80, 443, 4200, 8000, 5432, 6379 available

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd famlink
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
# Important: Update AWS Cognito credentials, JWT secrets, etc.
```

### 3. Run Setup Script

**Linux/Mac:**
```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

**Windows:**
```cmd
scripts\docker-setup.bat
```

### 4. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 🔧 Manual Setup

If you prefer to set up manually:

### Development Environment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# With monitoring
docker-compose -f docker-compose.prod.yml up -d prometheus grafana
```

## 📁 File Structure

```
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── Dockerfile.frontend         # Frontend production build
├── backend/
│   └── Dockerfile              # Backend container
├── nginx/
│   ├── nginx.conf              # Development proxy config
│   ├── nginx.prod.conf         # Production proxy config
│   ├── frontend.conf           # Frontend-specific config
│   └── conf.d/
│       └── locations.conf      # Shared location blocks
├── monitoring/
│   └── prometheus.yml          # Monitoring configuration
└── scripts/
    ├── docker-setup.sh         # Setup script (Linux/Mac)
    ├── docker-setup.bat        # Setup script (Windows)
    ├── docker-cleanup.sh       # Cleanup script
    └── docker-logs.sh          # Log viewing script
```

## 🔐 Environment Variables

Key environment variables to configure:

### Database
```env
DATABASE_URL=postgresql+asyncpg://famlink_user:famlink_password@postgres:5432/famlink
POSTGRES_USER=famlink_user
POSTGRES_PASSWORD=famlink_password
```

### AWS Cognito
```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id
COGNITO_CLIENT_SECRET=your_client_secret
```

### Security
```env
JWT_SECRET_KEY=your_jwt_secret_key_here
ENCRYPTION_KEY=your_32_character_encryption_key
```

### External Services
```env
OPENAI_API_KEY=your_openai_api_key
S3_BUCKET_NAME=famlink-storage
```

## 🛠️ Common Commands

### Service Management
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Restart service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Logs and Debugging
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend

# Execute command in container
docker-compose exec backend bash
docker-compose exec postgres psql -U famlink_user -d famlink
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend python scripts/run_migration.py

# Access database
docker-compose exec postgres psql -U famlink_user -d famlink

# Backup database
docker-compose exec postgres pg_dump -U famlink_user famlink > backup.sql

# Restore database
docker-compose exec -T postgres psql -U famlink_user famlink < backup.sql
```

## 🔍 Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8000/api/v1/health
curl http://localhost/health
```

## 📊 Monitoring

### Prometheus Metrics
- **URL**: http://localhost:9090
- **Targets**: Backend, Nginx, PostgreSQL, Redis

### Grafana Dashboards
- **URL**: http://localhost:3000
- **Default Login**: admin/admin (change in production)

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :4200
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Verify database is ready
   docker-compose exec postgres pg_isready -U famlink_user
   ```

4. **Frontend Build Issues**
   ```bash
   # Clear node_modules and rebuild
   docker-compose down
   docker-compose build --no-cache frontend
   docker-compose up -d
   ```

### Performance Tuning

1. **Increase Memory Limits**
   ```yaml
   # In docker-compose.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

2. **Enable Nginx Caching**
   ```nginx
   # In nginx configuration
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
   ```

## 🔒 Security Considerations

### Development
- Default passwords are used (change for production)
- HTTP only (no SSL)
- Debug mode enabled

### Production
- Use strong passwords and secrets
- Enable SSL/TLS with proper certificates
- Disable debug mode
- Use environment-specific configurations
- Implement proper logging and monitoring

### SSL Setup
```bash
# Generate self-signed certificates (development only)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# For production, use Let's Encrypt or proper CA certificates
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# Scale backend instances
docker-compose up -d --scale backend=3

# Use load balancer
upstream backend {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}
```

### Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 🧹 Cleanup

### Remove Everything
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v --remove-orphans

# Remove images
docker rmi $(docker images -q famlink*)

# Or use cleanup script
./scripts/docker-cleanup.sh
```

### Selective Cleanup
```bash
# Remove only containers
docker-compose down

# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [PostgreSQL Docker Guide](https://hub.docker.com/_/postgres)
- [Redis Docker Guide](https://hub.docker.com/_/redis)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify service health: `docker-compose ps`
3. Check environment variables: `docker-compose config`
4. Review this guide and documentation
5. Create an issue in the project repository