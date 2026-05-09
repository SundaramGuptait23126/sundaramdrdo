const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'apnaghar_properties', // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => {
      // Remove the original extension because Cloudinary will append its own based on the format
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = file.originalname.split('.')[0];
      return `${originalName}-${uniqueSuffix}`;
    },
  },
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
        
        // The Cloudinary URL is returned in req.file.path
        const imageUrl = req.file.path;
        
        res.status(201).json({ success: true, message: 'Image uploaded successfully!', imageUrl });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Attach Router
app.use('/api/media', mediaRouter);

app.get('/', (req, res) => {
    res.send('Media Service is running with Cloudinary integration');
});

// Add error handling middleware to catch multer errors
app.use((err, req, res, next) => {
    console.error("MULTER OR CLOUDINARY ERROR:", err);
    res.status(500).json({ success: false, message: 'File upload error', error: err.message || err });
});

app.listen(PORT, () => {
    console.log(`Media Service is running on http://localhost:${PORT}`);
});
