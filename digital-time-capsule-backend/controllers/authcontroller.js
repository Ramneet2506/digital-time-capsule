// controllers/authController.js

const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Helper Functions ---

// Generate a JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};

// --- Core Controllers ---

/**
 * Handles user registration (Signup)
 */
exports.register = async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // 2. Hash the password (using a salt factor of 10)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Insert user into the database
        const result = await db.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email, created_at',
            [email, passwordHash]
        );

        const newUser = result.rows[0];
        
        // 4. Generate token for immediate login
        const token = generateToken(newUser.user_id);

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: { id: newUser.user_id, email: newUser.email } 
        });

    } catch (error) {
        // Handle duplicate email (PostgreSQL error code 23505 for unique violation)
        if (error.code === '23505') {
            return res.status(409).json({ error: 'A user with this email already exists.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

/**
 * Handles user login
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // 1. Find the user by email
        const result = await db.query('SELECT user_id, password_hash FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            // Use a generic message for security to prevent email enumeration
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 2. Compare the submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 3. Generate token upon successful login
        const token = generateToken(user.user_id);

        res.json({ 
            message: 'Login successful',
            token,
            user: { id: user.user_id, email }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
};