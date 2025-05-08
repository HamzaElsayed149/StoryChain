import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useStories } from '../context/StoriesContext';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const { nickname } = useParams();
  const { user, updateUser } = useUser();
  const { stories } = useStories();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [error, setError] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (nickname) {
      // Fetch user data for the specified nickname
      fetch(`https://story-chain-jade.vercel.app/api/users/by-nickname/${nickname}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('User not found');
          }
          return res.json();
        })
        .then(data => {
          setProfileUser(data);
          setBio(data.bio || '');
        })
        .catch(err => {
          setError('المستخدم غير موجود');
          setProfileUser(null);
          console.error(err);
        });
    } else {
      // Show current user's profile
      setProfileUser(user);
      setBio(user?.bio || '');
    }
  }, [nickname, user]);

  // If profileUser is not loaded yet, show loading state
  if (!profileUser) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
      </div>
    );
  }

  // Calculate user stories based on profileUser
  const userStories = stories.filter(story => 
    story.sentences.some(sentence => sentence.author === profileUser.nickname)
  );

  const joinDate = profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'غير متوفر';

  // Check if the current user is viewing their own profile
  const isOwnProfile = user && profileUser && user.nickname === profileUser.nickname;

  const handleSaveBio = async () => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio: bio }), // Make sure bio is explicitly set
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update bio');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser); // Update the user context
      setBio(updatedUser.bio || ''); // Update local bio state
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
      setError('Failed to update bio. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{profileUser.nickname}</h1>
            <div className="text-gray-600">
              عضو منذ {joinDate}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">نبذة شخصية</h2>
            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                تعديل
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 p-2 text-right"
                rows={3}
                placeholder="اكتب نبذة عن نفسك..."
                maxLength={500} // Add a reasonable character limit
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveBio}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  حفظ
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setBio(user.bio || '');
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-1 rounded hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">
              {profileUser.bio || 'لم يتم إضافة نبذة شخصية بعد'}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">المشاركات</h2>
        <div className="space-y-4">
          {userStories.map(story => (
            <div key={story._id} className="border-b pb-4">
              <p className="text-gray-900 mb-2">
                {story.sentences[0].text}
              </p>
              <div className="text-sm text-gray-500">
                {story.sentences.filter(s => s.author === profileUser.nickname).length} جملة
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
