import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserProfileById, fetchUserStoriesById } from "../API";

export default function UserProfile() {
  const { authorId } = useParams();
  const [user, setUser] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [userError, setUserError] = useState(null);
  const [storiesError, setStoriesError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
                            <div class="story-card">
                              <h3>{story.title}</h3>
                              <p>{story.summary || "No summary available"}</p>
                              <button
                                onClick={() =>
                                  navigate(`/stories/${story.storyId}`)
                                }
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