import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { useEffect, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
//import { useUserContext } from '../../context/userContext';
import 'react-toastify/dist/ReactToastify.css';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

//import addDocument from '../../assets/icons/addDocumentIcon.svg';
import agreementIcon from '../../assets/icons/map_icons/agreementDocument.svg';
import conflictIcon from '../../assets/icons/map_icons/conflictDocument.svg';
import consultationIcon from '../../assets/icons/map_icons/consultationDocument.svg';
import designIcon from '../../assets/icons/map_icons/designDocument.svg';
import informativeIcon from '../../assets/icons/map_icons/informativeDocument.svg';
import materialEffectsIcon from '../../assets/icons/map_icons/materialEffectsDocument.svg';
import prescriptiveIcon from '../../assets/icons/map_icons/prescriptiveDocument.svg';
import resetView from '../../assets/icons/map_icons/resetView.svg';
import technicalIcon from '../../assets/icons/map_icons/technicalDocument.svg';
import API from '../../services/API';
import './MapView.css';
import SidePanel from './SidePanel';

function MapView() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const location = useLocation();
  const [isAddingDocument, setIsAddingDocument] = useState(
    location.state?.isAddingDocument || false,
  ); // New state
  const [selectedDocument, setSelectedDocument] = useState(null);
  //const { user } = useUserContext();
  const doneRef = useRef(false);
  const navigate = useNavigate();

  //when in view mode u can only check the docs and move around
  //when in draw mode u can draw a polygon or a point and the docs should be hidden
  //const [mode, setMode] = useState('view'); // view, draw

  useEffect(() => {
    if (location.state?.isAddingDocument) {
      setIsAddingDocument(true);
    }
  }, [location.state?.timestamp]);

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiY2lhbmNpIiwiYSI6ImNtMzFua2FkcTEwdG8ybHIzNTRqajNheTIifQ.jB3bWMwIOxgegTOVhoDz7g';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/cianci/cm31napf100b701qt9dc3en8y',
      center: [20.255045, 67.85528],
      minZoom: 12,
      maxZoom: 16,
      maxBounds: [
        [20.055045, 67.65528],
        [20.455045, 68.05528],
      ],
    });

    // TODO: Add call to get the documents to diplay on the map
    /*
    const documents = await API.getLightDocs();
    */
    const documents = [
      {
        id: 1,
        type: 'Design',
        title: 'Kiruna City Park Revitalization Plan',
        position: [20.2253, 67.8558], // Central Kiruna
      },
      {
        id: 2,
        type: 'Informative',
        title: 'Annual Tourist Information Guide',
        position: [20.2178, 67.857], // Slightly west of the city center
      },
      {
        id: 3,
        type: 'Prescriptive',
        title: 'Safety Regulations for Ice Hotel Operations',
        position: [20.2234, 67.8565], // Near central Kiruna
      },
      {
        id: 4,
        type: 'Technical',
        title: 'Mine Expansion Technical Specifications',
        position: [20.2205, 67.8592], // Close to LKAB Mine within Kiruna
      },
      {
        id: 5,
        type: 'Agreement',
        title: 'Lease Agreement for Kiruna Art Center',
        position: [20.228, 67.8555], // Near city center, east side
      },
      {
        id: 6,
        type: 'Conflict',
        title: 'Environmental Impact Dispute on Mining Expansion',
        position: [20.2221, 67.8548], // Central Kiruna Municipal Office
      },
      {
        id: 7,
        type: 'Consultation',
        title: 'Community Feedback on Kiruna Relocation Project',
        position: [20.2262, 67.8568], // Slightly northeast in central Kiruna
      },
      {
        id: 8,
        type: 'Material Effects',
        title: 'Study on Material Degradation in Arctic Conditions',
        position: [20.2247, 67.858], // Within Kiruna, close to research area
      },
    ];

    if (!isAddingDocument) {
      documents.forEach(doc => {
        const el = document.createElement('div');
        el.className = 'marker';
        switch (doc.type) {
          case 'Agreement':
            el.style.backgroundImage = `url(${agreementIcon})`;
            el.style.border = '5px solid black';
            el.style.setProperty('--marker-border-color', 'black');
            break;
          case 'Conflict':
            el.style.backgroundImage = `url(${conflictIcon})`;
            el.style.border = '5px solid red';
            el.style.setProperty('--marker-border-color', 'red');
            break;
          case 'Consultation':
            el.style.backgroundImage = `url(${consultationIcon})`;
            el.style.border = '5px solid purple';
            el.style.setProperty('--marker-border-color', 'purple');
            break;
          case 'Design':
            el.style.backgroundImage = `url(${designIcon})`;
            el.style.border = '5px solid blue';
            el.style.setProperty('--marker-border-color', 'blue');
            break;
          case 'Informative':
            el.style.backgroundImage = `url(${informativeIcon})`;
            el.style.border = '5px solid yellow';
            el.style.setProperty('--marker-border-color', 'yellow');
            break;
          case 'Material Effects':
            el.style.backgroundImage = `url(${materialEffectsIcon})`;
            el.style.border = '5px solid green';
            el.style.setProperty('--marker-border-color', 'green');
            break;
          case 'Prescriptive':
            el.style.backgroundImage = `url(${prescriptiveIcon})`;
            el.style.border = '5px solid cyan';
            el.style.setProperty('--marker-border-color', 'cyan');
            break;
          case 'Technical':
            el.style.backgroundImage = `url(${technicalIcon})`;
            el.style.border = '5px solid pink';
            el.style.setProperty('--marker-border-color', 'pink');
            break;
          default:
            el.style.backgroundImage = `url(${informativeIcon})`;
            el.style.border = '5px solid pink';
            el.style.setProperty('--marker-border-color', 'pink');
        }
        el.style.backgroundColor = '#f0f0f0';
        el.style.width = `50px`;
        el.style.height = `50px`;
        el.style.backgroundSize = '100%';
        el.style.display = 'block';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.padding = 0;
        el.style.cursor = 'pointer';

        el.addEventListener('click', () => {
          console.log('Clicked on document:', doc);

          //TODO call api to get all the infos about this selected doc and then set it to the selectedDocument
          setSelectedDocument(doc);
        });

        new mapboxgl.Marker(el).setLngLat(doc.position).addTo(mapRef.current);

        //new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(mapRef.current);
      });
    }

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: isAddingDocument, // Only show controls when not in add mode
        polygon: isAddingDocument,
        trash: isAddingDocument,
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
  }, [isAddingDocument]);

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

  const handleCancelAddDocument = () => {
    setIsAddingDocument(false);
    navigate('/mapView', { replace: true, state: { isAddingDocument: false } });
  };

  const handleCloseSidePanel = () => {
    setSelectedDocument(null);
  };

  const handleCheckboxChange = e => {
    console.log('Checkbox changed:', e.target.checked);
  };

  const resetMapView = () => {
    mapRef.current.flyTo({
      center: [20.255045, 67.85528],
      zoom: 13,
      pitch: 0, // Resets the camera pitch angle (tilt) to 0
      bearing: 0, // Resets the camera rotation (bearing) to north (0)
      essential: true,
    });
  };

  return (
    <Row id="map-wrapper flex">
      <div id="map-container" ref={mapContainerRef}></div>
      <ToastContainer position="top-center" />

      {selectedDocument && (
        <SidePanel
          selectedDocument={selectedDocument}
          onClose={handleCloseSidePanel}
        />
      )}

      {/* TODO add the modal when add Document mode is on to complete the document infos */}

      <div>
        <button className="reset-view" onClick={resetMapView}>
          <img
            src={resetView}
            alt="Reset Map"
            style={{ width: '56px', height: '56px' }}
          />
        </button>
      </div>

      {isAddingDocument && (
        <div className="calculation-box2 text-center">
          <p>
            <strong>Click the map to georeference the document</strong>
          </p>
          <div className="form-check mt-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="confirm-georeference"
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="confirm-georeference">
              Use Municipality Area
            </label>
          </div>
          <button
            className="btn btn-custom mt-2"
            onClick={handleSaveCoordinates}
          >
            Save
          </button>
          <button
            className="btn btn-custom mt-2"
            onClick={handleCancelAddDocument}
          >
            Cancel
          </button>
        </div>
      )}
    </Row>
  );
}

export default MapView;
