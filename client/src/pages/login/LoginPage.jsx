import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import { useFeedbackContext } from '../../contexts/FeedbackContext';
import { useUserContext } from '../../contexts/UserContext';
import API from '../../services/API';

export const LoginPage = () => {
  const [userType, setUserType] = useState('Urban Planner');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { setUser } = useUserContext();
  const { showToast } = useFeedbackContext();
  const navigate = useNavigate();

  const handleLogin = async credentials => {
    try {
      const loggedUser = await API.login(credentials);
      showToast(`Logged in as ${loggedUser.username}`, 'success');
      setUser(loggedUser);
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        showToast('Wrong credentials!', 'error');
      } else {
        showToast('Something went wrong! Try again.', 'error');
      }
      setUser(null);
      return false;
    }
    return true;
  };

  useEffect(() => {
    setErrors({});
  }, [username, password]);

  const handleUserTypeChange = type => {
    setUserType(type);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!username) {
      newErrors.username = 'Username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (validateForm()) {
      const credentials = { username, password };
      if (await handleLogin(credentials)) {
        navigate('/home');
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-3 p-4">
            <div className="d-flex justify-content-center">
              <div
                className={`flex-fill text-center user-tab ${userType === 'Urban Planner' ? 'active-tab' : ''}`}
                onClick={() => handleUserTypeChange('Urban Planner')}
              >
                Urban Planner
              </div>
              <div className="separator"></div>
              <div
                className={`flex-fill text-center user-tab ${userType === 'Other User' ? 'active-tab' : ''}`}
                onClick={() => handleUserTypeChange('Other User')}
              >
                Other
              </div>
            </div>

            {/* Form */}
            <div className="card-body mt-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className={`form-control custom-input ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className={`form-control custom-input ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                <div className="d-flex justify-content-center mt-4">
                  <button type="submit" className="btn btn-custom">
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};