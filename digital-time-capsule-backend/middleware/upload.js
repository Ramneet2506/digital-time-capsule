// middleware/upload.js

const multer = require('multer');

// Configure Multer to store the file in memory temporarily
// This is necessary to access the file buffer before sending it to S3
const storage = multer.memoryStorage();

// Define the maximum file size (e.g., 50MB)
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = upload;