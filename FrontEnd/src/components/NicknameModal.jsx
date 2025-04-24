import { useState } from 'react';
import { useUser } from '../context/UserContext';

const NicknameModal = ({ isOpen, onClose }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nickname.trim().length < 3) {
      setError('يجب أن يكون الاسم المستعار 3 أحرف على الأقل');
      return;
    }
    
    // TODO: Check if nickname is unique in your data store
    login(nickname);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          اختر اسمك المستعار
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-lg border-2 border-rose-200 p-2 text-right"
              placeholder="ادخل اسمك المستعار"
              minLength={3}
              required
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-l from-rose-600 to-amber-600 text-white py-2 px-4 rounded-lg hover:from-rose-700 hover:to-amber-700"
          >
            بدء المشاركة
          </button>
        </form>
      </div>
    </div>
  );
};

export default NicknameModal;