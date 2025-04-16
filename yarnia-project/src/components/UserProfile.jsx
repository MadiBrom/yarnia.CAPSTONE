import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserProfileById, fetchUserStoriesById } from "../API";
import DefaultAvatar from "./images/anonav.jpg";


export default function UserProfile() {
  const { authorId } = useParams();
  const [user, setUser] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [userError, setUserError] = useState(null);
  const [storiesError, setStoriesError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserProfileById(authorId);
        if (userData) setUser(userData);
        else setUserError("User not found.");
      } catch (error) {
        setUserError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [authorId]);

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const storiesData = await fetchUserStoriesById(authorId);
        setUserStories(storiesData || []);
      } catch {
        setStoriesError("No stories found.");
      }
    };
    if (authorId) fetchUserStories();
  }, [authorId]);

  if (loading) return <div className="text-center py-6 text-primary dark:text-primary-dark">Loading user data...</div>;
  if (userError) return <p className="text-red-600 text-center py-6">{userError}</p>;

  return (
    <section className="min-h-screen w-full bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto bg-card dark:bg-card-dark shadow-md rounded-lg p-8 sm:p-10 border border-border dark:border-border-dark">
        {user ? (
          <>
<div className="mb-8 border-b pb-6 border-border dark:border-border-dark flex items-center space-x-6">
<img
  src={user.avatar ? `http://localhost:3000${user.avatar}` : DefaultAvatar}
    alt={`${user.username}'s avatar`}
    className="w-24 h-24 rounded-full object-cover "
  />
  <div>
    <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
    <p className="text-secondary dark:text-secondary-dark text-lg">Bio: {user.bio}</p>
  </div>
</div>


            <div>
              <h2 className="text-3xl font-semibold mb-6">{user.username}'s Stories</h2>
              {storiesError ? (
                <p className="text-red-600">{storiesError}</p>
              ) : userStories.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userStories.map((story) => (
                    <li key={story.storyId} className="bg-layer dark:bg-layer-dark p-6 rounded-lg shadow border border-border dark:border-border-dark">
                      <h3 className="text-2xl font-semibold mb-2">{story.title}</h3>
                      <p className="text-sm text-secondary dark:text-secondary-dark mb-4">{story.summary || "No summary available"}</p>
                      <button
                        onClick={() => navigate(`/stories/${story.storyId}`)}
                        className="bg-button hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark text-white px-4 py-2 rounded"
                      >
                        Read more
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary dark:text-secondary-dark">No stories available.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-secondary dark:text-secondary-dark">Loading...</p>
        )}
      </div>
    </section>
  );
}
