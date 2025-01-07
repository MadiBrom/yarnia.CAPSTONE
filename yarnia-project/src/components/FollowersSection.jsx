import React, { useState, useEffect } from 'react';

function FollowersSection() {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const response = await fetch('/api/followers');
                if (!response.ok) {
                    throw new Error("Failed to fetch followers.");
                }
                const data = await response.json();
                setFollowers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowers();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (followers.length === 0) {
        return <div className="empty">You don’t have any followers yet.</div>;
    }

    return (
        <div className="followers-section">
            <h2>Your Followers ({followers.length})</h2>
            <ul className="followers-list">
                {followers.map((follower) => (
                    <li key={follower.id} className="follower-item">
                        <img
                            src={follower.profilePicture || '/default-avatar.png'}
                            alt={`${follower.name}'s avatar`}
                            className="follower-avatar"
                        />
                        <div className="follower-details">
                            <h3>{follower.name}</h3>
                            <p>@{follower.username}</p>
                        </div>
                        <button className="follow-back-button">Follow Back</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FollowersSection;
