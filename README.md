# QR Engine - Port Clearance PDF System

A Node.js system that automatically generates Port Clearance (PC) documents with embedded dynamic QR codes. The QR code in each document redirects to the hosted PDF itself.

## 🚀 Features

- **Dynamic Form Filling**: Fill Port Clearance template with API data
- **Auto QR Generation**: Creates QR codes that link to the generated PDF
- **Bilingual Support**: English and Farsi (Persian) text support
- **PDF Generation**: HTML to PDF conversion using Puppeteer
- **RESTful API**: Simple JSON API for document generation
- **Instant Access**: Generated PDFs are immediately accessible via URL

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone or navigate to the project directory**
```bash
cd QR-Engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

The `.env` file is already set up with default values:
```env
PORT=3000
BASE_URL=http://localhost:3000
UPLOAD_DIR=./uploads
STORAGE_DIR=./storage
```

4. **Start the server**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Generate Port Clearance PDF

**Endpoint:** `POST /api/generate-port-clearance`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "MARINE_AFFAIRS_NO": "MA-2024-001",
  "MARINE_AFFAIRS_NO_FA": "۰۰۱-۲۰۲۴-MA",
  "SERIAL_NO": "PC-12345",
  "SERIAL_NO_FA": "۱۲۳۴۵-PC",
  "ISSUE_DATE_TIME": "2024-10-16 14:30",
  "ISSUE_DATE_TIME_FA": "۱۴۰۳/۰۷/۲۵ ۱۴:۳۰",
  "PORT_CLEARANCE_NO": "PCN-2024-5678",
  "PORT_CLEARANCE_NO_FA": "۵۶۷۸-۲۰۲۴-PCN",
  "CUSTOM_LEAVE_NO": "CL-9876",
  "CUSTOM_LEAVE_NO_FA": "۹۸۷۶-CL",
  "AGENT": "Maritime Services Co.",
  "AGENT_FA": "شرکت خدمات دریایی",
  "VESSEL_NAME": "MV Ocean Star",
  "VESSEL_NAME_FA": "ستاره اقیانوس",
  "ARRIVED_FROM": "Dubai Port",
  "ARRIVED_FROM_FA": "بندر دبی",
  "ON_DATE": "2024-10-15",
  "ON_DATE_FA": "۱۴۰۳/۰۷/۲۴",
  "IMO_NO": "IMO 9234567",
  "IMO_NO_FA": "۹۲۳۴۵۶۷ IMO",
  "SHIPS_FLAG": "Panama",
  "SHIPS_FLAG_FA": "پاناما",
  "REGISTRY_PORT": "Panama City",
  "REGISTRY_PORT_FA": "پاناما سیتی",
  "GROSS_TONNAGE": "45000 GT",
  "GROSS_TONNAGE_FA": "۴۵۰۰۰ تن",
  "MASTER": "Captain John Smith",
  "MASTER_FA": "کاپیتان جان اسمیت",
  "PERMITTED_TO_SAIL": "Bandar Abbas",
  "PERMITTED_TO_SAIL_FA": "بندر عباس",
  "HEAD_OF_MARITIME": "Ali Rezaei",
  "HEAD_OF_MARITIME_FA": "علی رضایی",
  "PORT": "Khorramshahr",
  "PORT_FA": "خرمشهر",
  "SIGNATURE": "Digitally Signed",
  "SIGNATURE_FA": "امضا شده دیجیتال"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Port Clearance PDF generated successfully",
  "data": {
    "filename": "port-clearance-PC-12345.pdf",
    "pdfUrl": "http://localhost:3000/pdfs/port-clearance-PC-12345.pdf",
    "qrCodeUrl": "data:image/png;base64,iVBORw0KG...",
    "downloadUrl": "http://localhost:3000/api/download/port-clearance-PC-12345.pdf"
  }
}
```

#### 2. View/Download PDF

**Endpoint:** `GET /pdfs/:filename`

**Example:**
```
http://localhost:3000/pdfs/port-clearance-PC-12345.pdf
```

#### 3. Download PDF (with proper headers)

**Endpoint:** `GET /api/download/:filename`

**Example:**
```
http://localhost:3000/api/download/port-clearance-PC-12345.pdf
```

## 🧪 Testing the API

### Using cURL

```bash
curl -X POST http://localhost:3000/api/generate-port-clearance \
  -H "Content-Type: application/json" \
  -d '{
    "SERIAL_NO": "PC-12345",
    "VESSEL_NAME": "MV Ocean Star",
    "VESSEL_NAME_FA": "ستاره اقیانوس",
    "PORT": "Khorramshahr",
    "PORT_FA": "خرمشهر"
  }'
```

### Using Postman

