# 🖊️ Signature Image Setup Guide

## How to Add Your Signature Stamp

### Step 1: Save Your Signature Image

1. **Save the signature PNG image** you provided to this exact location:
   ```
   /Users/apple/Documents/QR-Engine/assets/signature-stamp.png
   ```

2. **Create the assets folder** if it doesn't exist:
   ```bash
   mkdir -p /Users/apple/Documents/QR-Engine/assets
   ```

3. **Copy your signature image**:
   ```bash
   # Replace /path/to/your/signature.png with your actual image path
   cp /path/to/your/signature.png /Users/apple/Documents/QR-Engine/assets/signature-stamp.png
   ```

### Step 2: Rebuild Docker Container

Since the signature is embedded in the PDF generation process, you need to rebuild:

```bash
cd /Users/apple/Documents/QR-Engine
docker-compose down
docker-compose up -d --build
```

### Step 3: Test

1. Go to http://localhost:3000/login
2. Create a document
3. The signature stamp will appear at the bottom in the "Signature" row

---

## 📐 Image Specifications

**Recommended Settings:**
- **Format**: PNG with transparent background
- **Size**: 180px width (height auto-scales)
- **Resolution**: 300 DPI or higher
- **Colors**: Should match the official stamp design

## 🎯 Position in PDF

The signature will appear:
- **Location**: Bottom of the form
- **Row**: "Signature" / "امضاء"
- **Side**: Left column (English side)
- **Alignment**: Centered

## ✅ Quick Setup Commands

```bash
# 1. Create assets folder
mkdir -p /Users/apple/Documents/QR-Engine/assets

# 2. Copy your signature image (update the path!)
cp ~/Downloads/signature-stamp.png /Users/apple/Documents/QR-Engine/assets/signature-stamp.png

# 3. Verify it's there
ls -lh /Users/apple/Documents/QR-Engine/assets/signature-stamp.png

# 4. Rebuild Docker
cd /Users/apple/Documents/QR-Engine
docker-compose down
docker-compose up -d --build

# 5. Check logs
docker-compose logs -f app | grep -i signature
```

You should see: `Signature image loaded successfully`

---

## 🐛 Troubleshooting

### Signature not showing?

**Check 1: File exists**
```bash
ls -lh /Users/apple/Documents/QR-Engine/assets/signature-stamp.png
```

**Check 2: Check logs**
```bash
docker-compose logs app | grep -i signature
```

Should show: `Signature image loaded successfully`

If it shows: `No signature image found` - the file path is wrong

**Check 3: Rebuild container**
```bash
docker-compose down
docker-compose up -d --build
```

### Wrong size or position?

Edit `/Users/apple/Documents/QR-Engine/template.html` line ~614:

```html
<img src="{{SIGNATURE_IMAGE}}" alt="Signature" 
     style="width: 180px; height: auto; display: block;">
```

Change `width: 180px` to your preferred size (e.g., `200px`, `150px`)

---

## 🎨 Example Signature Formats

**Good:**
- PNG with transparent background
- Clear, high-resolution
- Includes both seal and signature
- Professional appearance

**Avoid:**
- JPG with white background (use PNG)
- Low resolution/blurry images
- Very large file sizes (>1MB)

---

## 📝 Template Structure

The signature appears in this section of the PDF:

```
┌────────────────────────────────────────┐
│                                        │
│  [Your Signature Stamp Image]         │
│                                        │
└────────────────────────────────────────┘
```

Position: Bottom row, left column, centered

---

**Need help?** Check the example image you provided to see the expected result!

