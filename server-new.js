const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs').promises;

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use('/pdfs', express.static(path.join(__dirname, 'storage')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Create necessary directories
async function setupDirectories() {
    const dirs = ['storage', 'temp', 'public'];
    for (const dir of dirs) {
        try {
            await fs.mkdir(path.join(__dirname, dir), { recursive: true });
        } catch (error) {
            console.error(`Error creating ${dir} directory:`, error);
        }
    }
}

// Connect to MongoDB
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-engine';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Legacy API endpoint (for backward compatibility)
const { generatePortClearancePDF } = require('./utils/pdfGenerator');

app.post('/api/generate-port-clearance', async (req, res) => {
    try {
        const formData = req.body;

        if (!formData.SERIAL_NO) {
            return res.status(400).json({
                success: false,
                error: 'SERIAL_NO is required'
            });
        }

        console.log('Generating Port Clearance PDF...');
        console.log('Form Data:', formData);

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
        await fs.access(filePath);
        res.sendFile(filePath);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: 'PDF not found'
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'QR Engine - Port Clearance PDF System',
        version: '2.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me',
                logout: 'GET /api/auth/logout'
            },
            documents: {
                list: 'GET /api/documents',
                create: 'POST /api/documents',
                get: 'GET /api/documents/:id',
                update: 'PUT /api/documents/:id',
                delete: 'DELETE /api/documents/:id',
                expire: 'PUT /api/documents/:id/expire',
                verify: 'GET /api/documents/verify/:serialNo'
            },
            legacy: {
                generatePC: 'POST /api/generate-port-clearance',
                viewPDF: 'GET /pdfs/:filename'
            }
        }
    });
});

// Serve frontend pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
const startServer = async () => {
    await setupDirectories();
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`\n🚀 QR Engine Server is running!`);
        console.log(`📍 Local: http://localhost:${PORT}`);
        console.log(`📄 Login: http://localhost:${PORT}/login`);
        console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
        console.log(`🗄️  Database: ${mongoose.connection.name}`);
        console.log(`\nReady to generate Port Clearance PDFs!\n`);
    });
};

startServer();

module.exports = app;

