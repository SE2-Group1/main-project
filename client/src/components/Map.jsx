import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useFeedbackContext } from '../contexts/FeedbackContext';
import API from '../services/API';
import { CtaButton } from './CtaButton';
import './style.css';

const styleUrl = import.meta.env.REACT_APP_MAPBOX_STYLE;

function Map() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const doneRef = useRef(false);
  const navigate = useNavigate();
  const { showToast } = useFeedbackContext();
  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [20.255045, 67.85528],
      zoom: 12.37,
      maxBounds: [
        [20.055045, 67.65528],
        [20.455045, 68.05528],
      ],
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        polygon: true,
        trash: true,
      },
      defaultMode: 'simple_select',
    });

    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
    );
    mapRef.current.addControl(draw);

    mapRef.current.on('draw.create', updateCoordinates);
    mapRef.current.on('draw.delete', updateCoordinates);
    mapRef.current.on('draw.update', updateCoordinates);
    mapRef.current.on('draw.modechange', handleModeChange);

    function updateCoordinates() {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const featureType = data.features[0].geometry.type;

        if (featureType === 'Polygon') {
          const coords = data.features[0].geometry.coordinates[0];
          setCoordinates(coords);
        } else if (featureType === 'Point') {
          const coords = data.features[0].geometry.coordinates;
          setCoordinates([coords]);
        }
        doneRef.current = true;
      } else {
        setCoordinates([]);
        doneRef.current = false;
      }
    }

    function handleModeChange(e) {
      if (
        doneRef.current &&
        (e.mode === 'draw_polygon' || e.mode === 'draw_point')
      ) {
        showToast('Please georeference with a single area or point', 'warn');
        draw.changeMode('simple_select');
      }
    }

    return () => {
      mapRef.current.remove();
    };
  }, [showToast]);

  const location = useLocation();

  const handleSaveCoordinates = async () => {
    if (coordinates.length === 0) {
      showToast('Click the map to georeference the document', 'warn');
      return;
    }
    if (coordinates.length > 0) {
      const docId = location.state.docId;
      try {
        await API.uploadDocumentGeoreference(docId, coordinates);
        showToast(
          'Georeference data saved! Redirecting to the home page in 5 seconds...',
          'success',
        );
        setTimeout(() => navigate('/home'), 5000);
      } catch {
        showToast('Failed to save georeference data', 'error');
      }
    }
    doneRef.current = false;
  };

  return (
    <div className="map-wrapper">
      <div className="map-container" ref={mapContainerRef}></div>
      <div className="calculation-box">
        <p>
          <strong>Click the map to georeference the document</strong>
        </p>
        <div className="cta-container">
          <CtaButton
            onClick={handleSaveCoordinates}
            style={{ alignSelf: 'center' }}
          >
            Save
          </CtaButton>
        </div>
      </div>
    </div>
  );
}

export default Map;
