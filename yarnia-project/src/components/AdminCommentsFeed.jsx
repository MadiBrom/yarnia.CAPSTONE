import { useEffect, useState } from "react";
import { fetchAllComments, deleteComment } from "../API";

export default function AdminCommentsFeed() {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 100;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const allComments = await fetchAllComments();
        setComments(allComments);
        setFilteredComments(allComments);
      } catch (err) {
        setError("Failed to fetch comments.");
      }
    };

    fetchComments();
  }, []);

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(null, commentId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );
      setFilteredComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );
    } catch (error) {
      console.error("Failed to delete the comment:", error);
      setError("Failed to delete the comment.");
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredComments(comments);
    } else {
      setFilteredComments(
        comments.filter(
          (comment) =>
            comment.user?.username?.toLowerCase().includes(query) ||
            comment.content?.toLowerCase().includes(query)
        )
      );
    }
    setCurrentPage(1);
  };

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
<div className="bg-surface dark:bg-surface-dark min-h-screen min-w-full">      <h2 className="text-primary dark:text-accent-dark text-2xl font-semibold mb-4">
        All Comments
      </h2>
      {error && (
        <p className="text-red-500 dark:text-red-300 text-center mb-4">{error}</p>
      )}
      <input
        type="text"
        placeholder="Search comments..."
        value={searchQuery}
        onChange={handleSearch}
        className="w-full p-2 mb-4 bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark rounded-lg border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-button-dark dark:focus:ring-button-hover-dark"
      />
      <br />
      <br />
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-button text-white rounded-lg hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber === currentPage ||
              (pageNumber >= currentPage - 2 &&
                pageNumber <= currentPage + 2) ||
              pageNumber === 1 ||
              pageNumber === totalPages
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === pageNumber
                      ? "bg-button text-white dark:bg-button-dark dark:text-white"
                      : "bg-layer dark:bg-layer-dark text-primary dark:text-primary-dark"
                  } hover:bg-button-hover dark:hover:bg-button-hover-dark`}
                >
                  {pageNumber}
                </button>
              );
            }

            return null;
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-button text-white rounded-lg hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      <ul className="space-y-4">
        {currentComments.length > 0 ? (
          currentComments.map((comment) => (
            <li key={comment.commentId} className="p-4 bg-layer dark:bg-layer-dark rounded-lg shadow-sm flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-4">
                  {comment.user?.username
                    ? comment.user.username.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div>
                  <span className="block text-primary dark:text-accent-dark font-semibold">
                    {comment.user?.username || "Unknown User"}
                  </span>
                  <p className="block text-primary dark:text-primary-dark">
                    {comment.content || "No content available"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteComment(comment.commentId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p className="text-center text-primary dark:text-primary-dark">No comments available.</p>
        )}
      </ul>
    </div>
  );
}
