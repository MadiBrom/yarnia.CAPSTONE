import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const AddStory = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [genre, setGenre] = useState("");
  const [pictureUrl, setPictureUrl] = useState(""); // State for picture URL
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const genres = [
    "Fantasy",
    "Science Fiction",
    "Romance",
    "Thriller",
    "Horror",
    "Mystery",
    "Drama",
    "Comedy",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          summary,
          content,
          genre,
          pictureUrl, // Include picture URL in the request body
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add story");
      }

      const result = await response.json();

      console.log("Story added successfully:", result);
      navigate(`/stories/${result.storyId}`);
    } catch (error) {
      console.error("Failed to add the story:", error);
      setError("Failed to add the story.");
    }
  };

  return (
    <div className="add-story-container">
      <h1>Create a New Story</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="add-story-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a short summary (optional)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          >
            <option value="">Select a genre</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={{
              toolbar: [
                [{ header: "1" }, { header: "2" }, { font: [] }],
                [{ size: [] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [
                  { list: "ordered" },
                  { list: "bullet" },
                  { indent: "-1" },
                  { indent: "+1" },
                ],
                [{ align: "justify" }],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "font",
              "size",
              "bold",
              "italic",
              "underline",
              "strike",
              "blockquote",
              "list",
              "bullet",
              "indent",
              "align",
            ]}
            placeholder="Write your story here..."
            required
            style={{ height: "500px" }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pictureUrl">Picture URL</label>
          <input
            type="url"
            id="pictureUrl"
            value={pictureUrl}
            onChange={(e) => setPictureUrl(e.target.value)}
            placeholder="Enter an image URL"
          />
          {pictureUrl && (
            <div className="image-preview">
              <p>Image Preview:</p>
              <img
                src={pictureUrl}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />
            </div>
          )}
        </div>
        <button type="submit" className="submit-button">
          Submit Story
        </button>
      </form>
    </div>
  );
};

export default AddStory;
