import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchStoryComments } from "../API";

const StoryComments = () => {
  const { storyId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  useEffect(() => {
    const getComments = async () => {
      try {
        const response = await fetchStoryComments(storyId);
        setComments(response);
      } catch (err) {
        setError("Failed to load comments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getComments();
  }, [storyId]);

  const totalPages = Math.ceil(comments.length / commentsPerPage);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationControls = () => (
    <div className="flex justify-center space-x-2 mt-4">
      {currentPage > 1 && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-button text-white rounded-lg hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark"
        >
          Previous
        </button>
      )}
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          onClick={() => handlePageChange(index + 1)}
          className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? "bg-button text-white dark:bg-button-dark dark:text-white" : "bg-layer dark:bg-layer-dark text-primary dark:text-primary-dark"} hover:bg-button-hover dark:hover:bg-button-hover-dark`}
        >
          {index + 1}
        </button>
      ))}
      {currentPage < totalPages && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-button text-white rounded-lg hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark"
        >
          Next
        </button>
      )}
    </div>
  );

  if (loading) {
    return <p className="text-center text-primary dark:text-primary-dark">Loading comments...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-300">{error}</p>;
  }

  if (comments.length === 0) {
    return <p className="text-center text-primary dark:text-primary-dark">No comments available for this story.</p>;
  }

  return (
    <div className="comments-section max-w-3xl mx-auto p-6 bg-card rounded-lg shadow-lg dark:bg-card-dark">
      <h2 className="text-primary dark:text-accent-dark text-2xl font-semibold mb-4">Comments</h2>
      {renderPaginationControls()}
      <ul className="comments-list space-y-4">
        {currentComments.map((comment) => (
          <li key={comment.commentId} className="comment-item p-4 bg-layer dark:bg-layer-dark rounded-lg shadow-sm">
            <div className="comment-content">
              <strong className="text-primary dark:text-accent-dark">{comment.user?.username || "Anonymous"}:</strong>
              <p className="text-primary dark:text-primary-dark">{comment.content}</p>
              <small className="text-sm text-secondary dark:text-secondary-dark">
                Posted on: {new Date(comment.createdAt).toLocaleDateString()}
              </small>
            </div>
          </li>
        ))}
      </ul>
      {renderPaginationControls()}
    </div>
  );
};

export default StoryComments;
