import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { HomePage } from '../pages/LandingPage/LandingPage.jsx';
import { LoginPage } from '../pages/login/LoginPage.jsx';

export const GuestRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/home" />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};
