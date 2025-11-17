import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  bookmarkStory,
  deleteStory,
  fetchComments,
  postComment,
  checkBookmarkStatus,
  deleteComment,
} from "../API";
import jwt_decode from "jwt-decode";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { motion, AnimatePresence } from "framer-motion";

export default function SingleStory({ user }) {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [story, setStory] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [page, setPage] = useState(0);

  const CHARACTERS_PER_PAGE = 1800;

  const fetchStoryAndComments = async (storyId) => {
    try {
      const storyResponse = await fetchSingleStory(storyId);
      if (storyResponse) {
        setStory(storyResponse);
        setContent(storyResponse.content);
        setTitle(storyResponse.title);
        setSummary(storyResponse.summary);

        const commentsResponse = await fetchComments(storyId);
        if (commentsResponse) setComments(commentsResponse);
      } else {
        setError("Story not found.");
      }
    } catch (error) {
      setError("Failed to fetch the story.");
    }
  };

  const fetchBookmarkStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUser) return;

      const { id } = jwt_decode(token);
      const response = await checkBookmarkStatus(id, storyId);
      if (response.bookmarked) setBookmarked(true);
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  useEffect(() => {
    if (storyId) fetchStoryAndComments(storyId);

    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode(token);
      setCurrentUser(decoded);
    }
  }, [storyId]);

  useEffect(() => {
    fetchBookmarkStatus();
  }, [currentUser]);

  const handleSaveContent = async () => {
    try {
      const response = await updateStoryContent(storyId, {
        title,
        summary,
        content,
      });
      if (response) {
        setIsEditing(false);
        fetchStoryAndComments(storyId);
      }
    } catch (error) {
      alert("Failed to update the story.");
    }
  };

  const handleDeleteStory = async () => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      try {
        await deleteStory(storyId);
        alert("Story deleted successfully!");
        navigate("/");
      } catch (error) {
        alert("Failed to delete the story.");
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(storyId, commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (error) {
      setError("Failed to delete comment.");
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      setError("You must be logged in to bookmark stories.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await bookmarkStory(storyId, currentUser.id, token);
      setBookmarked(true);
    } catch {
      setError("Error occurred while bookmarking the story.");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment) return;
    try {
      await postComment(storyId, newComment);
      setNewComment("");
      fetchStoryAndComments(storyId);
    } catch {
      setError("Failed to post comment.");
    }
  };

  const handleNavigateToUser = (userId) => navigate(`/users/${userId}`);

  const splitContentIntoPages = (html, pageIndex) => {
    const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    const start = pageIndex * CHARACTERS_PER_PAGE;
    const end = start + CHARACTERS_PER_PAGE;
    return text.slice(start, end);
  };

  const pageCount = Math.ceil((content?.length || 0) / CHARACTERS_PER_PAGE);

  const changePage = (newPage) => {
    setPage(newPage);
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderComments = () => (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.commentId} className="bg-layer dark:bg-layer-dark p-4 rounded shadow-sm text-sm">
          <p>
            <strong>
              {comment.user?.username ? (
                <button onClick={() => handleNavigateToUser(comment.userId)} className="underline hover:text-accent dark:hover:text-accent-dark">
                  {comment.user.username}
                </button>
              ) : ("Unknown User")}
            </strong>
            : {comment.content || "No content available"}
          </p>
          {(currentUser?.id === comment.userId || currentUser?.isAdmin || currentUser?.id === story?.authorId) && (
            <button onClick={() => handleDeleteComment(comment.commentId)} className="ml-4 text-red-500 hover:underline">
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-surface dark:bg-surface-dark min-h-screen px-4 sm:px-6 lg:px-8 py-12 text-primary dark:text-primary-dark">
      <article className="max-w-3xl mx-auto bg-card dark:bg-card-dark p-6 sm:p-10 md:p-12 rounded-lg shadow-md border border-border dark:border-border-dark leading-relaxed">
        <div ref={contentRef} className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 border-b pb-4 border-border dark:border-border-dark">
          <div className="space-y-2">
            {isEditing ? (
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-border dark:border-border-dark rounded bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark" />
            ) : (
              <h1 className="text-3xl sm:text-4xl font-extrabold">{story?.title || "Untitled Story"}</h1>
            )}
            <div className="text-sm text-secondary dark:text-secondary-dark">
              By {story?.author?.username && story?.authorId ? (
                <button onClick={() => handleNavigateToUser(story.authorId)} className="underline hover:text-accent dark:hover:text-accent-dark">
                  {story.author.username}
                </button>
              ) : ("Anonymous")} · {new Date(story?.createdAt).toLocaleDateString()}<br />
              <span className="italic">Genre: {story?.genre}</span>
            </div>
          </div>
          <button onClick={handleBookmark} disabled={bookmarked} className="bg-button hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark text-white px-4 py-2 h-fit rounded">
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>        {error && <p className="text-red-500 mt-6">{error}</p>}
        </div>

        {isEditing ? (
          <>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full p-3 mb-6 border border-border dark:border-border-dark rounded bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark" placeholder="Summary..." />
            <ReactQuill value={content} onChange={setContent} className="mb-8" />
          </>
        ) : (
          <>
            <p className="mb-6 text-secondary dark:text-secondary-dark italic">{story?.summary}</p>
            <AnimatePresence mode="wait">
              <motion.div key={page} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.4 }} className="prose max-w-none text-primary dark:text-primary-dark mb-10 whitespace-pre-wrap">
                {splitContentIntoPages(content || "No content yet.", page)}
              </motion.div>
            </AnimatePresence>
            {pageCount > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
                <button onClick={() => changePage(Math.max(page - 1, 0))} disabled={page === 0} className="px-3 py-2 border border-border dark:border-border-dark rounded hover:bg-button-hover dark:hover:bg-button-hover-dark">
                  ← Prev
                </button>
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button key={i} onClick={() => changePage(i)} className={`px-4 py-2 rounded border border-border dark:border-border-dark transition-colors duration-200 ${i === page ? "bg-button text-white dark:bg-button-dark" : "bg-input hover:bg-button-hover dark:bg-input-dark dark:hover:bg-button-hover-dark"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => changePage(Math.min(page + 1, pageCount - 1))} disabled={page === pageCount - 1} className="px-3 py-2 border border-border dark:border-border-dark rounded hover:bg-button-hover dark:hover:bg-button-hover-dark">
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {(currentUser?.id === story?.authorId || currentUser?.isAdmin) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {isEditing ? (
              <button onClick={handleSaveContent} className="bg-button hover:bg-button-hover text-white px-4 py-2 rounded">
                Save Changes
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-button hover:bg-button-hover text-white px-4 py-2 rounded">
                Edit
              </button>
            )}
            <button onClick={handleDeleteStory} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              Delete
            </button>
          </div>
        )}

        <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="text-accent hover:underline mb-6">
          {isCommentsOpen ? "Hide Comments" : `Show Comments (${comments.length})`}
        </button>

        {isCommentsOpen && (
          <section className="space-y-6">
            {renderComments()}
            {currentUser && (
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} required placeholder="Write your comment..." className="w-full p-3 border border-border dark:border-border-dark rounded bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark" />
                <button type="submit" className="bg-button hover:bg-button-hover text-white px-4 py-2 rounded">
                  Submit Comment
                </button>
              </form>
            )}
          </section>
        )}
      </article>
    </div>
  );
}
