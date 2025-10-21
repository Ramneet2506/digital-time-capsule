// server.js

require('dotenv').config(); // Load environment variables
const express = require('express');

// 1. Initialize the Express Application (The 'app' variable is defined here)
const app = express(); // <--- THIS LINE MUST COME FIRST
const cors = require('cors');

const PORT = process.env.PORT || 5000;
// const db = require('./db'); // Optional: keep this if you want to test DB connection on startup

// Import routes (should be AFTER 'app' is defined)
const authRoutes = require('./routes/authroutes'); 
const capsuleRoutes = require('./routes/capsuleroutes'); 

app.use(cors({
    origin: 'http://localhost:5173', // ONLY allow requests from your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
})); 
// 2. Use Middleware on 'app' (This is where your error occurs if app isn't defined)
app.use(express.json()); 
// You might also have CORS middleware here:
// app.use(cors()); 

// 3. Define Routes
app.get('/', (req, res) => {
  res.send('Digital Time Capsule API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);

// 4. Start the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});