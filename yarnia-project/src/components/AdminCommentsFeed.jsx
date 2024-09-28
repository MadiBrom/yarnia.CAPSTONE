import { useEffect, useState } from "react";
import { fetchAllComments, deleteComment } from "../API"; // Adjust the path to your API file

export default function AdminCommentsFeed() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all comments when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const allComments = await fetchAllComments();
        console.log(allComments); // Log comments to verify structure
        setComments(allComments);
      } catch (err) {
        setError("Failed to fetch comments.");
      }
    };

    fetchComments();
  }, []);

  // Handle delete action for comments
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(null, commentId); // `null` for storyId, only passing commentId
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );
    } catch (error) {
      console.error("Failed to delete the comment:", error);
      setError("Failed to delete the comment.");
    }
  };

  return (
    <div className="admin-comments-container">
      <h2>All Comments</h2>
      {error && <p className="error">{error}</p>}
      <ul className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.commentId} className="comment-item">
              <div className="comment-content">
                {/* Placeholder Avatar with Initials */}
                <div className="comment-avatar">
                  {comment.user?.username
                    ? comment.user.username.charAt(0).toUpperCase()
                    : "U"}
                </div>
                {/* Comment Details Section */}
                <div className="comment-details">
                  <span className="comment-username">
                    {comment.user?.username || "Unknown User"}
                  </span>
                  <p className="comment-text">
                    {comment.content || "No content available"}
                  </p>
                </div>
              </div>
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteComment(comment.commentId)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p>No comments available.</p>
        )}
      </ul>
    </div>
  );
}
