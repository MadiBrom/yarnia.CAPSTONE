import React, { useEffect, useState } from "react";
import { fetchFollowers } from "../API"; // Ensure fetchFollowers is properly exported in your API file.

const FollowingSection = ({ userId }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserFollowers = async () => {
      try {
        const data = await fetchFollowers(userId);
        setFollowers(data);
      } catch (error) {
        setError("Failed to fetch the following list. Please try again later.");
        console.error("Error fetching followers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFollowers();
  }, [userId]);

  if (loading) {
    return <div className="loading">Loading...</div>; // Replace with a spinner or styled loader if needed.
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (followers.length === 0) {
    return <div className="empty">You are not following anyone yet.</div>;
  }

  return (
    <div className="following-section">
      <h3>Following ({followers.length})</h3>
      <ul className="following-list">
        {followers.map((follower) => (
          <li key={follower.id} className="follower-item">
            <img
              src={follower.profilePicture || "/default-avatar.png"}
              alt={`${follower.username}'s avatar`}
              className="follower-avatar"
            />
            <div className="follower-details">
              <h4>{follower.name}</h4>
              <p>@{follower.username}</p>
            </div>
            <button className="unfollow-button">Unfollow</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowingSection;
