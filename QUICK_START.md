# Quick Start Guide - QR Engine

Get your QR Engine up and running in 3 simple steps!

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `puppeteer` - HTML to PDF conversion
- `qrcode` - QR code generation
- `pdf-lib` - PDF manipulation
- `multer` - File upload handling
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `uuid` - Unique ID generation

### Step 2: Start the Server

```bash
npm start
```

You should see:
```
🚀 QR Engine Server is running!
📍 Local: http://localhost:3000
📄 API Endpoint: POST http://localhost:3000/api/generate-port-clearance

Ready to generate Port Clearance PDFs with dynamic QR codes!
```

### Step 3: Test the API

Open the test interface in your browser:

```bash
open test-api.html
```

Or navigate to: `file:///path/to/QR-Engine/test-api.html`

Click **"Fill Sample Data"** → **"Generate Port Clearance PDF"** → View your generated PDF!

## 📡 Test with cURL

```bash
curl -X POST http://localhost:3000/api/generate-port-clearance \
  -H "Content-Type: application/json" \
  -d @example-request.json
```

## 🎯 What Happens?

1. **API receives your form data** (vessel info, dates, etc.)
2. **System fills the HTML template** with your data
3. **Generates a unique PDF** and saves it to `/storage/`
4. **Creates a public URL** for the PDF (e.g., `http://localhost:3000/pdfs/port-clearance-PC-12345.pdf`)
5. **Generates QR code** pointing to that PDF URL
6. **Embeds QR code** in the top-left corner of the PDF
7. **Returns the final PDF** with working QR code!

## 🔍 Verify It Works

After generating a PDF:

1. **Open the PDF** from the response URL
2. **Scan the QR code** (top-left corner) with your phone
3. **QR code should open the same PDF** in your browser!

## 📱 QR Code Features

- **High Resolution**: 300x300px PNG format
- **Error Correction**: Level H (30% damage recovery)
- **Direct Link**: Points to the hosted PDF
- **Instant Access**: Scan and view immediately

## 🛠️ Development Mode

For auto-reload during development:

```bash
npm run dev
```

This uses `nodemon` to restart the server when you make changes.

## 📂 File Structure After Setup

```
QR-Engine/
├── node_modules/          # Dependencies (created after npm install)
├── storage/               # Generated PDFs (auto-created)
├── temp/                  # Temporary files (auto-created)
├── utils/
│   └── pdfGenerator.js   # PDF generation logic
├── server.js             # Main server
├── template.html         # Port Clearance template
├── test-api.html         # Web-based API tester
├── example-request.json  # Sample API request
├── package.json          # Project configuration
├── .gitignore           # Git ignore rules
├── README.md            # Full documentation
└── QUICK_START.md       # This file!
```

## 🎨 Customization

### Change Server Port

Edit `.env` file:
```env
PORT=8080
BASE_URL=http://localhost:8080
```

### Modify Template

Edit `template.html` to customize:
- Logo placement
- Colors and styling
- Form fields
- Layout

### Add Fields

1. Add `{{NEW_FIELD}}` placeholder in `template.html`
2. Add field to `placeholders` object in `utils/pdfGenerator.js`
3. Send field in API request JSON

## ⚡ Common Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode (auto-reload)
npm run dev

# Test API
curl -X POST http://localhost:3000/api/generate-port-clearance \
  -H "Content-Type: application/json" \
  -d '{"SERIAL_NO":"PC-001","VESSEL_NAME":"Test Ship"}'

# View generated PDFs
ls -la storage/

# Clear generated PDFs
rm storage/*.pdf
```

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "Port 3000 already in use"
```bash
# Change port in .env
PORT=8080 npm start
```

### "Puppeteer not found" (Linux)
```bash
sudo apt-get install -y chromium-browser
```

### "EACCES: permission denied"
```bash
chmod -R 755 storage temp
```

## ✅ Checklist

- [x] `npm install` completed successfully
- [x] Server starts without errors
- [x] Can access http://localhost:3000
- [x] API returns success response
- [x] PDF is generated in `/storage/` folder
- [x] QR code appears in top-left corner
- [x] QR code scans and opens the PDF
- [x] PDF URL is accessible in browser

## 🎉 You're Ready!

Your QR Engine is now fully operational. Start generating Port Clearance documents with dynamic QR codes!

### Next Steps:

1. Integrate with your existing system via the REST API
2. Customize the template to match your branding
3. Deploy to production (see README.md for deployment guide)
4. Add authentication if needed
5. Configure cloud storage (AWS S3, etc.)

## 💡 Need Help?

- Check the full documentation: `README.md`
- Review example request: `example-request.json`
- Use the web tester: `test-api.html`
- Check server logs for detailed error messages

---

**Happy Generating! 🚢📄**

