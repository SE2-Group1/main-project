import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AddDocument from './components/AddDocumentPage.jsx';
import LoginForm from './components/LoginForm';
import Map from './components/Map.jsx';
import { UserContext } from './context/userContext.js';
import './index.css';
import { HomePage } from './pages/Home/Home.jsx';
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
        setMessage(null);
        setUser(response);
      } else {
        setMessage({ msg: 'Wrong credentials!', type: 'danger' });
        setUser(null);
        return false;
      }
    } catch {
      setMessage({ msg: 'Wrong credentials!', type: 'danger' });
      setUser(null);
      return false;
    }
    return true;
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={
              !user ? (
                <LoginForm login={handleLogin} externalError={message} />
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
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
