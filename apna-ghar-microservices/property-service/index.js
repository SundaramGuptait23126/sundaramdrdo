const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/.env' });

// Replace MySQL db with MongoDB connection
const connectDB = require('./mongoDb');
const Property = require('./property.model');
const Inquiry = require('./inquiry.model');

const app = express();
const PORT = process.env.PORT || 5002;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// ------------------------------------
// PROPERTY APIs
// Note: API Gateway forwards /api/properties here
// ------------------------------------

// Middleware to verify JWT Token
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains { id, email, role } from Auth Service
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

const propertyRouter = express.Router();

// Simple In-Memory Cache
let propertyCache = {};
const CACHE_DURATION_MS = 60000; // 60 seconds

// Helper to clear cache when data changes
const clearCache = () => {
    propertyCache = {};
};

// 1. ADD Property (Requires Login)
propertyRouter.post('/add', authenticateUser, async (req, res) => {
    try {
        const { title, description, price, location, bhk, property_type, status, image_url, amenities, latitude, longitude } = req.body;
        
        if (!title || !price || !location || !bhk) {
            return res.status(400).json({ success: false, message: 'Title, price, location, and bhk are required.' });
        }

        const newProperty = new Property({
            title,
            description,
            price,
            location,
            bhk,
            property_type: property_type || 'apartment',
            status: status || 'available',
            owner_id: req.user.id,
            image_url,
            amenities: amenities || [],
            latitude,
            longitude
        });

        await newProperty.save();
        clearCache(); // Invalidate cache

        res.status(201).json({ success: true, message: 'Property added successfully!', propertyId: newProperty._id });

    } catch (error) {
        console.error("Add Property Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 2. GET All Properties / Search / Filter (Public)
propertyRouter.get('/all', async (req, res) => {
    try {
        const { location, minPrice, maxPrice, bhk } = req.query;
        let query = {}; // MongoDB empty query fetches all

        // Simple Search & Filter logic for MongoDB
        if (location) {
            // Case-insensitive regex search
            query.location = { $regex: location, $options: 'i' };
        }
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        
        if (bhk) {
            query.bhk = Number(bhk);
        }

        const cacheKey = JSON.stringify(query);

        // Check if data is in cache and still valid
        if (propertyCache[cacheKey] && (Date.now() - propertyCache[cacheKey].timestamp < CACHE_DURATION_MS)) {
            return res.json({ success: true, properties: propertyCache[cacheKey].data, cached: true });
        }

        const properties = await Property.find(query).sort({ createdAt: -1 });
        
        // Save to cache
        propertyCache[cacheKey] = {
            data: properties,
            timestamp: Date.now()
        };

        res.json({ success: true, properties, cached: false });

    } catch (error) {
        console.error("Get Properties Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 3. GET User's Properties (Requires Login)
propertyRouter.get('/my', authenticateUser, async (req, res) => {
    try {
        const properties = await Property.find({ owner_id: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, properties });
    } catch (error) {
        console.error("Get My Properties Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 4. DELETE a Property (Requires Login & Ownership)
propertyRouter.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found.' });
        }
        
        // Ensure the logged in user owns this property
        if (property.owner_id != req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this property.' });
        }

        await Property.findByIdAndDelete(req.params.id);
        clearCache(); // Invalidate cache
        
        res.json({ success: true, message: 'Property deleted successfully.' });

    } catch (error) {
        console.error("Delete Property Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 5. POST an Inquiry (Lead)
propertyRouter.post('/inquire', async (req, res) => {
    try {
        const { property_id, buyer_name, buyer_phone, message, buyer_id } = req.body;
        
        if (!property_id || !buyer_name || !buyer_phone || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const property = await Property.findById(property_id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found.' });
        }

        const newInquiry = new Inquiry({
            property_id,
            owner_id: property.owner_id,
            buyer_id: buyer_id || 'guest',
            buyer_name,
            buyer_phone,
            message
        });

        await newInquiry.save();

        res.status(201).json({ success: true, message: 'Inquiry sent successfully!' });

    } catch (error) {
        console.error("Inquiry Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 6. GET My Inquiries (Requires Login)
propertyRouter.get('/inquiries', authenticateUser, async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ owner_id: req.user.id }).populate('property_id', 'title location').sort({ createdAt: -1 });
        res.json({ success: true, inquiries });
    } catch (error) {
        console.error("Get Inquiries Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Attach Router
app.use('/api/properties', propertyRouter);

app.get('/', (req, res) => {
    res.send('Property Service is running and connected to MongoDB');
});

app.listen(PORT, () => {
    console.log(`Property Service is running on http://localhost:${PORT}`);
});
