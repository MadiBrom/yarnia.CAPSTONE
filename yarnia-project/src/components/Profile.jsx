import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBookmarkedStories } from "../API";
import { fetchWithAuth } from "../API";

const Profile = ({ user, setUser }) => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
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
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const hiddenFileInput = useRef(null);
  const authorId = user?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const bookmarksPerPage = 5;
  const [currentCommentsPage, setCurrentCommentsPage] = useState(1);
  const commentsPerPage = 5;
  const [currentStoriesPage, setCurrentStoriesPage] = useState(1);
  const storiesPerPage = 5;

  const indexOfLastBookmark = currentPage * bookmarksPerPage;
  const indexOfFirstBookmark = indexOfLastBookmark - bookmarksPerPage;
  const currentBookmarks = bookmarks.slice(
    indexOfFirstBookmark,
    indexOfLastBookmark
  );
  const indexOfLastComment = currentCommentsPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const indexOfLastStory = currentStoriesPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = stories.slice(indexOfFirstStory, indexOfLastStory);

  const handleReadMore = (storyId) => {
    navigate(`/stories/${storyId}`);
  };

  const handleStoryDelete = async (storyId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this story? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        // Remove the deleted story from the state
        setStories((prevStories) =>
          prevStories.filter((story) => story.storyId !== storyId)
        );
      } else {
        console.error("Failed to delete story");
        setError("An error occurred while deleting the story.");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      setError("An error occurred while deleting the story.");
    }
  };

  // Fetch user data and their stories when the component mounts
  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:3000/api/auth/me");

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setUsername(userData.username);
        setBio(userData.bio);
        setIsAuthenticated(true);

        // Fetch the user's stories, bookmarks, and comments after fetching user data
        await fetchUserStories(userData.id);
        await fetchUserBookmarks(userData.id);
        await fetchUserComments(userData.id);
      } else {
        console.error("Failed to fetch user data");
        setIsAuthenticated(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleClicker = () => {
    navigate('/followers');  // Navigate to the Followers page
};
const handleClickers = () => {
  navigate('/following');  // Navigate to the Followers page
};

  // Fetch stories written by the user
  const fetchUserStories = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/stories`
      );
      if (response.ok) {
        const userStories = await response.json();
        setStories(userStories); // Set stories in state
      }
    } catch (error) {
      console.error("Error fetching user stories:", error);
      setError("An error occurred while fetching stories.");
    }
  };

  // Fetch user's bookmarked stories
  const fetchUserBookmarks = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkedStories = await fetchBookmarkedStories(userId, token);
      setBookmarks(bookmarkedStories);
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
      setError("An error occurred while fetching bookmarks.");
    }
  };

  // Fetch all comments made by the user
  const fetchUserComments = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/comments`
      );
      if (response.ok) {
        const userComments = await response.json();

        setComments(userComments);
      }
    } catch (error) {
      console.error("Error fetching user comments:", error);
      setError("An error occurred while fetching comments.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle save action for editing profile
  const handleSave = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:3000/api/users/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ username, bio }),
        }
      );

      if (response.ok) {
        await fetchUserData();
        setIsEditing(false);
        setSaveError(null);
      } else {
        setSaveError("Failed to update profile");
      }
    } catch (error) {
      setSaveError("Error while updating profile.");
    }
  };

  const deleteUserAccount = async (authorId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account and all your stories? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${authorId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        localStorage.removeItem("token");

        setUser(null);

        // Redirect to the homepage
        navigate("/");
      } else {
        const textResponse = await response.text();
        const responseData = JSON.parse(textResponse);
        console.error("Error deleting account:", responseData.message);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const fetchFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${user.id}/followers`
      );
      if (response.ok) {
        const followersData = await response.json();
        setFollowers(followersData);
      } else {
        console.error("Failed to fetch followers");
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoadingFollowers(false);
    }
  };
  
  const fetchFollowing = async () => {
    setLoadingFollowing(true);
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${user.id}/following`
      );
      if (response.ok) {
        const followingData = await response.json();
        setFollowing(followingData);
      } else {
        console.error("Failed to fetch following");
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoadingFollowing(false);
    }
  };
  

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const imgname = event.target.files[0].name;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = Math.max(img.width, img.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          img,
          (maxSize - img.width) / 2,
          (maxSize - img.height) / 2
        );
        canvas.toBlob(
          (blob) => {
            const file = new File([blob], imgname, {
              type: "image/*",
              lastModified: Date.now(),
            });

            setImage(file);
          },
          "image/jpeg",
          0.8
        );
      };
    };
  };

  const updateUserProfileWithImage = async (profileUrl) => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:3000/api/users/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ profilePicture: profileUrl }),
        }
      );

      if (response.ok) {
        await fetchUserData();
      } else {
        console.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error while updating profile picture:", error);
    }
  };

  const handleUploadButtonClick = async (file) => {
    if (!file) {
      console.error("No file selected for upload.");

      return;
    }

    try {
      const myHeaders = new Headers();
      const token = localStorage.getItem("token");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("file", file);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      const response = await fetch(
        "http://localhost:3000/api/upload/profile_pic",
        requestOptions
      );
      if (response.ok) {
        const result = await response.json();
        const profileUrl = result.img_url;
        setImage(profileUrl);
        await updateUserProfileWithImage(profileUrl);
      } else {
        console.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  // Handle delete action for comments
  const handleCommentDelete = async (commentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }
    try {
      const url = `http://localhost:3000/api/comments/${commentId}`;
      const response = await fetchWithAuth(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.commentId !== commentId)
        );
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) {
    return <div>Loading user data...</div>;
  }
  if (!isAuthenticated || !user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <br />
      <section id="whole-profile">
        <div className="profile">
          <div className="profile-stories-wrapper">
            <div className="profile-container">
              <h1 id="welcome">
                Welcome,{" "}
                {isEditing ? (
                  <div className="group">
                    <input
                      id="username"
                      className="input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                ) : (
                  user.username
                )}
                !
              </h1>
              <div className="info">
                <h4 id="label">Email:</h4>
                <p>{user.email}</p>
  
                <h4 id="label">Bio:</h4>
                <p>
                  {isEditing ? (
                    <div className="group">
                      <textarea
                        id="bio"
                        className="form-textarea"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                  ) : (
                    user.bio
                  )}
                </p>
              </div>
              {isEditing ? (
                <div className="button-group">
                  <button className="button" onClick={handleSave}>
                    Save
                  </button>
                  <button
                    className="button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
              {saveError && <p className="error-message">{saveError}</p>}
  
              <button onClick={handleClicker}>
                {loadingFollowers ? "Loading followers..." : "See Followers"}
              </button>
              <button onClick={handleClickers}>
                {loadingFollowing ? "Loading following..." : "See Following"}
              </button>
            </div>
  
            {/* Followers Section */}
            {followers.length > 0 && (
              <div>
                <h3>Followers:</h3>
                <ul>
                  {followers.map((follower) => (
                    <li key={follower.id}>{follower.username}</li>
                  ))}
                </ul>
              </div>
            )}
  
            {/* Following Section */}
            {following.length > 0 && (
              <div>
                <h3>Following:</h3>
                <ul>
                  {following.map((followee) => (
                    <li key={followee.id}>{followee.username}</li>
                  ))}
                </ul>
              </div>
            )}
  
            {/* Comment History Section */}
            <div className="profile-container">
              <h3 id="history">Comment History:</h3>
              {comments.length > 0 ? (
                <>
                  <ul className="comment-list">
                    {currentComments.map((comment) => (
                      <li className="comments-item" key={comment.commentId}>
                        <strong>Story: {comment.story.title}</strong>
                        <p>{comment.content}</p>
                        <br />
                        <div className="button-group">
                          <button
                            onClick={() => handleReadMore(comment.storyId)}
                            className="button"
                          >
                            View Story
                          </button>
                          <button
                            onClick={() => handleCommentDelete(comment.commentId)}
                            className="button"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Pagination Controls */}
                  <div className="pagination-controls">
                    <button
                      onClick={() =>
                        setCurrentCommentsPage((prev) =>
                          Math.max(prev - 1, 1)
                        )
                      }
                      disabled={currentCommentsPage === 1}
                    >
                      Previous
                    </button>
                    <span>
                      Page {currentCommentsPage} of{" "}
                      {Math.ceil(comments.length / commentsPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentCommentsPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(comments.length / commentsPerPage)
                          )
                        )
                      }
                      disabled={
                        currentCommentsPage ===
                        Math.ceil(comments.length / commentsPerPage)
                      }
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p>No comments found</p>
              )}
            </div>
  
            {/* Bookmarks Section */}
            <div className="profile-container">
              <h2>Your Bookmarks</h2>
              {bookmarks.length > 0 ? (
                <>
                  <ul className="bookmark-list">
                    {currentBookmarks.map((bookmark) => (
                      <li key={bookmark.bookmarkId} className="bookmark-item">
                        <h3>{bookmark.story.title}</h3>
                        <p>
                          {bookmark.story.summary || "No summary available"}
                        </p>
                        <button
                          onClick={() => handleReadMore(bookmark.storyId)}
                          className="button"
                        >
                          Read more
                        </button>
                      </li>
                    ))}
                  </ul>
                  {/* Pagination Controls */}
                  <div className="pagination-controls">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>
                      Page {currentPage} of{" "}
                      {Math.ceil(bookmarks.length / bookmarksPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(bookmarks.length / bookmarksPerPage)
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(bookmarks.length / bookmarksPerPage)
                      }
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p>No bookmarks found.</p>
              )}
            </div>
          </div>
          <div className="bottom-container">
            <h2>Your Stories</h2>
            {error && <p className="error-message">{error}</p>}
  
            {stories.length > 0 ? (
              <>
                <ul className="story-list">
                  {currentStories.map((story) => (
                    <div className="story-item" key={story.storyId}>
                      <li>
                        <div id="story-card">
                          <h3>{story.title}</h3>
                          <p>{story.summary || "No summary available"}</p>
                        </div>
                        <div className="button-group">
                          <button
                            onClick={() => handleReadMore(story.storyId)} // Navigate to the single story
                            className="button"
                          >
                            Read more
                          </button>
                          <button
                            onClick={() => handleStoryDelete(story.storyId)}
                            className="button"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    </div>
                  ))}
                </ul>
                {/* Pagination Controls for Stories */}
                <div className="pagination-controls">
                  <button
                    onClick={() =>
                      setCurrentStoriesPage((prev) =>
                        Math.max(prev - 1, 1)
                      )
                    }
                    disabled={currentStoriesPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentStoriesPage} of{" "}
                    {Math.ceil(stories.length / storiesPerPage)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentStoriesPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(stories.length / storiesPerPage)
                        )
                      )
                    }
                    disabled={
                      currentStoriesPage === Math.ceil(stories.length / storiesPerPage)
                    }
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p>Nothing to find here...</p>
            )}
          </div>
        </div>
      </section>
      <div className="button-group">
        <button
          className="delete-account"
          onClick={() => deleteUserAccount(authorId)}
        >
          Delete Account
        </button>
      </div>
    </>
  );  
};

export default Profile;
