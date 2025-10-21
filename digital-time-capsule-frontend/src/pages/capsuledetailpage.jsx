// src/pages/CapsuleDetailPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ContentForm from '../components/contentform'; // Component for adding content
import { useAuth } from '../context/authcontext'; // <--- CRITICAL: Import useAuth hook

const CapsuleDetailPage = () => {
    const { capsuleId } = useParams();
    const { user } = useAuth(); // <--- CRITICAL: Get authenticated user data
    const [capsule, setCapsule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const fetchCapsule = async () => {
        try {
            // Fetch capsule details from the protected backend endpoint
            const response = await axios.get(`/capsules/${capsuleId}`);
            setCapsule(response.data);
        } catch (err) {
            console.error('Failed to fetch capsule details:', err.response?.data || err.message);
            setError('Failed to load capsule details. Check permissions or ID.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Ensure user is loaded before fetching if required for initial checks
        if (user || !loading) {
            fetchCapsule();
        }
    }, [capsuleId, user]); // Depend on user to refresh if state changes

    // DELETE HANDLER
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this capsule and all its contents? This cannot be undone.")) {
            return;
        }

        try {
            await axios.delete(`/capsules/${capsuleId}`);
            alert(`Capsule "${capsule.title}" was permanently deleted.`);
            navigate('/dashboard'); 
        } catch (error) {
            console.error('Deletion failed:', error.response?.data || error.message);
            alert(error.response?.data.error || 'Failed to delete capsule. Check ownership/permissions.');
        }
    };

    // UPDATE HANDLER
    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Use FormData to easily extract form fields
        const formData = new FormData(e.target);
        
        const updates = {
            title: formData.get('title'),
            description: formData.get('description'),
            // FormData returns 'on' for checked, so check for existence
            isCommunal: formData.has('isCommunal') ? true : false, 
        };

        try {
            await axios.patch(`/capsules/${capsuleId}`, updates);
            alert('Capsule updated successfully!');
            setIsEditing(false); 
            fetchCapsule(); // Refresh data
        } catch (error) {
            console.error('Update failed:', error.response?.data || error.message);
            alert(error.response?.data.error || 'Failed to update capsule.');
        }
    };

    if (loading || !user) return <div>Loading Capsule Details...</div>; // Wait for user info
    if (error) return <div className="error-message">{error}</div>;
    if (!capsule) return <div>Capsule Not Found.</div>;

    const isLocked = capsule.status === 'LOCKED';
    const unlockDateStr = new Date(capsule.unlock_date).toDateString();
    const { moodSummary, averageSentimentScore } = capsule;
    
    // Check if the authenticated user is the creator
    const isCreator = capsule.creator_id === user.id; // User ID from context is now available

    // -----------------------------------------------------------------
    // Conditional Rendering of Edit Form
    // -----------------------------------------------------------------
    if (isEditing && isCreator && isLocked) { // Only allow editing if locked AND user is creator
        return (
            <div className="edit-form-container">
                <h2>Edit Capsule: {capsule.title}</h2>
                <form onSubmit={handleUpdate}>
                    <label>Title:</label>
                    <input type="text" name="title" defaultValue={capsule.title} required />

                    <label>Description:</label>
                    <textarea name="description" defaultValue={capsule.description || ''} rows="3"></textarea>

                    <label>
                        <input type="checkbox" name="isCommunal" defaultChecked={capsule.is_communal} />
                        Is Communal
                    </label>
                    
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                </form>
            </div>
        );
    }
    // -----------------------------------------------------------------

    return (
        <div className="capsule-detail-container">
            <h2>
                {capsule.title}
                {/* Edit Button: Visible to creator only, if capsule is locked */}
                {isCreator && isLocked && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="btn-secondary" 
                        style={{ marginLeft: '10px', fontSize: '16px' }}
                    >
                        Edit Details
                    </button>
                )}
            </h2>
            <p className="description">{capsule.description}</p>
            <p>
                Created on: {new Date(capsule.created_at).toDateString()} by User {capsule.creator_id}
            </p>
            
            {/* Time Lock Logic Display */}
            <div className={`lock-status ${isLocked ? 'locked' : 'unlocked'}`}>
                {isLocked ? (
                    <p>🔒 **LOCKED.** Contents will be revealed on: **{unlockDateStr}**</p>
                ) : (
                    <p>🎉 **UNLOCKED!** Contents revealed on: **{unlockDateStr}**</p>
                )}
            </div>

            {/* Delete Button: Visible to creator only */}
            {isCreator && (
                <button 
                    onClick={handleDelete} 
                    className="btn-danger" 
                    style={{ marginTop: '20px' }}
                >
                    Delete Capsule
                </button>
            )}
            
            <hr />

            {/* Content Display / Contribution Section */}
            {!isLocked ? (
                // Display Contents if UNLOCKED
                <section className="capsule-contents">
                    <div className="sentiment-summary">
                        <h3>🤖 AI Mood Analysis: {moodSummary}</h3>
                        <p>Average Sentiment Score: {averageSentimentScore}</p>
                        <small>*Score is an average of the sentiment analysis on all text entries.</small>
                    </div>

                    <h3>Contents:</h3>
                    {capsule.contents && capsule.contents.length > 0 ? (
                        capsule.contents.map((content) => (
                            <div key={content.content_id} className="content-item">
                                <p>Type: **{content.content_type}**</p>
                                {content.content_type === 'text' && (
                                    <>
                                        <p>{content.content_text}</p>
                                        <small>Text Sentiment Score: **{content.sentiment_score}**</small>
                                    </>
                                )}
                                {content.content_type === 'image' && (
                                    <img src={content.content_url} alt="Capsule Content" style={{ maxWidth: '300px' }} />
                                )}
                                {content.content_type === 'video' && (
                                    <video controls src={content.content_url} style={{ maxWidth: '400px' }} />
                                )}
                                <small>Contributed by: User {content.contributor_id}</small>
                            </div>
                        ))
                    ) : (
                        <p>This capsule is empty!</p>
                    )}
                </section>
            ) : (
                // Allow Content Addition only if LOCKED
                <section className="add-content">
                    <h3>Add a New Memory</h3>
                    <ContentForm capsuleId={capsuleId} onContentAdded={fetchCapsule} />
                    <p className="note">Your contribution will be locked until the unlock date.</p>
                </section>
            )}
        </div>
    );
};

export default CapsuleDetailPage;