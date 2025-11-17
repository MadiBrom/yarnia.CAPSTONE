import { useState, useEffect } from "react";
import { fetchComments, postComment, deleteComment } from "../API";

const Comments = ({ storyId, refreshComments }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    const fetchStoryComments = async () => {
      setLoading(true);
      try {
        const commentsResponse = await fetchComments(storyId);
        setComments(commentsResponse);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setError("Failed to load comments.");
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchStoryComments();
    }
  }, [storyId, refreshComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      await postComment(storyId, newComment);
      setNewComment("");
      refreshComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
      setError("Failed to post comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;
    try {
      await deleteComment(storyId, commentId);
      refreshComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setError("Failed to delete comment.");
    }
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>

      {loading && <p>Loading comments...</p>}

      {comments.length > 0 ? (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment.commentId}>
              <strong>{comment.user?.username || "Unknown User"}</strong>:{" "}
              <p>{comment.content}</p>
              {comment.userId === userId && (
                <button
                  onClick={() => handleDeleteComment(comment.commentId)}
                  className="delete-button"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmitComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          required
        />
        <button type="submit">Submit Comment</button>
      </form>
    </div>
  );
};

export default Comments;
