import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LandingPage } from '../pages/LandingPage/LandingPage.jsx';
import ListView from '../pages/ListView/ListView.jsx';
import MapView from '../pages/MapView/MapView.jsx';
import { DiagramPage } from '../pages/diagram/diagramPage.jsx';
import { LoginPage } from '../pages/login/LoginPage.jsx';
import { LayoutWithNavbar } from './LayoutWithNavbar.jsx';

export const GuestRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<LandingPage />} />
        <Route
          path="/mapView/:docId?"
          element={
            <LayoutWithNavbar>
              <MapView mode="view" key="view" />
            </LayoutWithNavbar>
          }
        />
        <Route
          path="/listView"
          element={
            <LayoutWithNavbar>
              <ListView />
            </LayoutWithNavbar>
          }
        />
        <Route
          path="/diagramView"
          element={
            <LayoutWithNavbar>
              <DiagramPage />
            </LayoutWithNavbar>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};
