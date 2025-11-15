import { useEffect, useState, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchBookmarkedStories, fetchWithAuth } from "../API";
import Avatar from "./images/anonav.jpg"; // Placeholder for avatar image
import AddStory from "./addStory"; // adjust path if different


const TABS = ["Bookmarks", "Comments", "Stories", "Add Story"];

const Profile = ({ user, setUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [stories, setStories] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Bookmarks");
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const authorId = user?.id;

  const handleReadMore = (storyId) => navigate(`/stories/${storyId}`);

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
  
    const formData = new FormData();
    formData.append("avatar", selectedFile);
  
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
  
      if (res.ok) {
        const data = await res.json();
        setUser((prevUser) => ({ ...prevUser, avatar: data.avatar }));
      } else {
        console.error("Failed to upload avatar");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
    }
  };

  const handleStoryDelete = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      const response = await fetchWithAuth(`${API_URL}/api/stories/${storyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        setStories((prev) => prev.filter((s) => s.storyId !== storyId));
      } else {
        setError("An error occurred while deleting the story.");
      }
    } catch (error) {
      setError("An error occurred while deleting the story.");
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth("${API_URL}/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setUsername(userData.username);
        setBio(userData.bio);
        setIsAuthenticated(true);
        await fetchUserStories(userData.id);
        await fetchUserBookmarks(userData.id);
        await fetchUserComments(userData.id);
      } else {
        navigate("/login");
      }
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStories = async (userId) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/users/${userId}/stories`);
      if (response.ok) {
        setStories(await response.json());
      }
    } catch {
      setError("Error fetching stories.");
    }
  };

  const fetchUserBookmarks = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkedStories = await fetchBookmarkedStories(userId, token);
      setBookmarks(bookmarkedStories);
    } catch {
      setError("Error fetching bookmarks.");
    }
  };

  const fetchUserComments = async (userId) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/users/${userId}/comments`);
      if (response.ok) {
        setComments(await response.json());
      }
    } catch {
      setError("Error fetching comments.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetchWithAuth("${API_URL}/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username, bio }),
      });
      if (response.ok) {
        await fetchUserData();
        setIsEditing(false);
        setSaveError(null);
      } else {
        setSaveError("Failed to update profile");
      }
    } catch {
      setSaveError("Error while updating profile.");
    }
  };

  const deleteUserAccount = async (authorId) => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${authorId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 204) {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const response = await fetchWithAuth(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.commentId !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) return <div className="text-center py-6 text-primary dark:text-primary-dark">Loading user data...</div>;
  if (!isAuthenticated || !user) return <div className="text-center py-6 text-secondary dark:text-secondary-dark">Redirecting to login...</div>;

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-card dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <img
  src={user.avatar ? `${API_URL}${user.avatar}` : Avatar}
  alt="Profile"
  className="w-24 h-24 rounded-full object-cover mb-4"
/>

{isEditing && (
  <form
    onSubmit={handleAvatarUpload}
    encType="multipart/form-data"
    className="space-y-4 mb-6"
  >
    <label
      htmlFor="avatar-upload"
      className="block text-sm font-medium text-secondary dark:text-secondary-dark"
    >
      Change Profile Picture
    </label>
    <input
      id="avatar-upload"
      type="file"
      accept="image/*"
      onChange={(e) => setSelectedFile(e.target.files[0])}
      className="w-full rounded border border-border dark:border-border-dark bg-input dark:bg-input-dark text-sm text-input-text dark:text-input-text-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-button dark:file:bg-button-dark file:text-white hover:file:bg-button-hover dark:hover:file:bg-button-hover-dark"
    />
    <button
      type="submit"
      className="bg-button dark:bg-button-dark hover:bg-button-hover dark:hover:bg-button-hover-dark text-white px-4 py-2 rounded-md shadow transition-colors"
    >
      Upload Avatar
    </button>
  </form>
)}

  
          <p className="mt-4 mb-2">
            <span className="font-semibold">Username:</span> {user.username}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p className="mb-4">
            <span className="font-semibold">Bio:</span> {bio}
          </p>
  
          {isEditing ? (
            <>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 rounded border bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark mb-2"
              />
              <button onClick={handleSave} className="bg-button text-white w-full py-2 rounded mb-2">
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="w-full py-2 bg-input dark:bg-layer hover:bg-button-hover rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-button text-white w-full py-2 rounded">
              Edit Profile
            </button>
          )}
  
          <button
            onClick={() => deleteUserAccount(authorId)}
            className="mt-6 text-sm text-red-500 underline"
          >
            Delete Account
          </button>
        </aside>
  
        {/* Main Content */}
        <main>
          <div className="flex border-b border-border dark:border-border-dark mb-6 space-x-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-lg font-semibold ${
                  activeTab === tab
                    ? "border-b-2 border-button text-button"
                    : "text-secondary dark:text-secondary-dark"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
  
          {/* Tab Content */}
          {activeTab === "Bookmarks" && (
            <section className="space-y-4">
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.bookmarkId}
                    className="bg-layer dark:bg-layer-dark p-4 rounded shadow border border-border dark:border-border-dark"
                  >
                    <h3 className="text-lg font-bold mb-1">{bookmark.story.title}</h3>
                    <p className="text-sm text-secondary dark:text-secondary-dark mb-2">
                      {bookmark.story.summary || "No summary available"}
                    </p>
                    <button
                      onClick={() => handleReadMore(bookmark.storyId)}
                      className="bg-button text-white px-3 py-1 rounded"
                    >
                      Read more
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-secondary dark:text-secondary-dark">No bookmarks found.</p>
              )}
            </section>
          )}
  
          {activeTab === "Comments" && (
            <section className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.commentId}
                    className="bg-layer dark:bg-layer-dark p-4 rounded shadow border border-border dark:border-border-dark"
                  >
                    <p className="font-semibold">Story: {comment.story.title}</p>
                    <p>{comment.content}</p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleReadMore(comment.storyId)}
                        className="bg-button text-white px-3 py-1 rounded"
                      >
                        View Story
                      </button>
                      <button
                        onClick={() => handleCommentDelete(comment.commentId)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary dark:text-secondary-dark">No comments found.</p>
              )}
            </section>
          )}
{activeTab === "Stories" && (
  <section className="space-y-4">
    {stories.length > 0 ? (
      stories.map((story) => (
        <div
          key={story.storyId}
          className="bg-layer dark:bg-layer-dark p-4 rounded shadow border border-border dark:border-border-dark"
        >
          <h3 className="text-lg font-bold mb-1">{story.title}</h3>
          <p className="text-sm text-secondary dark:text-secondary-dark mb-2">
            {story.summary || "No summary available"}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleReadMore(story.storyId)}
              className="bg-button text-white px-3 py-1 rounded"
            >
              Read more
            </button>
            <button
              onClick={() => handleStoryDelete(story.storyId)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))
    ) : (
      <p className="text-secondary dark:text-secondary-dark">You haven't written any stories yet.</p>
    )}
  </section>
)}

{activeTab === "Add Story" && (
  <section className="space-y-4">
    <AddStory onStoryAdded={(newStory) => setStories((prev) => [...prev, newStory])} />
  </section>
)}

        </main>
      </div>
    </div>
  );
  
};

export default Profile;