import { ReactFlowProvider } from '@xyflow/react';

import mapboxgl from 'mapbox-gl';

import { AppRoutes } from './components/AppRoutes.jsx';
import './index.css';
import { FeedbackProvider } from './providers/FeedbackProvider.jsx';
import { UserProvider } from './providers/UserProvider.jsx';

const mapboxKey = import.meta.env.REACT_APP_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxKey;
function App() {
  return (
    <FeedbackProvider>
      <UserProvider>
        <ReactFlowProvider>
          <AppRoutes />
        </ReactFlowProvider>
      </UserProvider>
    </FeedbackProvider>
  );
}

export default App;
