import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LandingPage } from '../pages/LandingPage/LandingPage.jsx';
import ListView from '../pages/ListView/ListView.jsx';
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
        <Route
          path="/mapView/new"
          element={
            <>
              <Navbar />
              <MapView mode="new" />
            </>
          }
        />
        <Route
          path="/mapView/:docId/edit"
          element={
            <>
              <Navbar />
              <MapView mode="edit" />
            </>
          }
        />
        <Route
          path="/mapView/:docId"
          element={
            <>
              <Navbar />
              <MapView />
            </>
          }
        />
        <Route
          path="/listView"
          element={
            <>
              <Navbar />
              <ListView />
            </>
          }
        />{' '}
      </Routes>
    </BrowserRouter>
  );
};
