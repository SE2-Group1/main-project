import { useEffect, useState } from 'react';
import { Alert, Container } from 'react-bootstrap';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import AddDocument from './components/AddDocumentPage.jsx';
import LoginForm from './components/LoginForm';
import Map from './components/Map.jsx';
import { useMessageContext } from './context/messageContext';
import { UserContext } from './context/userContext.js';
import './index.css';
import { HomePage } from './pages/Home/Home.jsx';
import API, { getUserInfo } from './services/API.js';

function App() {
  const { message, clearMessage } = useMessageContext();
  const [loginMessage, setLoginMessage] = useState('');
  const [user, setUser] = useState(null);
  useEffect(() => {
    getUserInfo()
      .then(user => setUser(user))
      .catch(() => setUser(null));
  }, []);
  const handleLogin = async credentials => {
    try {
      const response = await API.login(credentials);
      if (response) {
        setUser({ user });
        setLoginMessage(null);
      } else {
        setLoginMessage({ msg: 'Wrong credentials!', type: 'danger' });
        return false;
      }
    } catch {
      setLoginMessage({ msg: 'Wrong credentials!', type: 'danger' });
      return false;
    }
    return true;
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <Container className="lowered-alert-container">
                <div className="spacer"></div> {/* Spacer div */}
                {message && (
                  <Alert
                    variant={message.type}
                    onClose={clearMessage}
                    dismissible
                    className="custom-alert"
                  >
                    {message.msg}
                  </Alert>
                )}
                <Outlet />
              </Container>
            }
          >
            <Route
              path="/"
              element={user ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={
                !user ? (
                  <LoginForm login={handleLogin} externalError={loginMessage} />
                ) : (
                  <Navigate to="/home" />
                )
              }
            />
            <Route
              path="/submitDocument"
              element={user ? <AddDocument /> : <Navigate to="/login" />}
            />
            <Route
              path="/home"
              element={user ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/map"
              element={user ? <Map /> : <Navigate to="/login" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
