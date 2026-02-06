# 🚢 QR Engine - Port Clearance Management System

A complete port clearance document management system with QR code generation, user authentication, and document expiration tracking.

## 🚀 Quick Start with Docker (Recommended)

### Requirements
- Docker Desktop installed

### Start in 3 Commands
```bash
cd /Users/apple/Documents/QR-Engine
docker-compose up -d
open http://localhost:3000
```

✅ **That's it!** MongoDB, App, and Admin UI are now running.

## 📖 Full Documentation

- **[Docker Setup Guide](DOCKER_SETUP.md)** - Complete Docker documentation
- **[Manual Setup Guide](SETUP_GUIDE.md)** - Install without Docker
- **[Project Overview](PROJECT_OVERVIEW.md)** - Architecture and features

## 🌟 Features

### ✨ User Management
- 🔐 Secure authentication (JWT)
- 👤 User registration and login
- 🔑 Password hashing with bcrypt
- 🎫 Token-based sessions (30-day expiry)

### 📄 Document Management
- ➕ Create port clearance documents
- ✏️ Edit existing documents
- 🗑️ Delete documents
- ⏰ Set expiration dates
- 📋 List all your documents
- 🔍 Search and filter

### 🔲 QR Code Integration
- ✅ Dynamic QR code generation
- 📱 Scan to view PDF
- 🔒 Automatic expiration handling
- ❌ Expired QR codes stop working
- ✨ Embedded in PDF

### 🎨 Modern UI
- 💅 Beautiful Tailwind CSS design
- 📱 Fully responsive
- 🎯 Intuitive dashboard
- 📊 Document statistics
- 🌊 Smooth animations

## 🎯 Services

When running with Docker, you get:

| Service | URL | Purpose |
|---------|-----|---------|
| **QR Engine** | http://localhost:3000 | Main application |
| **MongoDB** | localhost:27017 | Database |
| **Mongo Express** | http://localhost:8081 | Database admin UI |

## 📸 Screenshots

### Login Page
Modern, secure authentication

### Dashboard
View all your documents with statistics

### Document Form
Create/edit port clearance documents

### PDF with QR Code
Generated PDF with embedded, scannable QR code

## 🔧 Technology Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Puppeteer (PDF generation)
- QRCode library

**Frontend:**
- Tailwind CSS
- Vanilla JavaScript
- Responsive design
- Modern UI components

**DevOps:**
- Docker + Docker Compose
- Multi-container setup
- Persistent volumes
- Health checks

## 📊 Architecture

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐     ┌──────────────┐
│   QR Engine App │────→│   MongoDB    │
│   (Node.js)     │     │   Database   │
└─────────────────┘     └──────────────┘
         │
         ↓
┌─────────────────┐
│  PDF Generator  │
│  (Puppeteer)    │
└─────────────────┘
```

## 🚀 Usage

### 1. Register an Account
```
http://localhost:3000/register
```

### 2. Login
```
http://localhost:3000/login
```

### 3. Create Document
- Click "Create New Document"
- Fill in Serial No. (required)
- Add other fields as needed
- Set expiration (optional)
- Click "Create Document"

### 4. Manage Documents
- **View**: Open PDF in new tab
- **Edit**: Update and regenerate PDF
- **Expire**: Mark as expired (QR stops working)
- **Delete**: Remove document

### 5. Scan QR Code
- Open generated PDF
- Scan QR code with phone
- PDF opens in browser
- If expired, shows error

## 🔐 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ Protected API routes
- ✅ Input validation
- ✅ User isolation (own documents only)
- ✅ Secure MongoDB connection

## 🐳 Docker Commands Cheatsheet

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# Check status
docker-compose ps

# Access MongoDB shell
docker exec -it qr-engine-mongodb mongosh \
  --username admin --password admin123 \
  --authenticationDatabase admin
```

## 📱 API Endpoints

### Authentication
```
POST   /api/auth/register   - Register user
POST   /api/auth/login      - Login user
GET    /api/auth/me         - Get current user
GET    /api/auth/logout     - Logout user
```

### Documents (Protected)
```
GET    /api/documents           - List all documents
POST   /api/documents           - Create document
GET    /api/documents/:id       - Get document
PUT    /api/documents/:id       - Update document
DELETE /api/documents/:id       - Delete document
PUT    /api/documents/:id/expire - Expire document
```

### Public
```
GET    /api/documents/verify/:serialNo - Verify document
GET    /pdfs/:filename                 - View PDF
```

## 🧪 Testing

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

### Create Document
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"SERIAL_NO":"TEST-001","VESSEL_NAME":"MV Test"}'
```

## 📦 Environment Variables

Set in `docker-compose.yml`:

```yaml
NODE_ENV=production
PORT=3000
BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/qr-engine?authSource=admin
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=30d
```

## 🆘 Troubleshooting

### Services won't start
```bash
docker-compose logs
docker-compose restart
```

### Port already in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

### PDF generation fails
```bash
docker-compose logs app
docker-compose restart app
```

## 📚 Documentation

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Complete Docker guide with troubleshooting
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Manual setup without Docker
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Detailed architecture

## 🎉 Success Checklist

After running `docker-compose up -d`:

- [ ] Visit http://localhost:3000 ✅
- [ ] Register an account ✅
- [ ] Login successfully ✅
- [ ] Create a document ✅
- [ ] View generated PDF ✅
- [ ] Scan QR code with phone ✅
- [ ] Edit a document ✅
- [ ] Expire a document ✅
- [ ] Check Mongo Express at http://localhost:8081 ✅

## 🔑 Default Credentials

**MongoDB & Mongo Express:**
- Username: `admin`
- Password: `admin123`

**QR Engine:**
- Create your own account at `/register`

⚠️ **Change MongoDB credentials in production!**

## 🤝 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Restart services: `docker-compose restart`
3. Review [DOCKER_SETUP.md](DOCKER_SETUP.md)
4. Check MongoDB connection
5. Verify all containers are running: `docker-compose ps`

## 📝 License

Proprietary - QR Engine System

---

**Version**: 2.0.0 (Docker Edition)

🐳 **Powered by Docker | Built with Node.js | Secured with JWT | Styled with Tailwind**

Made with ❤️ for Port Management


