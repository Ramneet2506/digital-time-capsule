// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [capsules, setCapsules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCapsules = async () => {
            try {
                // Axios uses the JWT attached in AuthContext
                const response = await axios.get('/capsules/mine');
                setCapsules(response.data.capsules);
            } catch (err) {
                console.error('Failed to fetch capsules:', err);
                setError('Failed to load your time capsules.');
            } finally {
                setLoading(false);
            }
        };

        fetchCapsules();
    }, []);

    if (loading) return <div className="loading-spinner">Loading Capsules...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="dashboard-container">
            <header>
                <h1>Welcome back, {user?.email}!</h1>
                <nav>
                    <Link to="/create" className="btn-primary">
                        + Create New Capsule
                    </Link>
                    <button onClick={logout} className="btn-secondary">
                        Logout
                    </button>
                </nav>
            </header>

            <main>
                <h2>Your Time Capsules ({capsules.length})</h2>
                {capsules.length === 0 ? (
                    <p>You haven't created any capsules yet. Get started!</p>
                ) : (
                    <div className="capsule-list">
                        {capsules.map((capsule) => (
                            // Use a link to navigate to a detail page (Step 3)
                            <Link to={`/capsule/${capsule.capsule_id}`} key={capsule.capsule_id} className="capsule-card">
                                <h3>{capsule.title}</h3>
                                <p>{capsule.description || 'No description.'}</p>
                                <p>🔒 Unlocks: {new Date(capsule.unlock_date).toDateString()}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;