import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "./RichText";

const AddStory = ({ onStoryAdded }) => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [genre, setGenre] = useState("");
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
      const response = await fetch("${API_URL}/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, summary, content, genre }),
      });

      if (!response.ok) throw new Error("Failed to add story");
      const newStory = await response.json();

      if (onStoryAdded) onStoryAdded(newStory);
      navigate(`/stories/${newStory.storyId}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-card dark:bg-card-dark p-6 rounded-lg shadow border border-border dark:border-border-dark">
      <h2 className="text-xl font-bold mb-4 text-primary dark:text-primary-dark">
        Add a New Story
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-secondary dark:text-secondary-dark"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-border dark:border-border-dark bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="summary"
            className="block text-sm font-medium text-secondary dark:text-secondary-dark"
          >
            Summary
          </label>
          <textarea
            id="summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a short summary (optional)"
            className="mt-1 w-full rounded-md border border-border dark:border-border-dark bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="genre"
            className="block text-sm font-medium text-secondary dark:text-secondary-dark"
          >
            Genre
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-border dark:border-border-dark bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark px-3 py-2"
          >
            <option value="">Select a genre</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary dark:text-secondary-dark mb-2">
            Content
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            height="400px"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-button dark:bg-button-dark hover:bg-button-hover dark:hover:bg-button-hover-dark text-white px-5 py-2 rounded-md shadow"
          >
            📚 Submit Story
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStory;
