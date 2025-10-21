// services/gcsService.js

const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Initialize GCS client. It automatically uses credentials from the environment variable 
// GOOGLE_APPLICATION_CREDENTIALS, which we will set in the .env file.
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);


/**
 * Uploads a file buffer to Google Cloud Storage
 * @param {Buffer} fileBuffer - The file content as a buffer
 * @param {string} originalName - The original file name
 * @param {string} mimeType - The file's content type
 * @returns {string} The public URL of the uploaded file
 */
// In services/gcsService.js
exports.getSignedUrl = async (fileKey) => {
    const options = { version: 'v4', action: 'read', expires: Date.now() + 30 * 60 * 1000 }; 
    const file = bucket.file(fileKey);
    const [url] = await file.getSignedUrl(options);
    return url;
};
exports.uploadFileToGCS = async (fileBuffer, originalName, mimeType) => {
    const fileExtension = path.extname(originalName);
    const fileKey = `${uuidv4()}${fileExtension}`;
    const gcsFile = bucket.file(fileKey);

    const stream = gcsFile.createWriteStream({
        metadata: {
            contentType: mimeType,
        },
        // IMPORTANT: Makes the file publicly accessible

    });

    return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
            console.error("GCS Upload Error:", err);
            reject(new Error("Failed to upload file to GCS."));
        });

        stream.on('finish', () => {
            // GCS public URL format
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileKey}`;
            resolve(fileKey);
        });

        stream.end(fileBuffer);
    });
};