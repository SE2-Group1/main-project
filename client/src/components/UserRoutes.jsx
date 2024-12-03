import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PropTypes from 'prop-types';

import { LandingPage } from '../pages/LandingPage/LandingPage.jsx';
import ListView from '../pages/ListView/ListView.jsx';
import MapView from '../pages/MapView/MapView.jsx';
import Navbar from '../pages/Navbar/Navbar.jsx';

const LayoutWithNavbar = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export const UserRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/mapView" />} />
        <Route
          path="/mapView/new"
          element={
            <LayoutWithNavbar>
              <MapView mode="new" key="new" />
            </LayoutWithNavbar>
          }
        />
        <Route
          path="/mapView/:docId/edit-georeference"
          element={
            <LayoutWithNavbar>
              <MapView mode="edit-georeference" key="edit-georeference" />
            </LayoutWithNavbar>
          }
        />
        <Route
          path="/mapView/:docId/edit-info"
          element={
            <LayoutWithNavbar>
              <MapView mode="edit-info" key="edit-info" />
            </LayoutWithNavbar>
          }
        />
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
        />{' '}
      </Routes>
    </BrowserRouter>
  );
};

LayoutWithNavbar.propTypes = {
  children: PropTypes.node,
};
