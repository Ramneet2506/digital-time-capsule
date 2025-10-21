// controllers/contentController.js

const db = require('../db');
const gcsService = require('../services/gcsService'); // Correct GCS Service Import
const sentimentService = require('../services/sentimentservice');

/**
 * POST /api/capsules/:id/content
 * Adds text, image, or video content to a specific capsule.
 */
exports.addContentToCapsule = async (req, res) => {
    const userId = req.userId; 
    const capsuleId = req.params.id;
    let { contentText, contentType } = req.body; 
    let contentUrl = null;
    let sentimentScore = 0.0; // Initialize score

    try {
        // 1. Check if the capsule exists and belongs to the user (or collaborator)
        // (Simplified check here, robust logic needed for communal capsules)
        const capsuleCheck = await db.query(
            'SELECT unlock_date, creator_id FROM capsules WHERE capsule_id = $1 AND creator_id = $2', 
            [capsuleId, userId]
        );

        if (capsuleCheck.rows.length === 0) {
             return res.status(404).json({ error: 'Capsule not found or access denied.' });
        }
        
        // 2. Prevent adding content if the capsule is already unlocked
        const unlockDate = new Date(capsuleCheck.rows[0].unlock_date);
        const now = new Date();
        if (now >= unlockDate) {
            return res.status(400).json({ error: 'Cannot add content to an unlocked capsule.' });
        }
        
        // 3. Handle File Upload (Image/Video)
        if (req.file) {
            // File was uploaded (Multer puts it in req.file)
            contentType = req.file.mimetype.startsWith('image/') ? 'image' : 
                          req.file.mimetype.startsWith('video/') ? 'video' : 'other';
            
            // --- CRITICAL FIX: Use GCS Service ---
            contentUrl = await gcsService.uploadFileToGCS( // Changed from s3Service.uploadFileToS3
                req.file.buffer,      // The file content buffer from Multer
                req.file.originalname, 
                req.file.mimetype
            );
        } else if (contentText) {
            // Handle Text Content
            contentType = 'text';

            const sentimentAnalysis = sentimentService.analyzeSentiment(contentText);
            sentimentScore = sentimentAnalysis.score; 
        } else {
            return res.status(400).json({ error: 'Content (text or file) is required.' });
        }

        // 4. Insert Content record into the database
        // --- CRITICAL FIX: Add sentiment_score to the query and values list ---
        const result = await db.query(
            `INSERT INTO contents (capsule_id, contributor_id, content_type, content_text, content_url, sentiment_score) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [capsuleId, userId, contentType, contentText || null, contentUrl || null, sentimentScore] // Added $6 (sentimentScore)
        );

        res.status(201).json({ 
            message: 'Content successfully added to capsule.', 
            content: result.rows[0] 
        });

    } catch (error) {
        console.error('Error adding content:', error);
        // It's good practice to display a more specific error if available
        res.status(500).json({ error: 'Server error during content upload/storage. Please check GCS configuration.' });
    }
};