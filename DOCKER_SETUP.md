# 🐳 QR Engine - Docker Setup Guide

Complete Docker setup for the QR Engine Port Clearance Management System.

## 📋 Prerequisites

- **Docker Desktop** installed on your system
  - macOS: https://docs.docker.com/desktop/install/mac-install/
  - Windows: https://docs.docker.com/desktop/install/windows-install/
  - Linux: https://docs.docker.com/engine/install/

## 🚀 Quick Start (3 Commands)

```bash
# 1. Navigate to project directory
cd /Users/apple/Documents/QR-Engine

# 2. Build and start all services
docker-compose up -d

# 3. Open in browser
open http://localhost:3000
```

That's it! Everything is now running.

## 📦 What Gets Started

### 1. **MongoDB Database** (Port 27017)
- Container: `qr-engine-mongodb`
- Database: `qr-engine`
- User: `admin` / Password: `admin123`
- Persistent data storage with Docker volumes

### 2. **QR Engine Application** (Port 3000)
- Container: `qr-engine-app`
- Automatically connects to MongoDB
- Generates PDFs with QR codes
- Full authentication system

### 3. **Mongo Express** (Port 8081) - Optional
- Container: `qr-engine-mongo-express`
- Database admin UI
- Login: `admin` / `admin123`
- View/manage database through web interface

## 🔧 Docker Commands

### Start Everything
```bash
# Start all services in background
docker-compose up -d

# Start and see logs
docker-compose up

# Start specific service
docker-compose up -d app
```

### Stop Everything
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes all data!)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Check Status
```bash
# List running containers
docker-compose ps

# Check health
docker-compose ps
```

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **QR Engine App** | http://localhost:3000 | Create account |
| **Login Page** | http://localhost:3000/login | Your account |
| **Dashboard** | http://localhost:3000/dashboard | After login |
| **Mongo Express** | http://localhost:8081 | admin / admin123 |
| **MongoDB** | localhost:27017 | admin / admin123 |

## 📁 Docker Volumes

Persistent data is stored in Docker volumes:

```yaml
volumes:
  mongodb_data:       # MongoDB database files
  mongodb_config:     # MongoDB configuration
  ./storage:          # Generated PDF files (mounted)
  ./temp:             # Temporary files (mounted)
```

### View Volumes
```bash
# List all volumes
docker volume ls

# Inspect volume
docker volume inspect qr-engine_mongodb_data
```

### Backup Database
```bash
# Export data
docker exec qr-engine-mongodb mongodump \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  --out /backup

# Copy to host
docker cp qr-engine-mongodb:/backup ./mongodb-backup
```

### Restore Database
```bash
# Copy backup to container
docker cp ./mongodb-backup qr-engine-mongodb:/backup

# Restore
docker exec qr-engine-mongodb mongorestore \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  /backup
```

## 🔐 Environment Variables

Edit `docker-compose.yml` to change settings:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - BASE_URL=http://localhost:3000
  - MONGODB_URI=mongodb://admin:admin123@mongodb:27017/qr-engine?authSource=admin
  - JWT_SECRET=your-super-secret-jwt-key-change-in-production-now
  - JWT_EXPIRE=30d
```

### For Production
Change these values:
- `JWT_SECRET`: Generate a strong random key
- `BASE_URL`: Your domain (https://yourdomain.com)
- MongoDB passwords

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app
docker-compose logs mongodb

# Check if ports are in use
lsof -ti:3000
lsof -ti:27017

# Restart services
docker-compose restart
```

### MongoDB Connection Failed
```bash
# Wait for MongoDB to be ready
docker-compose logs mongodb | grep "Waiting for connections"

# Check health
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb
```

### PDF Generation Fails
```bash
# Check Chromium installation in container
docker exec qr-engine-app which chromium-browser

# Check logs
docker-compose logs app | grep "PDF"

# Restart app
docker-compose restart app
```

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Clean Start (Nuclear Option)
```bash
# Stop everything
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Remove images
docker rmi qr-engine-app

# Rebuild from scratch
docker-compose up -d --build
```

## 📊 Monitoring

### Resource Usage
```bash
# Show container stats
docker stats

# Show specific container
docker stats qr-engine-app
```

### Health Checks
```bash
# App health
curl http://localhost:3000

# MongoDB health
docker exec qr-engine-mongodb mongosh \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"
```

## 🔄 Development Workflow

### 1. Code Changes
```bash
# Make your code changes
# Then rebuild and restart
docker-compose up -d --build
```

### 2. Hot Reload (Optional)
Add to docker-compose.yml for development:
```yaml
volumes:
  - ./:/app
  - /app/node_modules
command: npm run dev
```

### 3. Access Container Shell
```bash
# App container
docker exec -it qr-engine-app sh

# MongoDB container
docker exec -it qr-engine-mongodb mongosh \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin
```

## 🚀 Production Deployment

### 1. Update docker-compose.yml
```yaml
environment:
  - NODE_ENV=production
  - BASE_URL=https://yourdomain.com
  - JWT_SECRET=very-strong-random-key-here
  - MONGODB_URI=mongodb://user:pass@mongodb:27017/qr-engine?authSource=admin
```

### 2. Use Docker Compose Override
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'
services:
  app:
    environment:
      - NODE_ENV=production
      - BASE_URL=https://yourdomain.com
```

Deploy:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Behind Nginx/Traefik
Add reverse proxy labels:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.qr-engine.rule=Host(`yourdomain.com`)"
```

## 📱 Testing

### 1. Create Test User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 2. Test Document Creation
```bash
# Get token from login response
TOKEN="your-token-here"

# Create document
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "SERIAL_NO": "DOCKER-TEST-001",
    "VESSEL_NAME": "MV Docker Ship",
    "PORT": "Container Port"
  }'
```

## 🎯 Best Practices

✅ **Always use named volumes** for data persistence
✅ **Don't commit .env files** with secrets
✅ **Use health checks** for all services
✅ **Set restart policies** (unless-stopped)
✅ **Monitor resource usage** in production
✅ **Backup database regularly**
✅ **Use Docker networks** for service isolation
✅ **Keep images updated** (`docker-compose pull`)

## 🆘 Common Issues

### Issue: "Error: Cannot find module"
**Solution**: Rebuild the image
```bash
docker-compose build --no-cache app
docker-compose up -d
```

### Issue: "MongoDB not ready"
**Solution**: Wait for health check
```bash
docker-compose logs mongodb | tail -20
# Wait until you see "Waiting for connections"
```

### Issue: "Port 3000 already in use"
**Solution**: Change port or kill process
```bash
# Option 1: Kill process
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
# Edit docker-compose.yml: "3001:3000"
```

### Issue: "PDF generation timeout"
**Solution**: Increase resources
```bash
# In Docker Desktop:
# Settings > Resources > Increase Memory to 4GB
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🔑 Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| MongoDB | admin | admin123 |
| Mongo Express | admin | admin123 |
| QR Engine | *Create account* | *Your password* |

**⚠️ IMPORTANT**: Change these in production!

---

## ✅ Success Checklist

After running `docker-compose up -d`, verify:

- [ ] All containers are running: `docker-compose ps`
- [ ] App is accessible: `curl http://localhost:3000`
- [ ] MongoDB is healthy: Check logs
- [ ] Can register user at `/register`
- [ ] Can login at `/login`
- [ ] Can create documents in dashboard
- [ ] PDFs generate with QR codes
- [ ] Mongo Express works at port 8081

---

**Version**: 2.0.0 (Dockerized)
**Last Updated**: November 2024

🎉 **Your QR Engine is now running in Docker!**


