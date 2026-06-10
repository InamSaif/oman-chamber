const Document = require('../models/Document');
const { generatePortClearancePDF } = require('../utils/pdfGenerator');
const fs = require('fs').promises;
const path = require('path');

function normalizeFormData(body) {
    const formData = { ...body };

    if (typeof formData.PRODUCTS === 'string') {
        try {
            formData.PRODUCTS = JSON.parse(formData.PRODUCTS);
        } catch (error) {
            formData.PRODUCTS = [];
        }
    }

    return formData;
}

function buildAttachments(files = {}, baseUrl) {
    const attachmentTitles = {
        SUPPORTING_FILE_1: 'Invoice',
        SUPPORTING_FILE_2: 'Package List'
    };

    return Object.keys(attachmentTitles).flatMap(fieldName => {
        const file = files[fieldName]?.[0];
        if (!file) return [];

        return {
            fieldName,
            title: attachmentTitles[fieldName],
            originalName: file.originalname,
            filename: `uploads/${file.filename}`,
            url: `${baseUrl}/pdfs/uploads/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size
        };
    });
}

function hasRequiredDocumentUploads(files = {}) {
    return Boolean(files.SUPPORTING_FILE_1?.[0] && files.SUPPORTING_FILE_2?.[0]);
}

function getRequestBaseUrl(req) {
    const forwardedProto = req.get('x-forwarded-proto');
    const protocol = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
    return `${protocol}://${req.get('host')}`;
}

function buildPublicFileUrl(req, filename) {
    if (!filename) return '';
    return `/pdfs/${filename}`;
}

function normalizeAttachmentUrls(req, attachments = []) {
    return attachments.map(attachment => {
        const plainAttachment = typeof attachment.toObject === 'function'
            ? attachment.toObject()
            : attachment;

        return {
            ...plainAttachment,
            url: buildPublicFileUrl(req, plainAttachment.filename)
        };
    });
}

async function deleteStoredFile(filename) {
    if (!filename) return;

    try {
        await fs.unlink(path.join(__dirname, '../storage', filename));
    } catch (error) {
        console.log('Stored file not found or already deleted:', filename);
    }
}

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
        const formData = normalizeFormData(req.body);
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

        if (!hasRequiredDocumentUploads(req.files)) {
            return res.status(400).json({
                success: false,
                error: 'Invoice file and Package List file are required'
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
            attachments: buildAttachments(req.files, BASE_URL),
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

        const formData = normalizeFormData(req.body);
        const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

        // Use CERTIFICATE_NUMBER as serial number if SERIAL_NO is not provided
        const newSerialNo = formData.SERIAL_NO || formData.CERTIFICATE_NUMBER;

        // Delete old PDF file
        await deleteStoredFile(document.filename);

        // Generate new PDF
        const result = await generatePortClearancePDF(formData, BASE_URL);

        // Update document
        document.serialNo = newSerialNo || document.serialNo;
        document.filename = result.filename;
        document.pdfUrl = result.pdfUrl;
        document.qrCodeUrl = result.qrCodeUrl;
        const newAttachments = buildAttachments(req.files, BASE_URL);
        if (newAttachments.length > 0) {
            const existingAttachments = document.attachments || [];

            for (const attachment of newAttachments) {
                const oldAttachment = existingAttachments.find(item => item.fieldName === attachment.fieldName);
                if (oldAttachment) {
                    await deleteStoredFile(oldAttachment.filename);
                }
            }

            document.attachments = [
                ...existingAttachments.filter(item => !newAttachments.some(newItem => newItem.fieldName === item.fieldName)),
                ...newAttachments
            ];
        }
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

        // Optionally delete the PDF file and uploaded supporting files
        await deleteStoredFile(document.filename);
        for (const attachment of document.attachments || []) {
            await deleteStoredFile(attachment.filename);
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
        // Note: serialNo is no longer unique; prefer the newest active document.
        const serialNo = req.params.serialNo;

        let document = await Document.findOne({ serialNo, status: 'active' })
            .sort({ createdAt: -1 });

        if (!document) {
            document = await Document.findOne({ serialNo, status: 'expired' })
                .sort({ createdAt: -1 });
        }

        if (!document) {
            document = await Document.findOne({ serialNo, status: 'deleted' })
                .sort({ createdAt: -1 });
        }

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
                pdfUrl: buildPublicFileUrl(req, document.filename),
                attachments: normalizeAttachmentUrls(req, document.attachments || []),
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

