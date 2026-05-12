const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    bhk: { type: Number, required: true },
    property_type: { type: String, default: 'apartment' },
    status: { type: String, default: 'available' },
    owner_id: { type: Number, required: true },
    image_url: { type: String },
    amenities: [{ type: String }],
    latitude: { type: Number },
    longitude: { type: Number },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Property', propertySchema);
