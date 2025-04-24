import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStories } from '../context/StoriesContext';
import { useUser } from '../context/UserContext';

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stories, addSentence, toggleVote } = useStories();
  const { user } = useUser();
  const [newSentence, setNewSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const story = stories.find(s => s._id === id);

  useEffect(() => {
    if (!stories.length) {
      return; // Wait for stories to load
    }
    
    if (!story) {
      navigate('/', { replace: true }); // Use replace to prevent back navigation to invalid story
    }
  }, [stories, story, navigate]);

  // Single loading state check
  if (!story) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await addSentence(id, newSentence, user.nickname);
      setNewSentence('');
    } catch (err) {
      setError('Failed to add sentence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (sentenceId) => {
    try {
      setError(null);
      await toggleVote(id, sentenceId, user.nickname);
    } catch (err) {
      if (err.message === "User has already voted") {
        setError('You cannot vote for the same sentence twice');
      } else {
        setError('An error occurred while voting. Please try again.');
      }
    }
  };

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">جاري التحميل...</h2>
      </div>
    );
  }

  const getAuthorColor = (author) => {
    // More distinct color combinations
    const colorPairs = [
      { bg: 'bg-rose-50', text: 'text-rose-800' },
      { bg: 'bg-amber-50', text: 'text-amber-800' },
      { bg: 'bg-emerald-50', text: 'text-emerald-800' },
      { bg: 'bg-sky-50', text: 'text-sky-800' },
      { bg: 'bg-violet-50', text: 'text-violet-800' },
      { bg: 'bg-pink-50', text: 'text-pink-800' },
      { bg: 'bg-blue-50', text: 'text-blue-800' },
      { bg: 'bg-green-50', text: 'text-green-800' },
      { bg: 'bg-purple-50', text: 'text-purple-800' },
      { bg: 'bg-orange-50', text: 'text-orange-800' }
    ];
    
    // Better hash function for more unique distribution
    const hash = author.split('')
      .reduce((acc, char, i) => {
        return acc + char.charCodeAt(0) * (i + 1);
      }, 0);
    
    const index = Math.abs(hash) % colorPairs.length;
    return colorPairs[index];
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {story.title }
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      <div className="prose prose-lg mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow">
        <div className="space-y-1">
          {story.sentences.map((sentence, index) => {
            const colors = getAuthorColor(sentence.author);
            const hasVoted = Array.isArray(sentence.voters) && sentence.voters.includes(user.nickname);
            const voteCount = Array.isArray(sentence.voters) ? sentence.voters.length : 0;
            
            return (
              <span
                key={sentence._id}
                className={`inline ${colors.bg} ${colors.text} px-1 py-0.5 rounded cursor-pointer group relative`}
                title={`By ${sentence.author}`}
              >
                {sentence.text}{' '}
                <span 
                  className="text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(sentence._id);
                  }}
                >
                  <span>{sentence.author}</span>
                  <button 
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                      hasVoted ? 'bg-rose-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span>👍</span>
                    <span>{voteCount}</span>
                  </button>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {story.status === "open" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="newSentence" 
              className="block text-lg font-medium text-gray-900 mb-3"
            >
              أكمل القصة
            </label>
            <textarea
              id="newSentence"
              value={newSentence}
              onChange={(e) => setNewSentence(e.target.value)}
              className="w-full rounded-xl border-2 border-rose-200 p-3 text-right"
              rows={3}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-l from-rose-600 to-amber-600 text-white py-3 px-6 rounded-xl text-lg font-medium hover:from-rose-700 hover:to-amber-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'جاري الإضافة...' : 'إضافة جملة'}
          </button>
        </form>
      )}
    </div>
  );
};

export default StoryDetail;