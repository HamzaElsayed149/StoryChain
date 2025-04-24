import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useStories } from '../context/StoriesContext';

const UserProfile = () => {
  const { user } = useUser();
  const { stories } = useStories();

  const userStories = stories.filter(story => 
    story.sentences.some(sentence => sentence.author === user.nickname)
  );

  // التحقق من وجود تاريخ الانضمام قبل محاولة تنسيقه
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'غير متوفر';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">الملف الشخصي</h1>
        <div className="text-gray-600">
          عضو منذ {joinDate}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">مشاركاتك</h2>
        <div className="space-y-4">
          {userStories.map(story => (
            <div key={story._id} className="border-b pb-4">
              <p className="text-gray-900 mb-2">
                {story.sentences[0].text}
              </p>
              <div className="text-sm text-gray-500">
                {story.sentences.filter(s => s.author === user.nickname).length} جملة
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;