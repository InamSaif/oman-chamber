const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    expireDocument,
    verifyDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../storage/uploads');
const allowedMimeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            cb(null, `${uniqueSuffix}-${safeName}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.has(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error('Only PDF and Word documents are allowed'));
    },
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 2
    }
});

const supportingFilesUpload = upload.fields([
    { name: 'SUPPORTING_FILE_1', maxCount: 1 },
    { name: 'SUPPORTING_FILE_2', maxCount: 1 }
]);

// Public routes
router.get('/verify/:serialNo', verifyDocument);

// Protected routes
router.use(protect);

router.route('/')
    .get(getDocuments)
    .post(supportingFilesUpload, createDocument);

router.route('/:id')
    .get(getDocument)
    .put(supportingFilesUpload, updateDocument)
    .delete(deleteDocument);

router.put('/:id/expire', expireDocument);

module.exports = router;

