import { useState } from 'react';
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
  const [user, setUser] = useState('');

  const handleLogin = async credentials => {
    const user = await API.login(credentials);
    console.log('PUTTANA LA MADONNA:', user.username);
    setLoggedIn(true);
    setMessage('');
    setUser(user);
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
                  <Navigate replace to="/submitDocument" />
                ) : (
                  <LoginForm login={handleLogin} externalError={message} />
                )
              }
            />
            <Route
              path="/submitDocument"
              element={<AddDocument user={user} />}
            />
          </Routes>
        </Container>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
