import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithAuth } from "../API"; 
import DOMPurify from "dompurify";

const StoryDetails = () => {
  const { storyId } = useParams(); 
  const [story, setStory] = useState(null); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:3000/api/stories/${storyId}`
        );
        if (response.ok) {
          const data = await response.json();
          setStory(data); 
        } else {
          setError("Failed to load story.");
        }
      } catch (error) {
        setError("An error occurred while fetching the story.");
      }
    };

    fetchStory();
  }, [storyId]);

  if (error) {
    return <p className="text-red-500 text-center py-4">{error}</p>;
  }

  if (!story) {
    return <p className="text-center text-secondary dark:text-secondary-dark py-4">Loading...</p>;
  }

  return (
    <div className="bg-surface dark:bg-surface-dark min-h-screen px-4 sm:px-6 lg:px-8 py-8 text-primary dark:text-primary-dark">
      <div className="max-w-4xl mx-auto bg-card dark:bg-card-dark p-6 rounded-lg shadow-md border border-border dark:border-border-dark">
        <h1 className="text-3xl font-bold mb-4 border-b-2 border-border dark:border-border-dark pb-2">
          {story.title}
        </h1>
        {story.summary && (
          <p className="mb-4 text-secondary dark:text-secondary-dark">
            <strong>Summary:</strong> {story.summary}
          </p>
        )}
        <div
          className="prose max-w-none text-primary dark:text-primary-dark"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(story.content) }}
        ></div>
      </div>
    </div>
  );
};

export default StoryDetails;
