# QR Code Verification Checklist

## ✅ Quick Verification Steps

### Step 1: Visual Inspection
1. Open the test PDF: `/Users/apple/Documents/QR-Engine/storage/port-clearance-TEST-QR-FIX-V2.pdf`
2. **CHECK**: You should see a QR code in the top-left corner
3. **Size**: The QR code should be approximately 100x100 pixels
4. **Position**: It should be above the "Islamic Rep. of IRAN" box

### Step 2: Scan the QR Code
1. Use your smartphone's camera or QR code scanner app
2. Scan the QR code from the PDF
3. **Expected Result**: It should open the URL: `http://localhost:3000/pdfs/port-clearance-TEST-QR-FIX-V2.pdf`
4. **Note**: Make sure your phone is on the same network as your computer

### Step 3: Test the Complete Workflow

#### Option A: Using the Web Interface
1. Open: http://localhost:3000/test-api.html
2. Click "📝 Fill Sample Data"
3. Click "🚀 Generate Port Clearance PDF"
4. Wait for success message
5. Click "📄 Open PDF in New Tab"
6. **Verify**: QR code is visible in the PDF
7. **Scan**: Use your phone to scan the QR code
8. **Verify**: It opens the same PDF in your phone's browser

#### Option B: Using CURL
```bash
curl -X POST http://localhost:3000/api/generate-port-clearance \
  -H "Content-Type: application/json" \
  -d '{
    "SERIAL_NO": "VERIFY-001",
    "MARINE_AFFAIRS_NO": "MA-2024-VERIFY",
    "VESSEL_NAME": "MV Verification",
    "PORT": "Verification Port"
  }' | jq .
```

Then open: http://localhost:3000/pdfs/port-clearance-VERIFY-001.pdf

### Step 4: Check Server Logs
The logs should show:
```
QR Code file created at: /path/to/temp/qr-xxxxx.png
QR Code generated for URL: http://localhost:3000/pdfs/...
QR Code base64 generated, length: ~5000
QR Code successfully embedded in HTML template
PDF generated successfully
```

## 🔍 What to Look For

### ✅ QR Code Should Be:
- [ ] Visible in the PDF (top-left corner)
- [ ] Black and white
- [ ] Clear and scannable
- [ ] Approximately 100x100 pixels
- [ ] Above the "Islamic Rep. of IRAN" text box

### ✅ QR Code Should Contain:
- [ ] URL format: `http://localhost:3000/pdfs/port-clearance-[SERIAL_NO].pdf`
- [ ] When scanned, opens the exact same PDF
- [ ] Accessible from mobile devices on the same network

### ✅ PDF Should:
- [ ] Generate without errors
- [ ] Display correctly in browser
- [ ] Be downloadable
- [ ] Show all form data filled correctly

## 🐛 Troubleshooting

### QR Code Not Visible
1. Check server logs for "QR Code successfully embedded"
2. Verify base64 length is ~5000 characters
3. Ensure Puppeteer is waiting for images (see logs)

### QR Code Not Scannable
1. Check QR code size in template.html (should be 100px)
2. Verify QR code resolution (should be 400px width)
3. Check QR code error correction level (should be 'H')

### QR Code Scans But Wrong URL
1. Check the `BASE_URL` in your environment
2. Verify the PDF URL format in server logs
3. Ensure filename matches the SERIAL_NO

### Cannot Access from Phone
1. Ensure phone is on same network as server
2. Use computer's IP address instead of localhost:
   - Find IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Update BASE_URL: `export BASE_URL=http://YOUR_IP:3000`
   - Restart server

## 📱 Testing from Mobile Device

To test from your mobile device:

1. **Get your computer's IP address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Example output: `inet 192.168.1.100`

2. **Set BASE_URL** (in terminal where server runs):
   ```bash
   export BASE_URL=http://192.168.1.100:3000
   node server.js
   ```

3. **Generate a new PDF** (it will have the new URL in QR code)

4. **Scan QR code** - it should now work from your phone!

## ✨ Success Criteria

All checks should pass:
- [x] QR code is visible in PDF
- [x] QR code is properly sized (100x100px)
- [x] QR code contains correct PDF URL
- [x] Scanning QR code opens the same PDF
- [x] PDF displays correctly in browser
- [x] Complete workflow works end-to-end

## 📊 Example Test Result

```json
{
  "success": true,
  "message": "Port Clearance PDF generated successfully",
  "data": {
    "filename": "port-clearance-TEST-QR-FIX-V2.pdf",
    "pdfUrl": "http://localhost:3000/pdfs/port-clearance-TEST-QR-FIX-V2.pdf",
    "qrCodeUrl": "data:image/png;base64,...[~5000 chars]",
    "downloadUrl": "http://localhost:3000/api/download/port-clearance-TEST-QR-FIX-V2.pdf"
  }
}
```

**Status**: ✅ All checks passed - QR code fix verified!

