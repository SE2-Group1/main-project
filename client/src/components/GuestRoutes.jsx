import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '../pages/login/LoginPage.jsx';

export const GuestRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};
