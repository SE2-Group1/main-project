import { useContext, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AddDocument from './components/AddDocumentPage.jsx';
import LoginForm from './components/LoginForm';
import UserContext from './context/userContext.js';
import './index.css';
import API from './services/API.js';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const { setUsernameContext } = useContext(UserContext);
  const handleLogin = async credentials => {
    try {
      const user = await API.login(credentials);
      setUsernameContext(user);
      await API.login(credentials);
      setLoggedIn(true);
      setMessage(null);
    } catch {
      setMessage({ msg: 'Wrong credentials!', type: 'danger' });
    }
  };

  return (
    <UserContext.Provider value={{ loggedIn }}>
      <BrowserRouter>
        <Container>
          <Routes>
            <Route path="/" element={<Button>Click me</Button>} />
            <Route
              path="/login"
              element={
                loggedIn ? (
                  <Navigate replace to="/" />
                ) : (
                  <LoginForm login={handleLogin} externalError={message} />
                )
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
