// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// POST /api/auth/register -> handles new user creation
router.post('/register', authController.register);

// POST /api/auth/login -> handles user sign-in
router.post('/login', authController.login);

module.exports = router;