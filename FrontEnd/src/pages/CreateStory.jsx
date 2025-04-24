import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStories } from '../context/StoriesContext';
import { useUser } from '../context/UserContext';

const CreateStory = () => {
  const navigate = useNavigate();
  const { addStory } = useStories();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstSentence: '',
    genre: [],
    title: '',
  });

  const genres = ['مغامرة', 'غموض', 'رومانسي', 'خيال علمي', 'رعب'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const storyId = await addStory({
        firstSentence: formData.firstSentence,
        title: formData.title,
        genre: formData.genre,
        author: user.nickname
      });
      
      if (!storyId) {
        throw new Error('Failed to get story ID');
      }
      
      navigate(`/story/${storyId}`);
    } catch (err) {
      setError('Failed to create story. Please try again.');
      console.error('Story creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (genre) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ابدأ قصة جديدة</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-900 mb-2">
            عنوان القصة
          </label>
          <input
            type="text"
            id="title"
            className="w-full rounded-xl border-2 border-rose-200 p-3 text-right"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="firstSentence" className="block text-lg font-medium text-gray-900 mb-2">
            الجملة الأولى
          </label>
          <textarea
            id="firstSentence"
            rows={3}
            className="w-full rounded-xl border-2 border-rose-200 p-3 text-right"
            value={formData.firstSentence}
            onChange={(e) => setFormData(prev => ({ ...prev, firstSentence: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-900 mb-3">
            التصنيفات
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreChange(genre)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  formData.genre.includes(genre)
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-l from-rose-600 to-amber-600 text-white py-3 px-6 rounded-xl text-lg font-medium hover:from-rose-700 hover:to-amber-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء القصة'}
        </button>
      </form>
    </div>
  );
};

export default CreateStory;