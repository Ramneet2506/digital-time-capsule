// controllers/capsuleController.js

const db = require('../db');

/**
 * POST /api/capsules
 * Creates a new time capsule
 */
exports.createCapsule = async (req, res) => {
    // req.userId comes from the JWT middleware
    const creatorId = req.userId; 
    const { title, description, unlockDate, isCommunal } = req.body;

    // 1. Basic Validation
    if (!title || !unlockDate) {
        return res.status(400).json({ error: 'Title and unlock date are required.' });
    }

    try {
        // 2. Insert the new capsule into the database
        const result = await db.query(
            `INSERT INTO capsules (title, description, unlock_date, is_communal, creator_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, description, new Date(unlockDate), isCommunal || false, creatorId]
        );

        const newCapsule = result.rows[0];
        res.status(201).json({ 
            message: 'Time capsule created successfully.',
            capsule: newCapsule 
        });
    } catch (error) {
        console.error('Error creating capsule:', error);
        res.status(500).json({ error: 'Server error during capsule creation.' });
    }
};

/**
 * GET /api/capsules/mine
 * Retrieves all capsules created by or shared with the authenticated user
 */
exports.getAllUserCapsules = async (req, res) => {
    const userId = req.userId;

    try {
        // NOTE: This query only retrieves capsules where the user is the creator.
        // For communal capsules, you'd need an additional 'collaborators' table/join.
        const result = await db.query(
            'SELECT * FROM capsules WHERE creator_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json({ 
            capsules: result.rows 
        });
    } catch (error) {
        console.error('Error fetching user capsules:', error);
        res.status(500).json({ error: 'Server error retrieving capsules.' });
    }
};

/**
 * GET /api/capsules/:id
 * Retrieves a single capsule and its contents, applying the time lock logic.
 */
exports.getCapsuleDetails = async (req, res) => {
    const userId = req.userId;
    const capsuleId = req.params.id;

    try {
        // 1. Fetch capsule metadata
        const capsuleResult = await db.query('SELECT * FROM capsules WHERE capsule_id = $1', [capsuleId]);
        const capsule = capsuleResult.rows[0];

        if (!capsule) {
            return res.status(404).json({ error: 'Capsule not found.' });
        }

        // 2. Check Ownership/Access (For simplicity, check creator only)
        // In a real app, check if userId is creator OR collaborator
        if (capsule.creator_id !== userId) {
            return res.status(403).json({ error: 'Forbidden. You do not have access to this capsule.' });
        }

        // 3. Implement the Time Lock Logic!
        const now = new Date();
        const unlockDate = new Date(capsule.unlock_date);
        const isLocked = now < unlockDate;

        let contents = [];
        if (isLocked) {
            // If locked, return metadata but no contents
            return res.json({ 
                ...capsule,
                status: 'LOCKED',
                message: `This capsule is locked until ${unlockDate.toDateString()}`,
                contents: []
            });
        }

        // 4. If Unlocked, fetch contents
        const contentsResult = await db.query(
            'SELECT content_id, content_type, content_url, content_text, contributor_id, sentiment_score FROM contents WHERE capsule_id = $1 ORDER BY created_at ASC',
            [capsuleId]
        );
        contents = contentsResult.rows;

        // NEW: Calculate Aggregate Sentiment Score
        const totalSentiment = contents.reduce((sum, content) => sum + (content.sentiment_score || 0), 0);
        const avgSentiment = contents.length > 0 ? (totalSentiment / contents.length).toFixed(2) : 0;
        
        let moodSummary;
        if (avgSentiment > 0.5) moodSummary = "Very Positive 🎉";
        else if (avgSentiment > 0) moodSummary = "Mostly Positive 😊";
        else if (avgSentiment < -0.5) moodSummary = "Quite Negative 😟";
        else if (avgSentiment < 0) moodSummary = "Slightly Negative 🙁";
        else moodSummary = "Neutral/Mixed 😐";




        res.json({
            ...capsule,
            status: 'UNLOCKED',
            contents: contents,
            // NEW METRICS
            totalSentimentScore: totalSentiment,
            averageSentimentScore: avgSentiment,
            moodSummary: moodSummary
        });

    } catch (error) {
        console.error('Error fetching capsule details:', error);
        res.status(500).json({ error: 'Server error retrieving capsule details.' });
    }
};

/**
 * DELETE /api/capsules/:id
 * Deletes a specific capsule (only if the user is the creator)
 */
exports.deleteCapsule = async (req, res) => {
    const userId = req.userId;
    const capsuleId = req.params.id;

    try {
        // 1. Verify the user is the creator before deleting
        const checkResult = await db.query(
            'SELECT creator_id FROM capsules WHERE capsule_id = $1', 
            [capsuleId]
        );
        
        const capsule = checkResult.rows[0];

        if (!capsule) {
            return res.status(404).json({ error: 'Capsule not found.' });
        }

        if (capsule.creator_id !== userId) {
            return res.status(403).json({ error: 'Forbidden. You can only delete capsules you created.' });
        }

        // 2. Execute the deletion
        // ON DELETE CASCADE in PostgreSQL ensures associated contents are also deleted.
        await db.query('DELETE FROM capsules WHERE capsule_id = $1', [capsuleId]);

        res.status(200).json({ 
            message: 'Time capsule deleted successfully.' 
        });

    } catch (error) {
        console.error('Error deleting capsule:', error);
        res.status(500).json({ error: 'Server error during capsule deletion.' });
    }
};

/**
 * PATCH /api/capsules/:id
 * Updates metadata (title, description, isCommunal) for a specific capsule.
 */
exports.updateCapsule = async (req, res) => {
    const userId = req.userId;
    const capsuleId = req.params.id;
    const { title, description, isCommunal } = req.body;

    // We only allow updating if a field is provided.
    if (!title && !description && isCommunal === undefined) {
        return res.status(400).json({ error: 'At least one field (title, description, or isCommunal) is required for update.' });
    }

    try {
        // 1. Verify the user is the creator
        const checkResult = await db.query(
            'SELECT creator_id, unlock_date FROM capsules WHERE capsule_id = $1', 
            [capsuleId]
        );
        
        const capsule = checkResult.rows[0];

        if (!capsule) {
            return res.status(404).json({ error: 'Capsule not found.' });
        }
        if (capsule.creator_id !== userId) {
            return res.status(403).json({ error: 'Forbidden. You can only edit capsules you created.' });
        }
        
        // 2. Prevent editing if the capsule is unlocked (optional, but good practice)
        if (new Date() >= new Date(capsule.unlock_date)) {
             return res.status(400).json({ error: 'Cannot edit metadata for an unlocked capsule.' });
        }

        // 3. Construct the dynamic update query
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (isCommunal !== undefined) {
            updates.push(`is_communal = $${paramIndex++}`);
            values.push(isCommunal);
        }

        if (updates.length === 0) {
             return res.status(400).json({ error: 'No valid fields provided for update.' });
        }

        values.push(capsuleId); // Add capsuleId as the final parameter

        const updateQuery = `
            UPDATE capsules 
            SET ${updates.join(', ')} 
            WHERE capsule_id = $${paramIndex} 
            RETURNING *;
        `;

        // 4. Execute the update
        const result = await db.query(updateQuery, values);

        res.status(200).json({ 
            message: 'Time capsule updated successfully.',
            capsule: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating capsule:', error);
        res.status(500).json({ error: 'Server error during capsule update.' });
    }
};
// NOTE: We will skip the Update and Delete for now to prioritize media handling next.