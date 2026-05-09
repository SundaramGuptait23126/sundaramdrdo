const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

// Make uploads directory static so images can be viewed via URL
app.use('/api/media/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const mediaRouter = express.Router();

// 1. Upload Image API
// Gateway forwards to here: POST http://localhost:5000/api/media/upload
mediaRouter.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        // Return the full URL of the uploaded image (accessible through the Gateway)
        const gatewayUrl = process.env.GATEWAY_URL || 'https://apnaghar-gateway.onrender.com';
        const imageUrl = `${gatewayUrl}/api/media/uploads/${req.file.filename}`;
        
        res.status(201).json({ success: true, message: 'Image uploaded successfully!', imageUrl });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Attach Router
app.use('/api/media', mediaRouter);

app.get('/', (req, res) => {
    res.send('Media Service is running');
});

app.listen(PORT, () => {
    console.log(`Media Service is running on http://localhost:${PORT}`);
});
