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
import {
  calculatePolygonCenter,
  getKirunaCenter,
} from '../../utils/CenterCalculator.js';
import { getColorByType, getIconByType } from '../../utils/docTypeMapper.js';
import { AddDocumentSidePanel } from '../addDocument/AddDocumentSidePanel.jsx';
import './MapView.css';
import SidePanel from './SidePanel';
import layersIcon from '/icons/map_icons/layersIcon.svg';
import legendIcon from '/icons/map_icons/legendIcon.svg';
import resetView from '/icons/map_icons/resetView.svg';

function MapView() {
  // hooks
  const { showToast } = useFeedbackContext();
  const navigate = useNavigate();
  const location = useLocation();
  const mapMode = location.state?.mapMode || 'view';
  const [docId, setDocId] = useState(location.state?.docId || null);
  const isModifyingGeoreference = mapMode === 'georeference' && docId;
  // general states
  const [showCustomControlButtons, setShowCustomControlButtons] =
    useState(false);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v11',
  );
  //states for mapMode = view
  const [documents, setDocuments] = useState([]);
  const [docInfo, setDocInfo] = useState(null);
  //States for mapMode = georeference
  const [newDocument, setNewDocument] = useDocumentInfos(new Document());
  const [coordinates, setCoordinates] = useState([]);
  const [showAddDocumentSidePanel, setShowAddDocumentSidePanel] =
    useState(false);
  const [isMunicipalityArea, setIsMunicipalityArea] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  // refs
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const doneRef = useRef(false);
  const prevSelectedDocument = useRef();
  const draw = useRef(null);

  // Close the side panel when the map mode changes
  useEffect(() => {
    if (showAddDocumentSidePanel) {
      setShowAddDocumentSidePanel(false);
    }
    // eslint-disable-next-line
  }, [mapMode]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await API.getGeorefereces();
        setDocuments(docs);
      } catch (err) {
        console.warn(err);
        showToast('Failed to fetch documents', 'error');
      }
    };
    // Fetch the documents only when the map is in view mode
    if (mapMode === 'georeference') return;
    fetchDocuments();
  }, [showToast, mapMode]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await API.getTypes();
        setDocTypes(types);
      } catch (err) {
        console.warn(err);
        showToast('Failed to fetch documents');
      }
    };
    fetchTypes();
  }, [isLegendVisible, showToast]);

  // Load the map when the component mounts
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [20.255045, 67.85528],
      minZoom: 1,
      maxZoom: 20,
      zoom: 13,
      /*maxBounds: [
        [20.055045, 67.65528],
        [20.455045, 68.05528],
      ],*/
    });
    mapRef.current.on('load', () => {
      // Show the navigation control
      setShowCustomControlButtons(true);
      mapRef.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
      );
    });
    if (mapMode === 'view' && documents.length > 0) {
      // Draw the markers when the map is loaded
      mapRef.current.on('load', () => {
        const docs2 = documents.map(doc => {
          if (doc.coordinates.length === 1) {
            return {
              ...doc,
              center: [doc.coordinates[0].lat, doc.coordinates[0].lon],
            };
          } else {
            // const bounds = new mapboxgl.LngLatBounds();
            // const polygonCoords = doc.coordinates.map(pos => [
            //   pos.lon,
            //   pos.lat,
            // ]);
            // polygonCoords.forEach(coord => bounds.extend(coord));
            // const center = bounds.getCenter();
            // return { ...doc, center: [center.lat, center.lng] };
            const center = calculatePolygonCenter(doc.coordinates);
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

        for (const [, value] of Object.entries(groupedDocs)) {
          drawMarker(value);
        }
      });
    } else if (mapMode === 'georeference') {
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

      mapRef.current.on('load', () => {
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            point: true,
            polygon: true,
            trash: true,
          },
          defaultMode: 'simple_select',
        });
        mapRef.current.addControl(draw.current);
        mapRef.current.on('draw.create', updateCoordinates);
        mapRef.current.on('draw.delete', updateCoordinates);
        mapRef.current.on('draw.update', updateCoordinates);
        mapRef.current.on('draw.modechange', handleModeChange);
      });
    }

    return () => {
      mapRef.current.remove();
    };
  }, [documents, mapMode]);

  // Fetch the document data when the docId changes
  useEffect(() => {
    const fetchFullDocument = async docId => {
      try {
        const doc = await API.getDocument(docId);
        setDocInfo(doc);
        return doc;
      } catch (err) {
        console.warn(err);
        showToast('Failed to fetch document', 'error');
      }
    };
    if (docId) {
      fetchFullDocument(docId);
    }
  }, [docId, showToast]);

  const handleShowLinksModal = docId => {
    setShowLinksModal(true);
    setShowAddDocumentSidePanel(false);
    setDocId(docId);
  };

  //when in view mode u can only check the docs and move around
  //when in draw mode u can draw a polygon or a point and the docs should be hidden
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
        'fill-color': `${getColorByType(doc.type)}`,
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
        'line-color': `${getColorByType(doc.type)}`,
        'line-width': 2,
      },
    });
  };

  const removeArea = doc => {
    if (
      doc != null &&
      mapRef !== undefined &&
      mapRef.current.getLayer(`polygon-${doc.id_file}`) &&
      prevSelectedDocument.current.id_file !== docInfo.id_file
    ) {
      mapRef.current.removeLayer(`polygon-${doc.id_file}`);
      mapRef.current.removeLayer(`polygon-outline-${doc.id_file}`);
      mapRef.current.removeSource(`polygon-${doc.id_file}`);
      mapRef.current.removeSource(`polygon-outline-${doc.id_file}`);
    }
  };

  const drawArea = doc => {
    const polygonCoords = doc.coordinates.map(pos => [pos.lon, pos.lat]);

    console.log('Polygon coords: ' + polygonCoords);

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
    const color = docs.length === 1 ? getColorByType(docs[0].type) : 'gray';
    const listInsideMarker = document.createElement('ul');
    listInsideMarker.style.padding = '5px';
    listInsideMarker.style.margin = '0';
    listInsideMarker.style.display = 'flex';
    listInsideMarker.style.flexDirection = 'column';
    listInsideMarker.style.gap = '10px';
    listInsideMarker.style.listStyleType = 'disc'; // Use bullets
    listInsideMarker.style.listStylePosition = 'outside'; // Position markers outside
    listInsideMarker.style.paddingLeft = '20px'; // Add spacing for bullets

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
        listItem.style.whiteSpace = 'nowrap'; // Force single-line text
        listItem.style.overflow = 'hidden'; // Prevent overflow
        listItem.style.textOverflow = 'ellipsis'; // Add ellipsis
        listItem.style.maxWidth = '100px'; // Define width for ellipsis to work

        listItem.addEventListener('click', () => {
          if (doc.coordinates.length > 1) drawArea(doc);
          setDocId(doc.docId);
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
      markerElement.style.backgroundImage = `url(${getIconByType(docs[0].type)})`;

      markerElement.addEventListener('click', () => {
        setDocId(docs[0].docId);
        if (docs[0].coordinates.length > 1) drawArea(docs[0]);
      });

      new mapboxgl.Marker(markerElement)
        .setLngLat(docs[0].center)
        .addTo(mapRef.current);
    }
  };

  const handleSaveCoordinates = async () => {
    if (coordinates.length === 0 && !isMunicipalityArea) {
      toast.warn('Click the map to georeference the document');
      return;
    }
    if (isModifyingGeoreference) {
      let newGeoreference = null;
      if (isMunicipalityArea) {
        // The municipality area is the first area in the db with id 1
        newGeoreference = { georeference: null, id_area: 1 };
      } else {
        const coords = coordinates.map(cord => {
          return { lat: cord[1], lon: cord[0] };
        });
        newGeoreference = { georeference: coords, id_area: null };
      }
      try {
        await API.updateDocumentGeoreference(docInfo.id_file, newGeoreference);
        showToast('Georeference updated', 'success');
        navigate('/mapView', {
          state: {
            mapMode: 'view',
            docId: null,
          },
        });
      } catch {
        showToast('Failed to update georeference', 'error');
      }
      setCoordinates([]);
      setDocId(null);
      setDocInfo(null);
      setIsMunicipalityArea(false);
      doneRef.current = false;
      return;
    }
    if (coordinates.length > 0 || isMunicipalityArea) {
      setNewDocument(
        'georeference',
        coordinates.map(cord => {
          return { lat: cord[1], lon: cord[0] };
        }),
      );
      setShowAddDocumentSidePanel(true);
      setCoordinates([]);
    }

    doneRef.current = false;
  };

  const handleCancelAddDocument = () => {
    setDocId(null);
    setDocInfo(null);
    doneRef.current = false;
    setCoordinates([]);
    navigate('/mapView', {
      replace: true,
      state: { mapMode: 'view', docId: null },
    });
  };

  const handleCloseSidePanel = () => {
    if (mapRef.current.getLayer(`polygon-${docInfo.id_file}`)) {
      mapRef.current.removeLayer(`polygon-${docInfo.id_file}`);
      mapRef.current.removeLayer(`polygon-outline-${docInfo.id_file}`);
      mapRef.current.removeSource(`polygon-${docInfo.id_file}`);
      mapRef.current.removeSource(`polygon-outline-${docInfo.id_file}`);
    }
    setDocId(null);
    setDocInfo(null);
  };

  const handleCheckboxChange = async e => {
    if (e.target.checked) {
      setIsMunicipalityArea(true);
      //Display the whole municipality area
      mapRef.current.removeControl(draw.current);
      const coords = await API.getMunicipalityArea();

      const polygonCoords = coords.map(pos => [pos.lon, pos.lat]);

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

  const resetMapView = center => {
    let zoom = 15;

    // Check if the center is Kiruna
    const kirunaCenter = getKirunaCenter();
    if (
      center &&
      center.lat === kirunaCenter.lat &&
      center.lon === kirunaCenter.lon
    ) {
      zoom = 13;
    }
    mapRef.current.flyTo({
      center: [center.lat, center.lon],
      zoom: zoom,
      pitch: 0, // Resets the camera pitch angle (tilt) to 0
      bearing: 0, // Resets the camera rotation (bearing) to north (0)
      essential: true,
    });
  };

  useEffect(() => {
    const waitForStyle = async () => {
      if (!mapRef.current) return;

      while (!mapRef.current.isStyleLoaded()) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Check every 50ms
      }

      const area = location.state?.area;
      if (area) {
        resetMapView(area);
      }
    };

    waitForStyle();
  }, [location.state?.area]);

  useEffect(() => {
    if (!prevSelectedDocument.current) return;
    removeArea(prevSelectedDocument.current);
    prevSelectedDocument.current = docInfo;
  }, [docInfo]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyle); // Update the map style when state changes
    }
  }, [mapStyle]); // Re-run this effect whenever mapStyle changes

  const handleMapStyle = () => {
    setMapStyle(prev => {
      if (prev === 'mapbox://styles/mapbox/streets-v11') {
        return 'mapbox://styles/mapbox/satellite-v9';
      }
      return 'mapbox://styles/mapbox/streets-v11';
    });
  };

  const toggleLegend = () => {
    setIsLegendVisible(!isLegendVisible);
  };

  return (
    <Row id="map-wrapper flex">
      <div id="map-container" ref={mapContainerRef} key={mapMode}></div>
      {/* Show custom control buttons only when the map is loaded */}
      {showCustomControlButtons && (
        <>
          <div className="double-button-container">
            <button
              className="double-button"
              onClick={() => resetMapView(getKirunaCenter())}
            >
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
            {isLegendVisible && docTypes ? (
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
                      <img src={getIconByType(type.type_name)} />
                      {type.type_name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </>
      )}

      {docInfo && mapMode === 'view' ? (
        <SidePanel
          selectedDocument={docInfo}
          onClose={handleCloseSidePanel}
          path={'map'}
        />
      ) : null}
      {showLinksModal && docId ? (
        <LinkModal
          mode="add"
          show={showLinksModal}
          onHide={() => {
            setShowLinksModal(false);
            setDocId(null);
            setCoordinates([]);
            setShowAddDocumentSidePanel(false);
            setDocInfo(null);
            navigate('/mapView', {
              state: {
                mapMode: 'view',
                docId: null,
              },
            });
          }}
          docId={docId}
        />
      ) : null}

      {mapMode === 'georeference' && (
        <AddDocumentSidePanel
          setDocumentInfoToAdd={setNewDocument}
          documentInfoToAdd={newDocument}
          show={showAddDocumentSidePanel}
          openLinksModal={handleShowLinksModal}
        />
      )}

      {mapMode === 'georeference' && (
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
              disabled={coordinates.length > 0 || showAddDocumentSidePanel}
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
