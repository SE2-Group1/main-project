import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LandingPage } from '../pages/LandingPage/LandingPage.jsx';
import MapView from '../pages/MapView/MapView.jsx';
import Navbar from '../pages/Navbar/Navbar.jsx';
import { AddDocumentPage } from '../pages/addDocument/AddDocumentPage.jsx';

export const UserRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/mapView" />} />
        <Route path="/submitDocument" element={<AddDocumentPage />} />
        <Route
          path="/mapView"
          element={
            <>
              <Navbar />
              <MapView />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
