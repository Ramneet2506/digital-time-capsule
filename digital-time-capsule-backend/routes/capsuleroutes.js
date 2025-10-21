// routes/capsuleRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload'); 
const capsuleController = require('../controllers/capsulecontroller');
const contentController = require('../controllers/contentcontroller'); // Import controller

// All routes below require a valid JWT via the 'protect' middleware

// POST /api/capsules -> Create a new time capsule
router.post('/', protect, capsuleController.createCapsule);

// GET /api/capsules/mine -> Get all capsules for the authenticated user
router.get('/mine', protect, capsuleController.getAllUserCapsules); 

// GET /api/capsules/:id -> Get details of a single capsule (with lock logic)
router.get('/:id', protect, capsuleController.getCapsuleDetails);

// POST /api/capsules/:id/content -> Add content (file or text) to a capsule
router.post(
    '/:id/content', 
    protect, 
    upload.single('file'), // Multer middleware: expects a file named 'file' in the form data
    contentController.addContentToCapsule
);

// NEW ROUTE: DELETE /api/capsules/:id -> Delete a capsule
router.delete('/:id', protect, capsuleController.deleteCapsule); 

// NEW ROUTE: PATCH /api/capsules/:id -> Update capsule metadata
router.patch('/:id', protect, capsuleController.updateCapsule); 


// Example: routes/capsuleRoutes.js (Add a new GET route)
// ...
router.get('/media/signed-url', protect, async (req, res) => {
    const { key } = req.query;
    try {
        const signedUrl = await gcsService.getSignedUrl(key);
        res.json({ url: signedUrl });
    } catch (e) {
        res.status(500).json({ error: 'Could not generate signed URL.' });
    }
});

module.exports = router;