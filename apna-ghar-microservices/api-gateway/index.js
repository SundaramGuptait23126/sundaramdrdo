const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Helper function to safely get the origin from a URL string
const getOrigin = (urlStr) => {
    try {
        return new URL(urlStr).origin;
    } catch (e) {
        return urlStr;
    }
};

// Auth Service Route
app.use(createProxyMiddleware({ 
    pathFilter: '/api/auth',
    target: getOrigin(process.env.AUTH_URL || 'http://localhost:5001/api/auth'), 
    changeOrigin: true 
}));

// Property Service Route
app.use(createProxyMiddleware({ 
    pathFilter: '/api/properties',
    target: getOrigin(process.env.PROPERTY_URL || 'http://localhost:5002/api/properties'), 
    changeOrigin: true 
}));

// Media Service Route
app.use(createProxyMiddleware({ 
    pathFilter: '/api/media',
    target: getOrigin(process.env.MEDIA_URL || 'http://localhost:5003/api/media'), 
    changeOrigin: true 
}));

// Map Service Route
app.use(createProxyMiddleware({ 
    pathFilter: '/api/map',
    target: getOrigin(process.env.MAP_URL || 'http://localhost:5004/api/map'), 
    changeOrigin: true 
}));

// Compare Service Route
app.use(createProxyMiddleware({ 
    pathFilter: '/api/compare',
    target: getOrigin(process.env.COMPARE_URL || 'http://localhost:5005/api/compare'), 
    changeOrigin: true 
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running. Welcome to Apna Ghar Microservices!');
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on http://localhost:${PORT}`);
});
