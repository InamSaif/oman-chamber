const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { generatePortClearancePDF } = require('./utils/pdfGenerator');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (PDFs)
app.use('/pdfs', express.static(path.join(__dirname, 'storage')));

// Create necessary directories
async function setupDirectories() {
    const dirs = ['storage', 'temp'];
    for (const dir of dirs) {
        try {
            await fs.mkdir(path.join(__dirname, dir), { recursive: true });
        } catch (error) {
            console.error(`Error creating ${dir} directory:`, error);
        }
    }
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'QR Engine - Port Clearance PDF System',
        version: '1.0.0',
        endpoints: {
            generatePC: 'POST /api/generate-port-clearance',
            viewPDF: 'GET /pdfs/:filename'
        }
    });
});

// Main endpoint: Generate Port Clearance PDF with dynamic QR code
app.post('/api/generate-port-clearance', async (req, res) => {
    try {
        const formData = req.body;

        // Validate required fields
        if (!formData.SERIAL_NO) {
            return res.status(400).json({
                success: false,
                error: 'SERIAL_NO is required'
            });
        }

        console.log('Generating Port Clearance PDF...');
        console.log('Form Data:', formData);

        // Generate PDF with dynamic QR code
        const result = await generatePortClearancePDF(formData, BASE_URL);

        res.json({
            success: true,
            message: 'Port Clearance PDF generated successfully',
            data: {
                filename: result.filename,
                pdfUrl: result.pdfUrl,
                qrCodeUrl: result.qrCodeUrl,
                downloadUrl: `${BASE_URL}/api/download/${result.filename}`
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Download endpoint
app.get('/api/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'storage', filename);

        // Check if file exists
        await fs.access(filePath);

        res.download(filePath, filename);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: 'PDF not found'
        });
    }
});

// View PDF endpoint
app.get('/pdfs/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'storage', filename);

        // Check if file exists
        await fs.access(filePath);

        res.sendFile(filePath);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: 'PDF not found'
        });
    }
});

// Start server
setupDirectories().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 QR Engine Server is running!`);
        console.log(`📍 Local: http://localhost:${PORT}`);
        console.log(`📄 API Endpoint: POST ${BASE_URL}/api/generate-port-clearance`);
        console.log(`\nReady to generate Port Clearance PDFs with dynamic QR codes!\n`);
    });
});

module.exports = app;

