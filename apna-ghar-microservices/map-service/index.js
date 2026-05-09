const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Map Service connected to MongoDB successfully: ${mongoose.connection.host}`);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};
connectDB();

// Minimal Schema to query properties for map
const mapPropertySchema = new mongoose.Schema({
    title: String,
    price: Number,
    location: String,
    property_type: String,
    latitude: Number,
    longitude: Number,
    image_url: String,
});
const MapProperty = mongoose.model('Property', mapPropertySchema);

app.get('/api/map/properties', async (req, res) => {
    try {
        // Find properties that have valid latitude and longitude
        const properties = await MapProperty.find({
            latitude: { $exists: true, $ne: null },
            longitude: { $exists: true, $ne: null }
        });
        
        res.json({ success: true, properties });
    } catch (error) {
        console.error("Map Service Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
    res.send('Map Service is running');
});

app.listen(PORT, () => {
    console.log(`Map Service is running on http://localhost:${PORT}`);
});
