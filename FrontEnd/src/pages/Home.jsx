import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStories } from '../context/StoriesContext';
import { useUser } from '../context/UserContext';

const Home = () => {
  const { stories, toggleLike } = useStories();
  const { user } = useUser();
  const [sortBy, setSortBy] = useState('newest');
  const [filterGenre, setFilterGenre] = useState('all');

  const allGenres = ['all', ...new Set(stories.flatMap(story => story.genre || []))];

  const sortedAndFilteredStories = stories
    .filter(story => filterGenre === 'all' || (story.genre && story.genre.includes(filterGenre)))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'popular') return (b.sentences?.length || 0) - (a.sentences?.length || 0);
      return 0;
    });

  const handleLike = async (e, storyId) => {
    e.preventDefault();
    if (!user) return;
    try {
      await toggleLike(storyId, user.nickname);
    } catch (err) {
      console.error('خطأ في تسجيل الإعجاب:', err);
    }
  };

  if (stories.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4" dir="rtl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          لا توجد قصص بعد
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          كن أول من يبدأ قصة جديدة وشارك إبداعك مع الآخرين
        </p>
        <Link
          to="/create"
          className="bg-gradient-to-l from-rose-600 to-amber-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:from-rose-700 hover:to-amber-700 transition-all duration-200"
        >
          ابدأ قصة جديدة
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-4xl font-bold text-gray-900 my-2 text-center">
        سلسلة القصص
      </h1>
      <p className="text-lg text-gray-600 text-center mb-10 px-5">
        شارك في كتابة قصص مميزة مع كتّاب آخرين
      </p>

      <div className="flex justify-between items-center mb-8 px-4">
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white rounded-lg border-2 border-rose-200 px-4 py-2"
          >
            <option value="newest">الأحدث</option>
            <option value="popular">الأكثر مشاركة</option>
          </select>

          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="bg-white rounded-lg border-2 border-rose-200 px-4 py-2"
          >
            {allGenres.map(genre => (
              <option key={genre} value={genre}>
                {genre === 'all' ? 'كل التصنيفات' : genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedAndFilteredStories.map((story) => (
          <div key={story._id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <button
                  onClick={(e) => handleLike(e, story._id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                    story.likedBy?.includes(user?.nickname)
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{story.likedBy?.includes(user?.nickname) ? '❤️' : '🤍'}</span>
                  <span>{story.likes || 0}</span>
                </button>

                <span className={`px-3 py-1 rounded-full text-sm ${
                  story.status === 'open'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {story.status === 'open' ? 'مفتوح' : 'مغلق'}
                </span>
              </div>

              <Link to={`/story/${story._id}`}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-right hover:text-primary-600">
                  {story.sentences && story.sentences[0] ? story.sentences[0].text.substring(0, 50) + '...' : ''}
                </h2>
              </Link>

              <p className="text-gray-700 text-right leading-relaxed">
                {story.sentences[0].text}
              </p>

              <div className="flex flex-wrap gap-2 mb-4 justify-end">
                {(story.genre || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm border-t pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>{story.sentences ? story.sentences.length : 0}</span>
                    <span>جملة</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">
                    {new Date(story.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <span className="text-gray-500">
                  بواسطة {story.sentences && story.sentences[0] ? story.sentences[0].author : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;