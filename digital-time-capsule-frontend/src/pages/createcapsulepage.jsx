// src/pages/CreateCapsulePage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCapsulePage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [isCommunal, setIsCommunal] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation to ensure unlock date is in the future
        if (new Date(unlockDate) <= new Date()) {
            alert('The unlock date must be in the future!');
            return;
        }

        try {
            const newCapsule = {
                title,
                description,
                // The backend expects the date string
                unlockDate: new Date(unlockDate).toISOString(), 
                isCommunal,
            };

            const response = await axios.post('/capsules', newCapsule);
            
            alert(`Capsule "${response.data.capsule.title}" created successfully!`);
            navigate('/dashboard'); // Go back to the dashboard after creation
        } catch (error) {
            console.error('Capsule creation failed:', error.response?.data || error.message);
            alert('Failed to create capsule. Check the console for details.');
        }
    };

    return (
        <div className="form-container">
            <h2>Create Your Digital Time Capsule</h2>
            <form onSubmit={handleSubmit}>
                <label>Title:</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

                <label>Description (Optional):</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea>

                <label>Unlock Date:</label>
                <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} required />

                <label>
                    <input type="checkbox" checked={isCommunal} onChange={(e) => setIsCommunal(e.target.checked)} />
                    Is Communal (Allow others to contribute)
                </label>

                <button type="submit" className="btn-primary">Lock and Save Capsule</button>
            </form>
        </div>
    );
};

export default CreateCapsulePage;