const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');

/**
 * Fill template with form data
 */
function fillTemplate(templateHtml, formData, qrCodeUrl = null, signatureImage = null, isSigned = false) {
    let filled = templateHtml;

    // Format current date/time for printed timestamp
    const now = new Date();
    const printedOn = now.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    }).replace(',', '');

    // Replace all placeholders with actual data
    const placeholders = {
        // Chamber of Commerce Certificate fields
        'EXPORTER_COMPANY': formData.EXPORTER_COMPANY || '',
        'EXPORTER_ADDRESS': formData.EXPORTER_ADDRESS || '',
        'EXPORTER_POBOX': formData.EXPORTER_POBOX || '',
        'EXPORTER_EMAIL': formData.EXPORTER_EMAIL || '',
        
        'IMPORTER_COMPANY': formData.IMPORTER_COMPANY || '',
        'IMPORTER_ADDRESS': formData.IMPORTER_ADDRESS || '',
        'IMPORTER_POBOX': formData.IMPORTER_POBOX || '',
        'IMPORTER_EMAIL': formData.IMPORTER_EMAIL || '',
        
        'CERTIFICATE_NUMBER': formData.CERTIFICATE_NUMBER || '',
        'CERTIFICATE_DATE': formData.CERTIFICATE_DATE || '',
        
        'AMOUNT': formData.AMOUNT || '',
        'INVOICE_NO': formData.INVOICE_NO || '',
        'INVOICE_DATE': formData.INVOICE_DATE || '',
        
        'DESTINATION_COUNTRY': formData.DESTINATION_COUNTRY || '',
        'DESTINATION_COUNTRY_AR': formData.DESTINATION_COUNTRY_AR || '',
        
        'TRANSPORT_MEANS': formData.TRANSPORT_MEANS || '',
        'PORT_OF_DISCHARGE': formData.PORT_OF_DISCHARGE || '',
        
        'TOTAL_WEIGHT': formData.TOTAL_WEIGHT || '',
        'COMMENTS': formData.COMMENTS || ''
    };

    // Replace all placeholders
    for (const [key, value] of Object.entries(placeholders)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        filled = filled.replace(regex, value);
    }

    // Handle products array
    if (formData.PRODUCTS && Array.isArray(formData.PRODUCTS)) {
        let productsHtml = '';
        formData.PRODUCTS.forEach((product, index) => {
            productsHtml += `
              <tr style="display: flex; margin-top: 5px;">
                <td style="width: 150px; padding: var(--spacing-2); vertical-align: top; border: none;">
                  <p class="text-sm text-left">${product.marksNumbers || ''}</p>
                </td>
                <td style="width: 400px; padding: var(--spacing-2); vertical-align: top; border: none;">
                  <p class="text-sm text-left">${product.description || ''} - ${product.originCountry || ''}</p>
                </td>
                <td style="width: 150px; padding: var(--spacing-2); vertical-align: top; border: none;">
                  <p class="text-sm text-left">${product.processingType || ''} - ${product.processingCountry || ''}</p>
                </td>
                <td style="width: 110px; padding: var(--spacing-2); vertical-align: top; border: none;">
                  <p class="text-sm text-left">${product.quantity || ''} ${product.unit || ''}</p>
                </td>
              </tr>`;
        });
        filled = filled.replace('{{PRODUCTS_LIST}}', productsHtml);
    } else {
        filled = filled.replace('{{PRODUCTS_LIST}}', '');
    }

    // Replace QR Code URL if provided
    if (qrCodeUrl) {
        filled = filled.replace(/{{QR_CODE_URL}}/g, qrCodeUrl);
    }

    // Replace Signature Image if provided
    if (signatureImage) {
        filled = filled.replace(/{{SIGNATURE_IMAGE}}/g, signatureImage);
    } else {
        // If no signature image, use empty string
        filled = filled.replace(/{{SIGNATURE_IMAGE}}/g, '');
    }

    // Handle conditional signature blocks from the template
    const signedConditionalWithElse = /{{#if IS_SIGNED}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g;
    const signedConditional = /{{#if IS_SIGNED}}([\s\S]*?){{\/if}}/g;

    if (isSigned) {
        // Keep the truthy branch when a signature is present
        filled = filled.replace(signedConditionalWithElse, (_, truthy, falsy) => truthy);
        filled = filled.replace(signedConditional, (_, truthy) => truthy);
    } else {
        // Keep the falsy branch (if provided) or remove the block entirely
        filled = filled.replace(signedConditionalWithElse, (_, truthy, falsy) => falsy);
        filled = filled.replace(signedConditional, () => '');
    }

    // Clean up any leftover IS_SIGNED references
    filled = filled.replace(/{{IS_SIGNED}}/g, isSigned ? 'true' : '');

    return filled;
}

/**
 * Embed all local images found in HTML as Base64
 */
async function embedAllImages(html, baseDir) {
    let updatedHtml = html;
    
    // 1. Handle img tags with src attribute
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    
    let match;
    const imgMatches = [];
    while ((match = imgRegex.exec(html)) !== null) {
        imgMatches.push(match[1]);
    }
    
    // 2. Handle CSS url() declarations
    const cssUrlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
    const cssMatches = [];
    while ((match = cssUrlRegex.exec(html)) !== null) {
        cssMatches.push(match[1]);
    }
    
    // Combine and process unique matches
    const allMatches = [...imgMatches, ...cssMatches];
    const uniqueSources = [...new Set(allMatches)];
    
    for (const src of uniqueSources) {
        // Skip if already base64 or remote URL
        if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
            continue;
        }
        
        try {
            // Construct absolute path
            // The template uses paths relative to project root usually
            const imagePath = path.join(baseDir, src);
            
            // Check if file exists
            try {
                await fs.access(imagePath);
            } catch (e) {
                console.warn(`Image file not found: ${imagePath}, skipping embedding.`);
                continue;
            }
            
            // Determine mime type based on extension
            const ext = path.extname(src).toLowerCase();
            let mimeType = 'image/png'; // Default
            if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            else if (ext === '.svg') mimeType = 'image/svg+xml';
            
            // Read file
            const imgBuffer = await fs.readFile(imagePath);
            const base64Data = imgBuffer.toString('base64');
            const dataUri = `data:${mimeType};base64,${base64Data}`;
            
            // Replace in img src attributes
            updatedHtml = updatedHtml.split(`src="${src}"`).join(`src="${dataUri}"`);
            
            // Replace in CSS url() declarations (with and without quotes)
            updatedHtml = updatedHtml.split(`url('${src}')`).join(`url('${dataUri}')`);
            updatedHtml = updatedHtml.split(`url("${src}")`).join(`url("${dataUri}")`);
            updatedHtml = updatedHtml.split(`url(${src})`).join(`url(${dataUri})`);
            
            console.log(`Embedded image: ${src}`);
            
        } catch (error) {
            console.error(`Failed to embed image ${src}: ${error.message}`);
        }
    }
    
    return updatedHtml;
}

/**
 * Generate QR Code and save to file
 */
async function generateQRCode(url, outputPath) {
    try {
        await QRCode.toFile(outputPath, url, {
            errorCorrectionLevel: 'H',
            type: 'png',
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        console.log('QR Code file created at:', outputPath);
        return outputPath;
    } catch (error) {
        throw new Error(`QR Code generation failed: ${error.message}`);
    }
}

/**
 * Generate temporary PDF without QR code
 */
async function generateTempPDF(htmlContent, outputPath) {
    let browser;
    try {
        // Detect if running in Docker or local
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                               (() => {
                                   const os = require('os');
                                   const homedir = os.homedir();
                                   return `${homedir}/.cache/puppeteer/chrome/mac-121.0.6167.85/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
                               })();
        
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--font-render-hinting=none',
                '--disable-font-subpixel-positioning'
            ]
        });

        const page = await browser.newPage();
        
        // Set content and wait for all resources including fonts
        await page.setContent(htmlContent, {
            waitUntil: ['load', 'domcontentloaded', 'networkidle0']
        });
        
        // Wait for images to load (especially the QR code)
        await page.waitForSelector('#qr-code-img', { timeout: 5000 });
        
        // Wait for all images to load completely
        await page.evaluate(() => {
            return Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    }))
            );
        });
        
        // Wait for fonts to load with additional checks
        await page.evaluate(async () => {
            // Wait for document fonts to be ready
            await document.fonts.ready;
            
            // Check if fonts are loaded
            console.log('Fonts loaded, count:', document.fonts.size);
            
            // Add extra wait for font rendering to ensure proper display
            await new Promise(resolve => setTimeout(resolve, 2000));
        });
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: {
                top: '5mm',
                right: '5mm',
                bottom: '5mm',
                left: '5mm'
            },
            scale: 0.92
        });

        console.log('PDF generated successfully');
    } catch (error) {
        console.error('PDF error:', error.message);
        throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Main function to generate Port Clearance PDF with dynamic QR code
 */
async function generatePortClearancePDF(formData, baseUrl) {
    const tempDir = path.join(__dirname, '../temp');
    const storageDir = path.join(__dirname, '../storage');
    const templatePath = path.join(__dirname, '../template.html');

    // Generate unique filename
    const uniqueId = uuidv4();
    const filename = `chamber-cert-${formData.CERTIFICATE_NUMBER || uniqueId}.pdf`;
    const finalPdfPath = path.join(storageDir, filename);
    const qrCodePath = path.join(tempDir, `qr-${uniqueId}.png`);

    try {
        // Step 1: Read template
        const templateHtml = await fs.readFile(templatePath, 'utf-8');

        // Step 2: Generate PDF URL (where the final PDF will be hosted)
        const pdfUrl = `${baseUrl}/pdfs/${filename}`;

        // Step 3: Generate QR code as file
        await generateQRCode(pdfUrl, qrCodePath);
        console.log('QR Code generated for URL:', pdfUrl);

        // Step 4: Read QR as base64
        const qrBuffer = await fs.readFile(qrCodePath);
        const qrBase64 = `data:image/png;base64,${qrBuffer.toString('base64')}`;
        console.log('QR Code base64 generated, length:', qrBase64.length);

        // Step 4.5: Read signature stamp image and convert to base64
        const signaturePath = path.join(__dirname, '../assets/signature-stamp.png');
        let signatureBase64 = '';
        try {
            const signatureBuffer = await fs.readFile(signaturePath);
            signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;
            console.log('Signature image loaded successfully');
        } catch (error) {
            console.log('No signature image found, using placeholder');
            signatureBase64 = '';
        }

        // Step 5: Fill template with form data, QR code, and signature
        const filledHtml = fillTemplate(templateHtml, formData, qrBase64, signatureBase64, formData.isSigned);
        
        // Verify QR code was embedded
        if (!filledHtml.includes('data:image/png;base64,')) {
            throw new Error('QR Code was not properly embedded in HTML');
        }
        console.log('QR Code successfully embedded in HTML template');

        // Step 5.5: Embed all other local images
        const projectRoot = path.join(__dirname, '..');
        const finalHtml = await embedAllImages(filledHtml, projectRoot);

        // Step 6: Generate final PDF with QR code
        await generateTempPDF(finalHtml, finalPdfPath);

        // Clean up QR file
        try {
            await fs.unlink(qrCodePath);
        } catch (e) {
            try {
                 // Retry cleanup if needed or ignore
                 console.log('Cleanup qr code success');
            } catch (err) {}
        }

        console.log('Port Clearance PDF generated successfully:', filename);

        return {
            filename: filename,
            pdfUrl: pdfUrl,
            qrCodeUrl: qrBase64,
            filePath: finalPdfPath
        };

    } catch (error) {
        // Clean up on error
        try {
            await fs.unlink(qrCodePath);
            await fs.unlink(finalPdfPath);
        } catch (e) {
            // Ignore cleanup errors
        }

        throw new Error(`Failed to generate Port Clearance PDF: ${error.message}`);
    }
}

module.exports = {
    generatePortClearancePDF
};