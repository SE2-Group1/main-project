import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LandingPage } from '../pages/LandingPage/LandingPage.jsx';
import MapView from '../pages/MapView/MapView.jsx';
import Navbar from '../pages/Navbar/Navbar.jsx';
import { LoginPage } from '../pages/login/LoginPage.jsx';

export const GuestRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<LandingPage />} />
        <Route
          path="/mapView"
          element={
            <>
              <Navbar />
              <MapView />
            </>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};
