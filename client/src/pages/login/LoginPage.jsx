import { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useUserContext } from '../../contexts/UserContext.js';
import API from '../../services/API.js';
import { LoginForm } from './components/LoginForm.jsx';
import './style.css';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const { setUser } = useUserContext();
  const { showToast } = useFeedbackContext();
  const location = useLocation(); // Access the passed location state

  const navigate = useNavigate();

  const handleLogin = async credentials => {
    try {
      const loggedUser = await API.login(credentials);
      showToast(`Logged in as ${loggedUser.username}`, 'success');
      setUser(loggedUser);
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        showToast('Wrong credentials!', 'error');
        setError(true);
      } else {
        showToast('Something went wrong! Try again.', 'error');
      }
      setUser(null);
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const credentials = { username, password };
    if (await handleLogin(credentials)) {
      // If the location state is available, navigate to that page
      const from = location.state?.from || '/home'; // Default to home if no state is provided
      navigate(from);
    }
  };

  return (
    <Container fluid={true} className="Container">
      <Container fluid className="bg-white login-card">
        <Row className="h-100 row-card">
          <Col
            className="bg-white d-flex flex-column justify-content-start align-items-center row-card px-5"
            md={6}
          >
            <Row className="w-100 mb-3">
              <span className="title-card align-content-center justify-content-center d-flex">
                Kiruna eXplorer
              </span>
            </Row>
            <Row className="w-100 mb-3">
              <LoginForm
                username={username}
                password={password}
                setUsername={setUsername}
                setPassword={setPassword}
                onSubmit={handleSubmit}
                error={error}
                setError={setError}
              />
            </Row>
          </Col>
          <Col
            className="bg-black d-flex justify-content-center align-items-center text-white image-column"
            md={6}
          ></Col>
        </Row>
      </Container>
    </Container>
  );
};

LoginPage.propTypes = {};
