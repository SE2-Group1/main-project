import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { useEffect, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Button } from '../../components/Button.jsx';
import { LinkModal } from '../../components/LinkModal';
import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useDocumentInfos } from '../../hooks/useDocumentInfos.js';
import Document from '../../models/Document.js';
import API from '../../services/API';
import { typeIcons } from '../../utils/IconsMapper.js';
import { AddDocumentSidePanel } from '../addDocument/AddDocumentSidePanel.jsx';
import './MapView.css';
import SidePanel from './SidePanel';
import layersIcon from '/icons/map_icons/layersIcon.svg';
import legendIcon from '/icons/map_icons/legendIcon.svg';
import resetView from '/icons/map_icons/resetView.svg';

function MapView() {
  const [documentInfoToAdd, setDocumentInfoToAdd] = useDocumentInfos(
    new Document(),
  );
  const { showToast } = useFeedbackContext();
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const location = useLocation();
  const [showAddDocumentSidePanel, setShowAddDocumentSidePanel] = useState(
    location.state?.showAddDocumentSidePanel || false,
  );
  const [isAddingDocument, setIsAddingDocument] = useState(
    location.state?.isAddingDocument || false,
  );
  const [isMunicipalityArea, setIsMunicipalityArea] = useState(false);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const [isTypes, setIsTypes] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [documents, setDocuments] = useState([]); // State to store fetched documents
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editDocId, setEditDocId] = useState(null);

  const doneRef = useRef(false);
  const navigate = useNavigate();
  const prevSelectedDocument = useRef();
  const draw = useRef(null);

  const typeColors = {
    Agreement: 'black',
    Conflict: 'red',
    Consultation: 'purple',
    Design: 'blue',
    Informative: 'yellow',
    'Material effects': 'green',
    Prescriptive: 'cyan',
    Technical: 'pink',
  };

  const handleShowLinksModal = docId => {
    setShowLinksModal(true);
    setShowAddDocumentSidePanel(false);
    setEditDocId(docId);
  };

  //when in view mode u can only check the docs and move around
  //when in draw mode u can draw a polygon or a point and the docs should be hidden
  //const [mode, setMode] = useState('view'); // view, draw
  const addArea = (doc, polygon) => {
    if (mapRef.current.getLayer(`polygon-${doc.docId}`) !== undefined) return;

    mapRef.current.addLayer({
      id: `polygon-${doc.docId}`,
      type: 'fill',
      source: {
        type: 'geojson',
        data: polygon,
      },
      paint: {
        'fill-color': `${typeColors[doc.type]}`,
        'fill-opacity': 0.25,
      },
    });

    mapRef.current.addLayer({
      id: `polygon-outline-${doc.docId}`,
      type: 'line',
      source: {
        type: 'geojson',
        data: polygon,
      },
      paint: {
        'line-color': `${typeColors[doc.type]}`,
        'line-width': 2,
      },
    });
  };

  const removeArea = doc => {
    if (
      doc != null &&
      mapRef !== undefined &&
      mapRef.current.getLayer(`polygon-${doc.id_file}`) &&
      prevSelectedDocument.current.id_file !== selectedDocument.id_file
    ) {
      mapRef.current.removeLayer(`polygon-${doc.id_file}`);
      mapRef.current.removeLayer(`polygon-outline-${doc.id_file}`);
      mapRef.current.removeSource(`polygon-${doc.id_file}`);
      mapRef.current.removeSource(`polygon-outline-${doc.id_file}`);
    }
  };

  const drawArea = doc => {
    const polygonCoords = doc.coordinates.map(pos => [pos.lat, pos.lon]);

    // Add polygon to the map
    const polygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygonCoords],
      },
    };
    addArea(doc, polygon);
  };

  const drawMarker = docs => {
    const markerElement = document.createElement('div');
    const color = docs.length === 1 ? typeColors[docs[0].type] : 'gray';
    const listInsideMarker = document.createElement('ul');

    listInsideMarker.style.padding = '0';
    listInsideMarker.style.margin = '0';
    listInsideMarker.style.display = 'flex';
    listInsideMarker.style.flexDirection = 'column';
    listInsideMarker.style.gap = '10px'; // Spaziatura uniforme tra gli elementi

    markerElement.className = 'marker';
    markerElement.style.border = `5px solid ${color}`;
    markerElement.style.setProperty('--marker-border-color', color);
    markerElement.style.backgroundColor = '#f0f0f0';
    markerElement.style.width = `50px`;
    markerElement.style.height = `50px`;
    markerElement.style.backgroundSize = '100%';
    markerElement.style.borderRadius = '50%';
    markerElement.style.cursor = 'pointer';
    markerElement.style.top = '-25px';
    markerElement.style.transform = 'translateY(-50%)';

    //show the the numbers of documents inside the marker
    if (docs.length > 1) {
      const popupContainer = document.createElement('div');

      popupContainer.style.display = 'flex';
      popupContainer.style.backgroundColor = 'white';
      popupContainer.style.flexDirection = 'column';
      popupContainer.style.justifyContent = 'center'; // Center content vertically
      popupContainer.style.textAlign = 'lef'; // Center the text
      popupContainer.style.padding = '10px';

      const title = document.createElement('p');

      title.textContent = 'Documents here:';
      title.style.marginBottom = '10px'; // Add some spacing between the title and list
      title.style.fontWeight = 'bold';
      title.style.fontSize = '15px';
      popupContainer.appendChild(title);
      popupContainer.appendChild(listInsideMarker);

      markerElement.textContent = '+' + docs.length;
      markerElement.style.fontSize = '20px';
      markerElement.style.justifyContent = 'center';
      markerElement.style.alignItems = 'center';
      markerElement.style.textAlign = 'center';
      markerElement.style.display = 'flex';
      markerElement.style.marginBottom = '10px';

      //create the list of the documents
      docs.forEach(doc => {
        const listItem = document.createElement('li');
        listItem.textContent = doc.title;
        listItem.className = 'hyperlink';
        listItem.style.textDecoration = 'underline';
        listItem.style.marginLeft = '14px';
        listItem.style.fontSize = '16px';

        listItem.addEventListener('click', () => {
          if (doc.coordinates.length > 1) drawArea(doc);

          fetchFullDocument(doc.docId);
        });

        listInsideMarker.appendChild(listItem);
      });

      // Create the popup with centered content
      const popup = new mapboxgl.Popup({
        offset: 25,
      }).setDOMContent(popupContainer);

      new mapboxgl.Marker(markerElement)
        .setLngLat(docs[0].center)
        .setPopup(popup)
        .addTo(mapRef.current);
    } else {
      markerElement.style.backgroundImage = `url(${typeIcons[docs[0].type]})`;

      markerElement.addEventListener('click', () => {
        fetchFullDocument(docs[0].docId);

        if (docs[0].coordinates.length > 1) drawArea(docs[0]);
      });

      new mapboxgl.Marker(markerElement)
        .setLngLat(docs[0].center)
        .addTo(mapRef.current);
    }
  };

  const fetchDocuments = async () => {
    try {
      const docs = await API.getGeorefereces();
      setDocuments(docs);
      setIsLoaded(true);
    } catch (err) {
      console.warn(err);
      showToast('Failed to fetch documents', 'error');
      setIsLoaded(true);
    }
  };

  const fetchFullDocument = async docId => {
    try {
      const doc = await API.getDocument(docId);
      setSelectedDocument(doc);
      return doc;
    } catch (err) {
      console.warn(err);
      showToast('Failed to fetch document', 'error');
    }
  };

  const handleSaveCoordinates = async () => {
    if (coordinates.length === 0 && !isMunicipalityArea) {
      toast.warn('Click the map to georeference the document');
      return;
    }
    if (coordinates.length > 0 || isMunicipalityArea) {
      setDocumentInfoToAdd(
        'georeference',
        coordinates.map(cord => {
          return { lat: cord[0], lon: cord[1] };
        }),
      );
      setShowAddDocumentSidePanel(true);
      setCoordinates([]);
    }

    doneRef.current = false;
  };

  const handleCancelAddDocument = () => {
    setIsAddingDocument(false);
    navigate('/mapView', {
      replace: true,
      state: { isAddingDocument: false, showAddDocumentSidePanel: false },
    });
  };

  const handleCloseSidePanel = () => {
    console.log(
      'Layer TEST ' +
        mapRef.current.getLayer(`polygon-${selectedDocument.id_file}`),
    );

    if (mapRef.current.getLayer(`polygon-${selectedDocument.id_file}`)) {
      mapRef.current.removeLayer(`polygon-${selectedDocument.id_file}`);
      mapRef.current.removeLayer(`polygon-outline-${selectedDocument.id_file}`);
      mapRef.current.removeSource(`polygon-${selectedDocument.id_file}`);
      mapRef.current.removeSource(
        `polygon-outline-${selectedDocument.id_file}`,
      );
    }

    console.log(
      'Layer ' + mapRef.current.getLayer(`polygon-${selectedDocument.id_file}`),
    );

    setSelectedDocument(null);
  };

  const handleCheckboxChange = async e => {
    console.log('Checkbox changed:', e.target.checked);

    if (e.target.checked) {
      setDocumentInfoToAdd('id_area', 1);
      setIsMunicipalityArea(true);
      //Display the whole municipality area
      mapRef.current.removeControl(draw.current);
      const coords = await API.getMunicipalityArea();

      const polygonCoords = coords.map(pos => [pos.lat, pos.lon]);

      const polygon = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoords],
        },
      };

      mapRef.current.addLayer({
        id: `polygon-municipality`,
        type: 'fill',
        source: {
          type: 'geojson',
          data: polygon,
        },
        paint: {
          'fill-color': `lightblue`,
          'fill-opacity': 0.25,
        },
      });

      mapRef.current.addLayer({
        id: `polygon-outline-municipality`,
        type: 'line',
        source: {
          type: 'geojson',
          data: polygon,
        },
        paint: {
          'line-color': `lightblue`,
          'line-width': 2,
        },
      });
    } else {
      if (mapRef.current.getLayer(`polygon-municipality`)) {
        mapRef.current.removeLayer(`polygon-municipality`);
        mapRef.current.removeLayer(`polygon-outline-municipality`);
        mapRef.current.removeSource(`polygon-municipality`);
        mapRef.current.removeSource(`polygon-outline-municipality`);
      }
      setIsMunicipalityArea(false);
      mapRef.current.addControl(draw.current);
    }
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

  useEffect(() => {
    removeArea(prevSelectedDocument.current);
    prevSelectedDocument.current = selectedDocument;
  }, [selectedDocument]);
  useEffect(() => {
    const { showAddDocumentSidePanel, isAddingDocument } = location.state || {};

    setShowAddDocumentSidePanel(!!showAddDocumentSidePanel);
    setIsAddingDocument(!!isAddingDocument);
  }, [location.state?.timestamp]);

  useEffect(() => {
    fetchDocuments();
  }, [location.state?.timestamp]);
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    mapboxgl.accessToken =
      'pk.eyJ1IjoiY2lhbmNpIiwiYSI6ImNtMzFua2FkcTEwdG8ybHIzNTRqajNheTIifQ.jB3bWMwIOxgegTOVhoDz7g';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [20.255045, 67.85528],
      minZoom: 10,
      maxZoom: 20,
      zoom: 13,
      maxBounds: [
        [20.055045, 67.65528],
        [20.455045, 68.05528],
      ],
    });
    if (documents) {
      mapRef.current.on('load', () => {
        const docs2 = documents.map(doc => {
          if (doc.coordinates.length === 1) {
            return {
              ...doc,
              center: [doc.coordinates[0].lat, doc.coordinates[0].lon],
            };
          } else {
            const bounds = new mapboxgl.LngLatBounds();
            const polygonCoords = doc.coordinates.map(pos => [
              pos.lon,
              pos.lat,
            ]);
            polygonCoords.forEach(coord => bounds.extend(coord));
            const center = bounds.getCenter();
            return { ...doc, center: [center.lat, center.lng] };
          }
        });

        const groupedDocs = docs2.reduce((acc, doc) => {
          const centerKey = `${doc.center[0]},${doc.center[1]}`;
          if (!acc[centerKey]) {
            acc[centerKey] = [];
          }
          acc[centerKey].push(doc);
          return acc;
        }, {});

        if (!isAddingDocument) {
          for (const [, value] of Object.entries(groupedDocs)) {
            drawMarker(value);
          }
        }
      });
    }

    draw.current = new MapboxDraw({
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
    mapRef.current.addControl(draw.current);

    mapRef.current.on('draw.create', updateCoordinates);
    mapRef.current.on('draw.delete', updateCoordinates);
    mapRef.current.on('draw.update', updateCoordinates);
    mapRef.current.on('draw.modechange', handleModeChange);

    function updateCoordinates() {
      const data = draw.current.getAll();
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
        draw.current.changeMode('simple_select');
      }
    }

    return () => {
      mapRef.current.remove();
    };
  }, [documents]);

  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v11',
  );

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyle); // Update the map style when state changes
    }
  }, [mapStyle]); // Re-run this effect whenever mapStyle changes

  const handleMapStyle = () => {
    const nextStyle =
      mapStyle === 'mapbox://styles/mapbox/streets-v11'
        ? 'mapbox://styles/mapbox/satellite-v9'
        : 'mapbox://styles/mapbox/streets-v11';

    setMapStyle(nextStyle);
  };

  const toggleLegend = () => {
    setIsLegendVisible(!isLegendVisible);
  };

  const fetchTypes = async () => {
    try {
      const types = await API.getTypes();
      setDocTypes(types);
      setIsTypes(true);
    } catch (err) {
      console.warn(err);
      showToast('Failed to fetch documents');
      setIsTypes(true);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, [isLegendVisible]);

  return (
    <Row id="map-wrapper flex">
      <div id="map-container" ref={mapContainerRef}></div>
      {selectedDocument && (
        <SidePanel
          selectedDocument={selectedDocument}
          onClose={handleCloseSidePanel}
        />
      )}
      {showLinksModal && editDocId ? (
        <LinkModal
          mode="add"
          show={showLinksModal}
          onHide={() => {
            setShowLinksModal(false);
            setEditDocId(null);
            setCoordinates([]);
            setShowAddDocumentSidePanel(false);
            navigate('/mapView', {
              state: {
                isAddingDocument: false,
                timestamp: Date.now(),
                showAddDocumentSidePanel: false,
              },
            });
          }}
          docId={editDocId}
        />
      ) : null}

      {
        <AddDocumentSidePanel
          setDocumentInfoToAdd={setDocumentInfoToAdd}
          documentInfoToAdd={documentInfoToAdd}
          show={showAddDocumentSidePanel}
          openLinksModal={handleShowLinksModal}
        />
      }

      <div className="double-button-container">
        <button className="double-button" onClick={resetMapView}>
          <img src={resetView} alt="Reset Map" />
        </button>
        <button className="double-button" onClick={handleMapStyle}>
          <img src={layersIcon} alt="Change Map Style" />
        </button>
      </div>

      <div>
        <button className="legend-button" onClick={toggleLegend}>
          <img src={legendIcon} alt="Legend of Docs" />
        </button>

        {/* The test commit is actually the legend + the map style commit */}
        {isLegendVisible && isTypes && (
          <div
            className={`legend-container ${isLegendVisible ? 'visible' : ''}`}
          >
            <h3 style={{ textAlign: 'center', marginTop: 15 }}>Legend</h3>
            <ul style={{ listStyle: 'none' }}>
              {docTypes.map(type => (
                <li
                  key={type.type_name}
                  style={{
                    marginTop: 18,
                    marginBottom: 10,
                    fontWeight: 'bold',
                  }}
                >
                  <img src={typeIcons[type.type_name]} />
                  {type.type_name}
                </li>
              ))}
            </ul>
          </div>
        )}
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
          <Button
            variant="primary"
            className="mb-2"
            onClick={handleSaveCoordinates}
            style={{
              position: 'relative',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            Save
          </Button>
          <Button
            variant="cancel"
            onClick={handleCancelAddDocument}
            style={{
              position: 'relative',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </Row>
  );
}

export default MapView;
