// Import the CSS file
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Import the useNavigate hook
import './style.css';

// Import the user icon from react-icons

const Header = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to /login on click
  };

  return (
    <div className="header-container">
      <h1 className="header-title">Kiruna Explorer</h1>
      <div className="header-login-container" onClick={handleLoginClick}>
        <FaUser className="header-profile-icon" />
        <span className="header-login-text">Login</span>
      </div>
    </div>
  );
};

export default Header;
