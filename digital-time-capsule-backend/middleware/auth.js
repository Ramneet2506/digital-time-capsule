// middleware/auth.js

const jwt = require('jsonwebtoken');

/**
 * Middleware function to verify the JWT from the request header.
 * If valid, it attaches the user ID to the request object (req.userId).
 */
exports.protect = (req, res, next) => {
    // 1. Check for the token in the Authorization header
    const authHeader = req.header('Authorization');

    // Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Access denied. No token provided or malformed token.' 
        });
    }

    // Extract the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1]; 
    
    try {
        // 2. Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the user ID to the request object for use in controllers
        req.userId = decoded.id; 
        
        // 4. Continue to the next middleware or route controller
        next();
    } catch (ex) {
        // If verification fails (e.g., token expired, wrong secret)
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};