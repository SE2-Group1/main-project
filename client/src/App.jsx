import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AddDocument from './components/AddDocumentPage.jsx';
import LoginForm from './components/LoginForm';
import { UserContext } from './context/userContext.js';
import './index.css';
import API, { getUserInfo } from './services/API.js';

function App() {
  const [message, setMessage] = useState('');
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
        setMessage(null);
      } else {
        setMessage({ msg: 'Wrong credentials!', type: 'danger' });
        return false;
      }
    } catch {
      setMessage({ msg: 'Wrong credentials!', type: 'danger' });
      return false;
    }
    return true;
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Container>
          <Routes>
            <Route
              path="/"
              element={user ? <AddDocument /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={
                <LoginForm login={handleLogin} externalError={message} />
              }
            />
            <Route path="/submitDocument" element={<AddDocument />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