1. Create a new POST request
2. URL: `http://localhost:3000/api/generate-port-clearance`
3. Headers: `Content-Type: application/json`
4. Body: Select "raw" and "JSON", then paste the request body
5. Click "Send"

### Using JavaScript/Fetch

```javascript
const formData = {
  SERIAL_NO: "PC-12345",
  VESSEL_NAME: "MV Ocean Star",
  VESSEL_NAME_FA: "ستاره اقیانوس",
  PORT: "Khorramshahr",
  PORT_FA: "خرمشهر"
  // ... other fields
};

fetch('http://localhost:3000/api/generate-port-clearance', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => {
  console.log('PDF Generated:', data.data.pdfUrl);
  // Open PDF in new tab
  window.open(data.data.pdfUrl, '_blank');
})
.catch(error => console.error('Error:', error));
```

## 📁 Project Structure

```
QR-Engine/
├── server.js                 # Main Express server
├── template.html            # Port Clearance HTML template
├── package.json             # Dependencies and scripts
├── .env                     # Environment configuration
├── .gitignore              # Git ignore rules
├── utils/
│   └── pdfGenerator.js     # PDF generation logic
├── storage/                # Generated PDFs (auto-created)
└── temp/                   # Temporary files (auto-created)
```

## 🔧 How It Works

1. **API Request**: Client sends form data via POST request
2. **Template Fill**: System fills HTML template with provided data
3. **PDF Generation**: Puppeteer converts HTML to PDF
4. **URL Creation**: PDF is saved and assigned a public URL
5. **QR Generation**: QR code is created with the PDF URL
6. **QR Embedding**: QR code replaces the placeholder in the template
7. **Final PDF**: Complete PDF with dynamic QR is generated and returned

## 🌐 QR Code Functionality

The QR code embedded in each Port Clearance document:
- **Points to**: The same PDF document hosted on the server
- **Format**: High-resolution PNG
- **Position**: Top-left corner of the document
- **Purpose**: Quick access and verification of the document

When scanned, the QR code opens the PDF document in the user's browser or PDF viewer.

## 📝 Field Mappings

All fields support both English and Farsi (Persian) text:

| English Field | Farsi Field | Description |
|--------------|-------------|-------------|
| MARINE_AFFAIRS_NO | MARINE_AFFAIRS_NO_FA | Marine affairs number |
| SERIAL_NO | SERIAL_NO_FA | Serial number |
| ISSUE_DATE_TIME | ISSUE_DATE_TIME_FA | Issue date and time |
| PORT_CLEARANCE_NO | PORT_CLEARANCE_NO_FA | Port clearance number |
| CUSTOM_LEAVE_NO | CUSTOM_LEAVE_NO_FA | Custom leave number |
| AGENT | AGENT_FA | Agent name |
| VESSEL_NAME | VESSEL_NAME_FA | Vessel name |
| ARRIVED_FROM | ARRIVED_FROM_FA | Port of arrival |
| ON_DATE | ON_DATE_FA | Arrival date |
| IMO_NO | IMO_NO_FA | IMO/Registration number |
| SHIPS_FLAG | SHIPS_FLAG_FA | Ship's flag |
| REGISTRY_PORT | REGISTRY_PORT_FA | Registry port |
| GROSS_TONNAGE | GROSS_TONNAGE_FA | Gross tonnage |
| MASTER | MASTER_FA | Master/Captain name |
| PERMITTED_TO_SAIL | PERMITTED_TO_SAIL_FA | Permitted destination |
| HEAD_OF_MARITIME | HEAD_OF_MARITIME_FA | Head of maritime affairs |
| PORT | PORT_FA | Port name |
| SIGNATURE | SIGNATURE_FA | Signature |

## 🔐 Security Notes

- PDFs are stored locally in the `storage` directory
- No authentication required (add if needed)
- CORS is enabled for all origins (configure for production)
- Consider adding rate limiting for production use

## 🚀 Production Deployment

For production deployment:

1. **Update environment variables**
```env
PORT=80
BASE_URL=https://yourdomain.com
```

2. **Use cloud storage** (optional)
   - Configure AWS S3 or similar
   - Update storage paths in the code

3. **Add security**
   - Implement authentication
   - Add rate limiting
   - Configure CORS properly

4. **Use process manager**
```bash
npm install -g pm2
pm2 start server.js --name qr-engine
```

## 🛟 Troubleshooting

### Puppeteer issues on Linux
```bash
# Install dependencies
sudo apt-get install -y chromium-browser
```

### Port already in use
```bash
# Change PORT in .env file or:
PORT=8080 npm start
```

### PDF generation fails
- Ensure Puppeteer dependencies are installed
- Check console for detailed error messages
- Verify template.html exists and is valid

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, please check the error logs in the console output.

---

**Made with ❤️ for Maritime Document Management**

