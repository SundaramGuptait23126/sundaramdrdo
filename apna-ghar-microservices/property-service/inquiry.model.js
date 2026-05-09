const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    owner_id: { type: String, required: true }, // The user ID of the property owner
    buyer_id: { type: String, required: true }, // The user ID of the person inquiring
    buyer_name: { type: String, required: true },
    buyer_phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'pending' }, // pending, contacted, resolved
}, { timestamps: true });

// Create indexes
inquirySchema.index({ owner_id: 1 }); // Optimize fetching inquiries for a specific owner

module.exports = mongoose.model('Inquiry', inquirySchema);
