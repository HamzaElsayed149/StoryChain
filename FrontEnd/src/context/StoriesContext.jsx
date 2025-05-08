import { createContext, useContext, useState, useEffect } from 'react';

const StoriesContext = createContext();
const API_URL = 'https://story-chain-jade.vercel.app/api';

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

  const editSentence = async (storyId, sentenceId, newText) => {
    try {
      const story = stories.find(s => s._id === storyId);
      if (!story) throw new Error('Story not found');
  
      const updatedSentences = story.sentences.map(sentence =>
        sentence._id === sentenceId ? { ...sentence, text: newText } : sentence
      );
  
      const response = await fetch(`${API_URL}/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...story, sentences: updatedSentences }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to edit sentence');
      }
  
      const updatedStory = await response.json();
      setStories(prev => prev.map(story => 
        story._id === storyId ? updatedStory : story
      ));
    } catch (err) {
      setError('Failed to edit sentence');
      throw err;
    }
  };

  const deleteSentence = async (storyId, sentenceId) => {
    try {
      const story = stories.find(s => s._id === storyId);
      if (!story) throw new Error('Story not found');

      const updatedSentences = story.sentences.filter(sentence => 
        sentence._id !== sentenceId
      );
  
      // Make sure we're sending all required story data
      const storyToUpdate = {
        ...story,
        sentences: updatedSentences
      };
  
      const response = await fetch(`${API_URL}/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyToUpdate),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete sentence');
      }
  
      const updatedStory = await response.json();
      setStories(prev => prev.map(story => 
        story._id === storyId ? updatedStory : story
      ));
    } catch (err) {
      console.error('Delete sentence error:', err);
      setError('Failed to delete sentence');
      throw err;
    }
  };

  const toggleLike = async (storyId, userId) => {
    try {
      const response = await fetch(`${API_URL}/stories/${storyId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle like');
      }

      const updatedStory = await response.json();
      setStories(prev => prev.map(story => 
        story._id === storyId ? updatedStory : story
      ));
    } catch (err) {
      throw err;
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
      editSentence,
      deleteSentence,
      toggleLike,
      clearError: () => setError(null)
    }}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
