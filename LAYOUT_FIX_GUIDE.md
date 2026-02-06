# Template Layout Fixes - Implementation Guide

## Issues Identified from Screenshots

Comparing the current template with the design screenshots, here are the alignment issues:

### Page 1 Issues:

1. **Header Layout** ❌ Currently: Linear/stacked layout
   - ✅ Should be: Three-column flex layout
   - Left: English text (SULTANATE OF OMAN, ROYAL OMAN POLICE, D.G. OF CUSTOMS)
   - Center: Logo image
   - Right: Arabic text (سلطنة عمان, شرطة عمان السلطانية, الادارة العامة للجمارك)

2. **Certificate Title** ❌ Currently: Scattered elements
   - ✅ Should be: Centered section with:
     - Arabic title on top: اذن الابحار
     - English title below: SAIL CERTIFICATE

3. **Certificate Subtitle** ❌ Currently: Right-aligned with inline span
   - ✅ Should be: Two-column row with bottom border
     - Left: DEPARTURE CERTIFICATE
     - Right: شهادة المغادرة

4. **Introduction Text** ❌ Currently: Right-aligned with decorative separators
   - ✅ Should be: Simple left-aligned bilingual text

### Page 2 Issues:

5. **Header** - Same as Page 1

6. **Bottom Section** ❌ Currently: Linear layout
   - ✅ Should be: Three-column flex layout
     - Left: QR Code
     - Center: Verification text (bilingual)
     - Right: Logo

## CSS Classes Already Added ✅

The following CSS classes have been added to support the new layout:

```css
.header-container - Flex container for three-column header
.header-left - Left column (English text)
.header-center - Center column (Logo)
.header-right - Right column (Arabic text)

.cert-section - Certificate title container
.cert-arabic-title - Arabic title styling
.cert-title - English title styling

.cert-subtitle-row - Flex row for bilingual subtitle
.cert-subtitle-left - Left subtitle (English)
.cert-subtitle-right - Right subtitle (Arabic)

.intro-text - Introduction paragraph styling

.page2-footer - Three-column footer for page 2
.page2-footer-left - QR code column
.page2-footer-center - Verification text column
.page2-footer-right - Logo column
```

## Manual Fix Instructions

Since automated replacement is encountering encoding issues, here's how to manually fix the template:

### Step 1: Fix Page 1 Header (Lines ~388-410)

**Replace this:**
```html
<div class="document-container">
<p class="spacer">
  <span><img width="96" height="108" alt="image" src="PermissionTodSailPrintArabic_files/Image_001.png" /></span>
</p>
<h1 class="header-title">SULTANATE OF OMAN ROYAL OMAN POLICE</h1>
<h1 class="header-subtitle">D.G. OF CUSTOMS</h1>
<p class="s1 header-arabic">ﻥﺎﻤﻋ ﺔﻨﻄﻠﺳ</p>
<p class="s1 header-arabic-sub">ﺔﻴﻧﺎﻄﻠﺴﻟﺍ ﻥﺎﻤﻋ ﺔﻃﺮﺷ ﻙﺭﺎﻤﺠﻠﻟ ﺔﻣﺎﻌﻟﺍ ﺓﺭﺍﺩﻻﺍ</p>
```

**With this:**
```html
<div class="document-container">
<!-- Header Section -->
<div class="header-container">
  <div class="header-left">
    <h1 class="header-title">SULTANATE OF OMAN</h1>
    <h1 class="header-title">ROYAL OMAN POLICE</h1>
    <h1 class="header-subtitle">D.G. OF CUSTOMS</h1>
  </div>
  <div class="header-center">
    <img width="96" height="108" alt="Oman Coat of Arms" src="PermissionTodSailPrintArabic_files/Image_001.png" />
  </div>
  <div class="header-right">
    <p class="header-arabic">سلطنة عمان</p>
    <p class="header-arabic-sub">شرطة عمان السلطانية</p>
    <p class="header-arabic-sub">الادارة العامة للجمارك</p>
  </div>
</div>
```

### Step 2: Fix Certificate Title Section (Lines ~410-419)

**Replace this:**
```html
<p class="spacer-pt10"><br /></p>
<p class="s1 pl-263 no-indent text-right">ﺭﺎﺤﺑﻻﺍ ﻥﺫﺇ</p>
<h1 class="cert-title">SAIL CERTIFICATE</h1>
<h2 class="cert-subtitle">DEPARTURE CERTIFICATE <span class="s2">ﺓﺭﺩﺎﻐﻤﻟﺍ ﺓﺩﺎﻬﺷ</span></h2>
```

**With this:**
```html
<!-- Certificate Title Section -->
<div class="cert-section">
  <p class="cert-arabic-title">اذن الابحار</p>
  <h1 class="cert-title">SAIL CERTIFICATE</h1>
</div>

<!-- Certificate Subtitle Row -->
<div class="cert-subtitle-row">
  <h2 class="cert-subtitle-left">DEPARTURE CERTIFICATE</h2>
  <h2 class="cert-subtitle-right">شهادة المغادرة</h2>
</div>
```

### Step 3: Fix Introduction Text (Lines ~420-441)

**Replace this:**
```html
<p class="img-separator">
  <span><img width="211" height="1" alt="image" src="PermissionTodSailPrintArabic_files/Image_002.png" /></span>
</p>
<p class="pl-505 no-indent lh-1 text-left">
  <span><img width="95" height="1" alt="image" src="PermissionTodSailPrintArabic_files/Image_003.png" /></span>
</p>
<p class="s3 pt-2 no-indent text-right" style="padding-bottom: 2pt;">
  Clearance to below mentioned Vessel. The particulars are
  <span class="s4">:ﻲﻠﻳ ﺎﻤﻛ ﻞﻴﺻﺎﻔﺘﻟﺍ .ﻩﺎﻧﺩﺃ ﺓﺭﻮﻛﺬﻤﻟﺍ ﺔﻨﻴﻔﺴﻟﺍ ﺺﻴﻠﺨﺗ</span>
</p>
```

**With this:**
```html
<!-- Introduction Text -->
<p class="intro-text">
  Clearance to below mentioned Vessel. The particulars are
  تخليص السفينة المذكورة ادناه. التفاصيل كما يلي:
</p>
```

### Step 4: Find and Fix Page 2 Header

Search for the second occurrence of the header (around line ~1030) and apply the same fix as Step 1.

### Step 5: Fix Page 2 Bottom Section

Find the QR code and logo section at the end of page 2 and restructure it using the `.page2-footer` classes.

## Result

After these changes, the template will match the design screenshots with:
- ✅ Three-column header layout
- ✅ Centered certificate title
- ✅ Bilingual subtitle row with border
- ✅ Clean introduction text
- ✅ Proper page 2 footer layout
