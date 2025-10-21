// src/components/ContentForm.jsx

import React, { useState } from 'react';
import axios from 'axios';

const ContentForm = ({ capsuleId, onContentAdded }) => {
    const [contentText, setContentText] = useState('');
    const [file, setFile] = useState(null); // State to hold the selected file object
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!contentText && !file) {
            alert('Please add text or select a file (image/video) to contribute.');
            return;
        }

        setUploading(true);

        // 1. Create FormData object for multipart submission
        const formData = new FormData();
        
        // 2. Append text content
        if (contentText) {
            formData.append('contentText', contentText);
        }
        
        // 3. Append the file content (if a file is selected)
        // 'file' MUST match the key used in your Multer middleware: upload.single('file')
        if (file) {
            formData.append('file', file); 
        }

        try {
            // Send the request using the FormData object
            await axios.post(`/capsules/${capsuleId}/content`, formData, {
                headers: {
                    // Crucial: Set Content-Type to multipart/form-data for file uploads
                    'Content-Type': 'multipart/form-data', 
                },
            });

            alert('Content successfully added!');
            setContentText('');
            setFile(null); // Clear the file input
            onContentAdded(); // Re-fetch capsule details to update the view
        } catch (error) {
            console.error('Content upload failed:', error.response?.data || error.message);
            alert('Failed to add content. Check the console and ensure your S3 configuration is correct.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="content-form">
            <textarea 
                placeholder="Write a text message for the future..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows="4"
                disabled={uploading}
            />
            
            <label htmlFor="file-upload" className="file-upload-label">
                <input 
                    id="file-upload"
                    type="file" 
                    // Accept images and videos only
                    accept="image/*,video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    disabled={uploading}
                    // Style this input to be less obtrusive
                    style={{ display: 'none' }}
                />
                <button type="button" onClick={() => document.getElementById('file-upload').click()} disabled={uploading} style={{ marginRight: '10px' }}>
                    {file ? `File Selected: ${file.name}` : 'Select Image/Video (Optional)'}
                </button>
            </label>

            <button type="submit" disabled={uploading} className="btn-upload">
                {uploading ? 'Uploading...' : 'Add Contribution'}
            </button>
        </form>
    );
};

export default ContentForm;