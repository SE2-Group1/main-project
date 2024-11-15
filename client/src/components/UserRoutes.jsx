import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Map from '../components/Map.jsx';
import MapView from '../pages/MapView/MapView.jsx';
import Navbar from '../pages/Navbar/Navbar.jsx';
import { AddDocumentPage } from '../pages/addDocument/AddDocumentPage.jsx';
import { HomePage } from '../pages/home/HomePage.jsx';

export const UserRoutes = () => {
  return (
    <BrowserRouter>
      {['/home', '/mapView'].includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Navigate to="/home" />} />
        <Route path="/submitDocument" element={<AddDocumentPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<Map />} />
        <Route path="/mapView" element={<MapView />} />
      </Routes>
    </BrowserRouter>
  );
};
