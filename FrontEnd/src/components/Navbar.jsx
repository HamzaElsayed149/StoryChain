import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { user } = useUser();

  return (
    <nav className="bg-white shadow-lg" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-gray-900 text-xl font-bold">
            جملة ورا التانية
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/create" className="text-gray-700 hover:text-primary-600">
              قصة جديدة
            </Link>
            {user && (
              <Link 
                to="/profile"
                className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                {user.nickname}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;