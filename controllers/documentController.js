const Document = require('../models/Document');
const { generatePortClearancePDF } = require('../utils/pdfGenerator');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get all documents for logged in user
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ 
            user: req.user.id,
            status: { $ne: 'deleted' }
        }).sort({ createdAt: -1 });

        // Update expired documents
        const updatedDocuments = documents.map(doc => {
            if (doc.expiresAt && doc.expiresAt < new Date() && doc.status === 'active') {
                doc.status = 'expired';
                doc.save();
            }
            return doc;
        });

        res.status(200).json({
            success: true,
            count: documents.length,
            documents: updatedDocuments
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching documents'
        });
    }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Check if expired
        if (document.isExpired() && document.status === 'active') {
            document.status = 'expired';
            await document.save();
        }

        res.status(200).json({
            success: true,
            document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching document'
        });
    }
};

// @desc    Create new document
// @route   POST /api/documents
// @access  Private
exports.createDocument = async (req, res) => {
    try {
        const formData = req.body;
        const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

        // Use CERTIFICATE_NUMBER as serial number if SERIAL_NO is not provided
        const serialNo = formData.SERIAL_NO || formData.CERTIFICATE_NUMBER;
        
        // Validate required field
        if (!serialNo) {
            return res.status(400).json({
                success: false,
                error: 'Either SERIAL_NO or CERTIFICATE_NUMBER is required'
            });
        }

        // Check if serial number already exists
        const existingDoc = await Document.findOne({ 
            serialNo: serialNo,
            status: { $ne: 'deleted' }
        });

        if (existingDoc) {
            return res.status(400).json({
                success: false,
                error: 'Document with this serial/certificate number already exists'
            });
        }

        console.log('Generating Port Clearance PDF for user:', req.user.id);
        console.log('Form Data:', formData);

        // Generate PDF with dynamic QR code
        const result = await generatePortClearancePDF(formData, BASE_URL);

        // Create document in database
        const document = await Document.create({
            user: req.user.id,
            serialNo: serialNo,
            filename: result.filename,
            pdfUrl: result.pdfUrl,
            qrCodeUrl: result.qrCodeUrl,
            formData: formData,
            status: 'active',
            expiresAt: formData.expiresAt || null
        });

        res.status(201).json({
            success: true,
            message: 'Port Clearance PDF generated successfully',
            document
        });
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
    try {
        let document = await Document.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        const formData = req.body;
        const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

        // Use CERTIFICATE_NUMBER as serial number if SERIAL_NO is not provided
        const newSerialNo = formData.SERIAL_NO || formData.CERTIFICATE_NUMBER;

        // If serial number is being changed, check if it already exists
        if (newSerialNo && newSerialNo !== document.serialNo) {
            const existingDoc = await Document.findOne({ 
                serialNo: newSerialNo,
                status: { $ne: 'deleted' },
                _id: { $ne: document._id }
            });

            if (existingDoc) {
                return res.status(400).json({
                    success: false,
                    error: 'Document with this serial/certificate number already exists'
                });
            }
        }

        // Delete old PDF file
        try {
            const oldFilePath = path.join(__dirname, '../storage', document.filename);
            await fs.unlink(oldFilePath);
        } catch (error) {
            console.log('Old PDF file not found or already deleted');
        }

        // Generate new PDF
        const result = await generatePortClearancePDF(formData, BASE_URL);

        // Update document
        document.serialNo = newSerialNo || document.serialNo;
        document.filename = result.filename;
        document.pdfUrl = result.pdfUrl;
        document.qrCodeUrl = result.qrCodeUrl;
        document.formData = formData;
        document.expiresAt = formData.expiresAt || document.expiresAt;
        document.updatedAt = Date.now();

        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            document
        });
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Soft delete - mark as deleted
        document.status = 'deleted';
        await document.save();

        // Optionally delete the PDF file
        try {
            const filePath = path.join(__dirname, '../storage', document.filename);
            await fs.unlink(filePath);
        } catch (error) {
            console.log('PDF file not found or already deleted');
        }

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error deleting document'
        });
    }
};

// @desc    Expire document
// @route   PUT /api/documents/:id/expire
// @access  Private
exports.expireDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        document.status = 'expired';
        document.expiresAt = new Date();
        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document expired successfully',
            document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error expiring document'
        });
    }
};

// @desc    Verify document (for QR code scanning)
// @route   GET /api/documents/verify/:serialNo
// @access  Public
exports.verifyDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ 
            serialNo: req.params.serialNo 
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Check if document is expired or deleted
        const isExpired = document.isExpired();
        if (isExpired && document.status === 'active') {
            document.status = 'expired';
            await document.save();
        }

        if (document.status === 'expired') {
            return res.status(403).json({
                success: false,
                error: 'This document has expired',
                expiresAt: document.expiresAt
            });
        }

        if (document.status === 'deleted') {
            return res.status(404).json({
                success: false,
                error: 'This document is no longer valid'
            });
        }

        res.status(200).json({
            success: true,
            valid: true,
            document: {
                serialNo: document.serialNo,
                pdfUrl: document.pdfUrl,
                status: document.status,
                createdAt: document.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error verifying document'
        });
    }
};

