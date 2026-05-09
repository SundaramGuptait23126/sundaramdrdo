const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ------------------------------------
// AUTHENTICATION APIs
// Note: API Gateway forwards /api/auth here
// ------------------------------------

const authRouter = express.Router();

// 1. REGISTER API
authRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email is already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into DB
        const userRole = role || 'buyer'; // default to buyer
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, userRole]
        );

        res.status(201).json({ success: true, message: 'User registered successfully!', userId: result.insertId });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 2. LOGIN API
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid Email or Password.' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Email or Password.' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token valid for 7 days
        );

        res.json({ 
            success: true, 
            message: 'Logged in successfully!', 
            token, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Attach Router
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Auth Service is running');
});

app.listen(PORT, () => {
    console.log(`Auth Service is running on http://localhost:${PORT}`);
});
