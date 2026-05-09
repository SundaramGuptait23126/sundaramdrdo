const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    bhk: { type: Number, required: true },
    property_type: { type: String, default: 'apartment' },
    status: { type: String, default: 'available' },
    owner_id: { type: Number, required: true }, // Keeping as Number assuming Auth Service still uses MySQL IDs
    image_url: { type: String },
    amenities: [{ type: String }], // Example of MongoDB's flexible schema
    latitude: { type: Number },
    longitude: { type: Number },
    createdAt: { type: Date, default: Date.now },
});

// Create indexes to optimize query performance
propertySchema.index({ location: 1 }); // 1 for ascending order
propertySchema.index({ price: 1 });
propertySchema.index({ bhk: 1 });
propertySchema.index({ property_type: 1 });
propertySchema.index({ owner_id: 1 });
propertySchema.index({ createdAt: -1 }); // -1 for descending since we usually sort newest first

module.exports = mongoose.model('Property', propertySchema);
