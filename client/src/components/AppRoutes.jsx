import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AddDocument from '../components/AddDocumentPage.jsx';
import Map from '../components/Map.jsx';
import { useUserContext } from '../contexts/UserContext';
import { HomeScreen } from '../screens/home/HomeScreen.jsx';
import LoginForm from '../screens/login/LoginScreen.jsx';

const AppRoutes = () => {
  const { user } = useUserContext();
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <HomeScreen /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!user ? <LoginForm /> : <Navigate to="/home" />}
        />
        <Route
          path="/submitDocument"
          element={user ? <AddDocument /> : <Navigate to="/login" />}
        />
        <Route
          path="/home"
          element={user ? <HomeScreen /> : <Navigate to="/login" />}
        />
        <Route
          path="/map"
          element={user ? <Map /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
