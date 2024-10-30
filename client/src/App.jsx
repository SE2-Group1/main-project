import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LoginForm from './components/LoginForm';
import './index.css';

//import API from './API';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      //const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage(null);
    } catch {
      setMessage({ msg: 'Credenziali errate!', type: 'danger' });
    }
  };

  return (
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
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
