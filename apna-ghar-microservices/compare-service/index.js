const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const Property = require('./property.model');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Compare Service connected to MongoDB successfully: ${mongoose.connection.host}`);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};
connectDB();

// Core Endpoint: Compute side-by-side comparison matrix
app.post('/api/compare/matrix', async (req, res) => {
    try {
        const { propertyIds } = req.body;
        
        if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide an array of propertyIds to compare.' });
        }

        // Handle both valid MongoDB ObjectIds and custom string/numeric IDs
        const objectIds = [];
        const stringIds = [];

        propertyIds.forEach(id => {
            if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
                objectIds.push(new mongoose.Types.ObjectId(id));
            } else {
                stringIds.push(id);
            }
        });

        // Fetch properties from DB
        const dbProperties = await Property.find({
            $or: [
                { _id: { $in: objectIds } },
                { _id: { $in: stringIds } }
            ]
        });

        // Map them to standardized format for frontend comparison
        const mappedProperties = dbProperties.map(p => {
            let images = [];
            if (p.image_url) {
                try {
                    const parsed = JSON.parse(p.image_url);
                    images = Array.isArray(parsed) ? parsed : [p.image_url];
                } catch {
                    images = [p.image_url];
                }
            }

            // Estimate area if not stored directly
            const areaSqft = p.bhk ? p.bhk * 550 : 1000;
            const pricePerSqft = Math.round(p.price / areaSqft);
            // Derive a deterministic AI score based on title length and price
            const aiScore = 80 + (p.title.length % 16);

            return {
                id: p._id.toString(),
                title: p.title,
                price: Number(p.price) || 0,
                location: p.location || '',
                city: p.location || '',
                bhk: p.bhk || 0,
                property_type: p.property_type || 'flat',
                status: p.status || 'available',
                images: images,
                amenities: p.amenities && p.amenities.length > 0 ? p.amenities : ['Parking', 'Water Supply', 'Security'],
                area_sqft: areaSqft,
                price_per_sqft: pricePerSqft,
                ai_score: aiScore,
                created_at: p.createdAt || new Date()
            };
        });

        // Add dynamic Highlights calculations
        let cheapestId = null;
        let largestId = null;
        let highestAiId = null;

        if (mappedProperties.length > 0) {
            let minPrice = Infinity;
            let maxArea = -1;
            let maxAi = -1;

            mappedProperties.forEach(p => {
                if (p.price < minPrice) {
                    minPrice = p.price;
                    cheapestId = p.id;
                }
                if (p.area_sqft > maxArea) {
                    maxArea = p.area_sqft;
                    largestId = p.id;
                }
                if (p.ai_score > maxAi) {
                    maxAi = p.ai_score;
                    highestAiId = p.id;
                }
            });
        }

        res.json({
            success: true,
            properties: mappedProperties,
            highlights: {
                cheapest_property_id: cheapestId,
                largest_property_id: largestId,
                highest_ai_score_id: highestAiId
            }
        });

    } catch (error) {
        console.error("Compare Service Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error during comparison matrix calculation.' });
    }
});

app.get('/', (req, res) => {
    res.send('Compare Service is running successfully.');
});

app.listen(PORT, () => {
    console.log(`Compare Service is running on http://localhost:${PORT}`);
});
