import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { StoriesProvider } from './context/StoriesContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateStory from './pages/CreateStory';
import StoryDetail from './pages/StoryDetail';
import NicknameModal from './components/NicknameModal';
import UserProfile from './pages/UserProfile';

const AppContent = () => {
  const { user } = useUser();
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowNicknameModal(true);
    }
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-yellow-50 to-teal-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateStory />} />
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:nickname" element={<UserProfile />} />
        </Routes>
        <NicknameModal 
          isOpen={showNicknameModal} 
          onClose={() => setShowNicknameModal(false)} 
        />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <UserProvider>
      <StoriesProvider>
        <AppContent />
      </StoriesProvider>
    </UserProvider>
  );
};

export default App;
