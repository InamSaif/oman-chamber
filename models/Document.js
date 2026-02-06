const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serialNo: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        trim: true
    },
    filename: {
        type: String,
        required: true
    },
    pdfUrl: {
        type: String,
        required: true
    },
    qrCodeUrl: {
        type: String,
        required: true
    },
    // Form Data - Using Mixed type to allow any fields
    formData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'deleted'],
        default: 'active'
    },
    expiresAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
documentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Check if document is expired
documentSchema.methods.isExpired = function() {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
};

// Auto-update status if expired
documentSchema.pre('find', function() {
    this.where({ $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] });
});

module.exports = mongoose.model('Document', documentSchema);

