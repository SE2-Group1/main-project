import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import API from '../services/API';

function Map() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const doneRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiY2lhbmNpIiwiYSI6ImNtMzFua2FkcTEwdG8ybHIzNTRqajNheTIifQ.jB3bWMwIOxgegTOVhoDz7g';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/cianci/cm31napf100b701qt9dc3en8y',
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
        polygon: false, // TODO: enable polygon drawing
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
        toast.warn('Please georeference with a single area or point');
        draw.changeMode('simple_select');
      }
    }

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const location = useLocation();

  const handleSaveCoordinates = async () => {
    if (coordinates.length === 0) {
      toast.warn('Click the map to georeference the document');
      return;
    }
    if (coordinates.length > 0) {
      const docId = location.state.docId;
      try {
        const res = await API.uploadDocumentGeoreference(docId, coordinates);
        console.log(res);
        toast.success(
          'Georeference data saved! Redirecting to the home page in 5 seconds...',
        );
        setTimeout(() => navigate('/home'), 5000);
      } catch (err) {
        console.warn(err);
        toast.error('Failed to save georeference data');
      }
    }
    doneRef.current = false;
  };

  return (
    <div id="map-wrapper">
      <div id="map-container" ref={mapContainerRef}></div>
      <ToastContainer />
      <div className="calculation-box">
        <p>
          <strong>Click the map to georeference the document</strong>
        </p>
        <button className="btn btn-custom mt-2" onClick={handleSaveCoordinates}>
          Save
        </button>
      </div>
    </div>
  );
}

export default Map;
