import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUserProfileById,
  fetchUserStoriesById,
  fetchUserFollowersCount,
  fetchUserFollowingCount,
  followUser,
  unfollowUser,
  isUserFollowing,
} from "../API";

export default function UserProfile() {
  const { authorId } = useParams();
  const [user, setUser] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [userError, setUserError] = useState(null);
  const [storiesError, setStoriesError] = useState(null);
  const [followersCount, setFollowersCount] = useState(0); // Initialize followers count
  const [followingCount, setFollowingCount] = useState(0); // Initialize following count
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false); // Track follow status
  const navigate = useNavigate();
  const loggedInUserId = 123; // Replace with actual logic to get logged-in user's ID

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserProfileById(authorId);
        if (userData) {
          setUser(userData);
        } else {
          setUserError("User not found.");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authorId]);

  // Fetch user stories
  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const storiesData = await fetchUserStoriesById(authorId);
        if (storiesData && storiesData.length > 0) {
          setUserStories(storiesData);
        } else {
          setUserStories([]);
        }
      } catch (error) {
        console.error("No stories found:", error);
        setStoriesError("No stories found.");
      }
    };

    if (authorId) {
      fetchUserStories();
    }
  }, [authorId]);

  // Fetch followers count
  useEffect(() => {
    const fetchFollowersCount = async () => {
      try {
        const count = await fetchUserFollowersCount(authorId);
        setFollowersCount(count);
      } catch (error) {
        console.error("Failed to fetch followers count:", error);
      }
    };

    if (authorId) {
      fetchFollowersCount();
    }
  }, [authorId]);

  // Fetch following count
  useEffect(() => {
    const fetchFollowingCount = async () => {
      try {
        const count = await fetchUserFollowingCount(authorId);
        setFollowingCount(count);
      } catch (error) {
        console.error("Failed to fetch following count:", error);
      }
    };

    if (authorId) {
      fetchFollowingCount();
    }
  }, [authorId]);

  // Check if the logged-in user is already following
  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const status = await isUserFollowing(loggedInUserId, authorId);
        setIsFollowing(status); // Set follow status
      } catch (error) {
        console.error("Failed to check follow status:", error);
      }
    };

    if (loggedInUserId) {
      checkFollowingStatus();
    }
  }, [loggedInUserId, authorId]);

  const handleFollow = async () => {
    try {
      // Show loading spinner or disabled state on button
      setLoading(true);
  
      if (isFollowing) {
        await unfollowUser(authorId); // Use authorId
      } else {
        await followUser(authorId); // Use authorId
      }
  
      // Update state after API call
      setIsFollowing(!isFollowing);
      setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  
      // Hide loading spinner or re-enable button
      setLoading(false);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      // Show error alert or message
      alert("Something went wrong while updating the follow status. Please try again.");
      setLoading(false);
    }
  };
  

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (userError) return <p>{userError}</p>;

  return (
    <>
      <section id="whole-profile">
        <div className="profile">
          <div className="user-profile-container">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="User's Profile Picture"
                style={{ maxWidth: "100%", maxHeight: "300px" }}
              />
            ) : (
              <p>No profile picture available.</p>
            )}

            {user ? (
              <>
                <div className="profile-header">
                  <h1>{user.username}</h1>
                  <p>Bio: {user.bio}</p>
                  <p>Followers: {followersCount}</p> {/* Display followers count */}
                  <p>Following: {followingCount}</p> {/* Display following count */}
                  <button onClick={handleFollow} className="button">
                    {isFollowing ? "Unfollow" : "Follow Me"}
                  </button>
                </div>

                {/* Stories Section */}
                <div className="profile-stories-wrapper">
                  <h2>{user.username}'s Stories</h2>
                  {storiesError ? (
                    <p>{storiesError}</p>
                  ) : userStories.length > 0 ? (
                    <ul className="story-list">
                      {userStories.map((story) => (
                        <div className="story-item" key={story.id}>
                          <li>
                            <div className="story-card">
                              <h3>{story.title}</h3>
                              <p>{story.summary || "No summary available"}</p>
                              <button
                                onClick={() => navigate(`/stories/${story.storyId}`)}
                                className="button"
                              >
                                Read more
                              </button>
                            </div>
                          </li>
                        </div>
                      ))}
                    </ul>
                  ) : (
                    <p>No stories available.</p>
                  )}
                </div>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
