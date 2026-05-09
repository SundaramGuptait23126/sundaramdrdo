const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Auth Service Route
app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://localhost:5001/api/auth', 
    changeOrigin: true 
}));

// Property Service Route
app.use('/api/properties', createProxyMiddleware({ 
    target: 'http://localhost:5002/api/properties', 
    changeOrigin: true 
}));

// Media Service Route
app.use('/api/media', createProxyMiddleware({ 
    target: 'http://localhost:5003/api/media', 
    changeOrigin: true 
}));

// Map Service Route
app.use('/api/map', createProxyMiddleware({ 
    target: 'http://localhost:5004/api/map', 
    changeOrigin: true 
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running. Welcome to Apna Ghar Microservices!');
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on http://localhost:${PORT}`);
});
