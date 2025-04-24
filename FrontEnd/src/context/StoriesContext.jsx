import { createContext, useContext, useState, useEffect } from 'react';

const StoriesContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stories`);
      const data = await response.json();
      // Ensure we always have an array, even if empty
      setStories(Array.isArray(data.stories) ? data.stories : []);
    } catch (err) {
      setError('Failed to fetch stories');
      console.error('Error fetching stories:', err);
      setStories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const addStory = async (storyData) => {
    try {
      const response = await fetch(`${API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });
      const newStory = await response.json();
      setStories(prev => [newStory, ...prev]);
      return newStory._id;  // Changed from newStory.id to newStory._id
    } catch (err) {
      setError('Failed to create story');
      throw err;
    }
  };

  const addSentence = async (storyId, text, author) => {
    try {
      if (!text || !author) {
        throw new Error('Text and author are required');
      }

      const response = await fetch(`${API_URL}/stories/${storyId}/sentences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, author }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add sentence');
      }

      const updatedStory = await response.json();
      setStories(prev => prev.map(story => 
        story._id === storyId ? updatedStory : story
      ));
    } catch (err) {
      setError('Failed to add sentence');
      throw err;
    }
  };

  const toggleVote = async (storyId, sentenceId, voterId) => {
    try {
      const response = await fetch(`${API_URL}/stories/${storyId}/sentences/${sentenceId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voterId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to vote');
      }

      const updatedStory = await response.json();
      setStories(prev => prev.map(story => 
        story._id === storyId ? updatedStory : story
      ));
    } catch (err) {
      throw err; // Propagate error to be handled by the component
    }
  };

  return (
    <StoriesContext.Provider value={{ 
      stories, 
      loading, 
      error, 
      addStory, 
      addSentence, 
      toggleVote,
      clearError: () => setError(null)
    }}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);