const API_URL = "http://localhost:3000"; // Base URL for your API

export async function fetchAllStories() {
  try {
    const response = await fetch(`${API_URL}/api/stories`); // Full URL for the API request
    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Assuming the data is an array of stories
  } catch (error) {
    console.error("Error fetching all stories:", error);
    throw error;
  }
}

export async function fetchSingleStory(storyId) {
  try {
    const response = await fetch(`${API_URL}/api/stories/${storyId}`); // Assuming this endpoint gets a single story
    if (!response.ok) {
      throw new Error(
        `Failed to fetch story with ID ${storyId}: ${response.statusText}`
      );
    }
    const data = await response.json();
    return data; // Make sure the data includes the story, comments, and author if necessary
  } catch (error) {
    console.error(`Error fetching story with ID ${storyId}:`, error);
    throw error;
  }
}

export async function fetchAllComments() {
  try {
    const response = await fetch(`${API_URL}/api/comments`); // Full URL for the API request

    // Check if the response is not successful (status is not in the range of 200-299)
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    return data; // Assuming the data is an array of comments
  } catch (error) {
    // Log error to the console and rethrow it for further handling
    console.error("Error fetching all comments:", error);
    throw error;
  }
}
