// Import the CSS file
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { useFeedbackContext } from '../contexts/FeedbackContext.js';
import { useUserContext } from '../contexts/UserContext.js';
import API from '../services/API.js';
import './style.css';

// Import the user icon from react-icons

const Header = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const { user, setUser } = useUserContext();
  const { showToast } = useFeedbackContext();
  const handleLoginClick = () => {
    navigate('/login'); // Navigate to /login on click
  };
  const handleLogout = async () => {
    try {
      await API.logout();
      navigate('/home');
      showToast('Logged out', 'success');
      setUser(null);
    } catch {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <div className="header-container">
      <h1 className="header-title">Kiruna eXplorer</h1>
      <div className="header-login-container">
        {user ? (
          <>
            <FaUser className="header-profile-icon" />
            <span className="header-user-text">{user.username}</span>
            <span className="header-login-text" onClick={handleLogout}>
              Logout
            </span>
          </>
        ) : (
          <span className="header-login-text" onClick={handleLoginClick}>
            Login
          </span>
        )}
      </div>
    </div>
  );
};

export default Header;
