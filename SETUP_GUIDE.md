# QR Engine - Complete Setup Guide

## 🚀 Features

✅ **User Authentication** - Secure login/register system with JWT
✅ **Document Management** - Create, edit, delete port clearance documents
✅ **QR Code Generation** - Dynamic QR codes that link to PDFs
✅ **Document Expiration** - Set expiration dates, QR codes stop working after expiry
✅ **Modern Dashboard** - Beautiful, responsive UI with Tailwind CSS
✅ **MongoDB Database** - All documents stored in database
✅ **Real-time Status** - Active, Expired, Deleted document states

## 📋 Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (Running locally or MongoDB Atlas)
3. **npm** or **yarn**

## 🔧 Installation

### 1. Install Dependencies

```bash
cd /Users/apple/Documents/QR-Engine
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/qr-engine
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qr-engine

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
JWT_EXPIRE=30d
```

## 🚀 Starting the Application

### 1. Start MongoDB (if using local)
```bash
brew services start mongodb-community
```

### 2. Start the Server
```bash
node server.js
```

You should see:
```
✅ MongoDB connected successfully
🚀 QR Engine Server is running!
📍 Local: http://localhost:3000
📄 Login: http://localhost:3000/login
📊 Dashboard: http://localhost:3000/dashboard
```

## 📱 Using the Application

### Step 1: Register an Account
1. Visit: http://localhost:3000/register
2. Fill in your details:
   - Full Name
   - Email
   - Password (minimum 6 characters)
3. Click "Create Account"

### Step 2: Login
1. Visit: http://localhost:3000/login
2. Enter your email and password
3. Click "Sign In"

### Step 3: Create a Document
1. Click "Create New Document" button
2. Fill in the form:
   - **Required**: Serial No. (e.g., PC-12345)
   - **Optional**: All other fields (English/Farsi pairs)
   - **Optional**: Set expiration date
3. Click "Create Document"
4. PDF will be generated with embedded QR code

### Step 4: Manage Documents
- **View**: Opens PDF in new tab
- **Edit**: Modify document details, regenerates PDF
- **Expire**: Marks document as expired, QR code stops working
- **Delete**: Soft deletes the document

### Step 5: Scan QR Code
1. Open the PDF
2. Scan the QR code with your phone
3. It will open the same PDF in your phone's browser
4. If document is expired/deleted, QR will show error

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Documents (Protected)
- `GET /api/documents` - List all user's documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get single document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `PUT /api/documents/:id/expire` - Expire document
- `GET /api/documents/verify/:serialNo` - Verify document (Public)

### Legacy (Backward Compatible)
- `POST /api/generate-port-clearance` - Generate PDF without auth
- `GET /pdfs/:filename` - View PDF

## 🧪 Testing

### Test with cURL

**1. Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "test123"}'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}' \
  -c cookies.txt
```

**3. Create Document:**
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "SERIAL_NO": "TEST-001",
    "VESSEL_NAME": "MV Test Ship",
    "PORT": "Test Port"
  }'
```

**4. List Documents:**
```bash
curl -X GET http://localhost:3000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Project Structure

```
QR-Engine/
├── controllers/
│   ├── authController.js       # Authentication logic
│   └── documentController.js   # Document CRUD operations
├── middleware/
│   └── auth.js                 # JWT authentication middleware
├── models/
│   ├── User.js                 # User schema
│   └── Document.js             # Document schema
├── public/
│   ├── login.html              # Login page
│   ├── register.html           # Register page
│   ├── dashboard.html          # Dashboard page
│   └── dashboard.js            # Dashboard functionality
├── routes/
│   ├── auth.js                 # Auth routes
│   └── documents.js            # Document routes
├── storage/                    # Generated PDFs
├── temp/                       # Temporary files
├── utils/
│   └── pdfGenerator.js         # PDF generation logic
├── server.js                   # Main server file
├── template.html               # PDF template
└── package.json                # Dependencies
```

## 🎨 Design & Colors

**Primary Colors:**
- Primary: `#00A39C` (Teal)
- Secondary: `#008B84` (Dark Teal)

**Status Colors:**
- Active: Green
- Expired: Yellow
- Deleted: Red

**UI Framework:**
- Tailwind CSS (CDN)
- Inter Font Family
- Responsive Design

## 🔐 Security Features

✅ Password hashing with bcrypt
✅ JWT authentication
✅ HTTP-only cookies
✅ Protected routes
✅ Token expiration (30 days)
✅ Input validation

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB
```bash
brew services start mongodb-community
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Kill process on port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

### QR Code Not Showing
**Solution**: Check that:
1. PDF generation completed successfully
2. QR code base64 is embedded
3. Template has `id="qr-code-img"`

### Document Expiration Not Working
**Solution**: Check that:
1. Expiration date is in the future
2. Date format is correct (ISO 8601)
3. Document status is being updated

## 📊 Database Collections

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date
}
```

### Documents Collection
```javascript
{
  user: ObjectId (ref: User),
  serialNo: String (unique),
  filename: String,
  pdfUrl: String,
  qrCodeUrl: String (base64),
  formData: Object (all form fields),
  status: String (active/expired/deleted),
  expiresAt: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
BASE_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-secret-production-key
```

### Production Considerations
1. Use HTTPS
2. Set secure cookies
3. Use environment variables
4. Enable CORS for specific domains
5. Add rate limiting
6. Implement logging
7. Use process manager (PM2)

## 📝 License

Proprietary - QR Engine Port Clearance System

## 🆘 Support

For issues or questions, contact the development team.

---

**Version**: 2.0.0
**Last Updated**: November 2024

