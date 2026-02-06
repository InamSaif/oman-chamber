# Installation Guide - QR Engine

Complete step-by-step installation guide for the QR Engine Port Clearance PDF System.

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **RAM**: 2GB minimum
- **Disk Space**: 500MB (including dependencies)
- **OS**: Windows, macOS, or Linux

### Check Your Versions
```bash
node --version    # Should show v14 or higher
npm --version     # Should show v6 or higher
```

### Don't Have Node.js?
Download from: https://nodejs.org/

---

## 🚀 Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd /Users/apple/Documents/QR-Engine
```

### Step 2: Install Dependencies

```bash
npm install
```

**What gets installed:**
- express (4.18.2) - Web server
- puppeteer (21.6.1) - PDF generation
- qrcode (1.5.3) - QR code creation
- pdf-lib (1.17.1) - PDF manipulation
- cors (2.8.5) - Cross-origin support
- dotenv (16.3.1) - Environment config
- uuid (9.0.1) - Unique IDs
- multer (1.4.5-lts.1) - File uploads

**Expected output:**
```
added 345 packages, and audited 346 packages in 45s
```

### Step 3: Create Environment File (Optional)

The system works with default settings, but you can customize:

Create a file named `.env` in the project root:
```bash
touch .env
```

Add these lines:
```env
PORT=3000
BASE_URL=http://localhost:3000
UPLOAD_DIR=./uploads
STORAGE_DIR=./storage
```

### Step 4: Start the Server

```bash
npm start
```

**Expected output:**
```
🚀 QR Engine Server is running!
📍 Local: http://localhost:3000
📄 API Endpoint: POST http://localhost:3000/api/generate-port-clearance

Ready to generate Port Clearance PDFs with dynamic QR codes!
```

### Step 5: Verify Installation

Open your browser and go to:
```
http://localhost:3000
```

You should see:
```json
{
  "message": "QR Engine - Port Clearance PDF System",
  "version": "1.0.0",
  "endpoints": {
    "generatePC": "POST /api/generate-port-clearance",
    "viewPDF": "GET /pdfs/:filename"
  }
}
```

---

## 🧪 Test the System

### Option 1: Web Interface (Easiest)

1. Open `test-api.html` in your browser:
   ```bash
   open test-api.html
   ```

2. Click **"Fill Sample Data"**

3. Click **"Generate Port Clearance PDF"**

4. View your generated PDF!

### Option 2: Command Line

**macOS/Linux:**
```bash
./test-curl.sh
```

**Windows:**
```bash
test-curl.bat
```

### Option 3: Manual cURL

```bash
curl -X POST http://localhost:3000/api/generate-port-clearance \
  -H "Content-Type: application/json" \
  -d @example-request.json
```

---

## 📁 Directory Structure After Installation

```
QR-Engine/
├── node_modules/          ✅ Created by npm install
├── storage/               ✅ Auto-created on first PDF generation
├── temp/                  ✅ Auto-created on first PDF generation
├── utils/
│   └── pdfGenerator.js
├── server.js
├── template.html
├── test-api.html
├── package.json
└── ... (other files)
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
npm install
```

### Issue: "Port 3000 is already in use"

**Solution 1:** Change the port
```bash
PORT=8080 npm start
```

**Solution 2:** Kill the process using port 3000
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### Issue: "Puppeteer fails to launch Chrome"

**Ubuntu/Debian:**
```bash
sudo apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libwayland-client0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxkbcommon0 \
  libxrandr2 \
  xdg-utils
```

**CentOS/RHEL:**
```bash
sudo yum install -y \
  chromium \
  liberation-fonts \
  alsa-lib \
  atk \
  at-spi2-atk \
  cups-libs \
  dbus-libs \
  libdrm \
  libgbm \
  gtk3 \
  nspr \
  nss \
  libwayland-client \
  libXcomposite \
  libXdamage \
  libXfixes \
  libxkbcommon \
  libXrandr
```

### Issue: "EACCES: permission denied"

**Solution:**
```bash
# Fix directory permissions
chmod -R 755 storage temp

# If still issues, run with sudo (not recommended)
sudo npm start
```

### Issue: "Module not found: dotenv"

**Solution:**
```bash
npm install dotenv --save
```

### Issue: PDF generation takes too long

**Possible causes:**
1. Slow internet (Puppeteer downloading Chromium)
2. Low memory
3. Complex template

**Solutions:**
- Wait for first-time Chromium download
- Increase Node memory: `node --max-old-space-size=4096 server.js`
- Simplify template (remove images)

---

## 🔧 Configuration Options

### Change Server Port

**Method 1:** Environment variable
```bash
PORT=8080 npm start
```

**Method 2:** .env file
```env
PORT=8080
```

### Change Base URL

For production deployment:
```env
BASE_URL=https://yourdomain.com
```

### Change Storage Directory

```env
STORAGE_DIR=/var/www/pdfs
```

---

## ✅ Verification Checklist

After installation, verify:

- [ ] `npm install` completed without errors
- [ ] Server starts on port 3000 (or custom port)
- [ ] http://localhost:3000 returns JSON response
- [ ] `storage/` directory is created
- [ ] `temp/` directory is created
- [ ] Test API generates a PDF successfully
- [ ] PDF contains QR code in top-left corner
- [ ] QR code scans and opens the PDF
- [ ] PDF fields are filled with correct data

---

## 🎯 Next Steps

After successful installation:

1. **Read the documentation**
   - `README.md` - Complete API documentation
   - `QUICK_START.md` - Quick reference guide
   - `PROJECT_OVERVIEW.md` - System architecture

2. **Try the examples**
   - `test-api.html` - Web interface
   - `example-request.json` - Sample data
   - Test scripts - Automated testing

3. **Customize the system**
   - Modify `template.html` for your design
   - Add fields in `utils/pdfGenerator.js`
   - Update styling and colors

4. **Deploy to production**
   - See README.md deployment section
   - Configure HTTPS/SSL
   - Add authentication
   - Setup cloud storage

---

## 📞 Getting Help

### Check Logs

Server logs show detailed information:
```bash
npm start
# Watch the console output for errors
```

### Test Individual Components

**Test QR generation:**
```bash
node -e "const QR = require('qrcode'); QR.toDataURL('test').then(console.log)"
```

**Test Puppeteer:**
```bash
node -e "const puppeteer = require('puppeteer'); puppeteer.launch().then(b => { console.log('OK'); b.close(); })"
```

### Common Commands

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force

# Update packages
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🔄 Uninstallation

To completely remove the system:

```bash
# Stop the server (Ctrl+C)

# Remove dependencies
rm -rf node_modules

# Remove generated files
rm -rf storage temp

# Remove lock file
rm package-lock.json

# Optional: Remove the entire project
cd ..
rm -rf QR-Engine
```

---

## 📊 Installation Requirements Summary

| Component | Requirement | Purpose |
|-----------|-------------|---------|
| Node.js | ≥ v14.0.0 | Runtime environment |
| npm | ≥ v6.0.0 | Package manager |
| Disk Space | ~500 MB | Dependencies + Chromium |
| RAM | ≥ 2 GB | PDF generation |
| Network | Internet | Install packages (first time) |

---

## 🎉 Installation Complete!

If you've completed all steps successfully, your QR Engine is ready to use!

**Quick Test:**
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Test API
curl -X POST http://localhost:3000/api/generate-port-clearance \
  -H "Content-Type: application/json" \
  -d '{"SERIAL_NO":"TEST-001"}'
```

**Result:** You should get a JSON response with a PDF URL!

---

**🚢 Welcome to QR Engine! Happy PDF Generating!**

