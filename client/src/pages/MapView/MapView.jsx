import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

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
  drawMarker,
  getColorByType,
  getKirunaCenter,
  streetMapStyle,
} from '../../utils/map.js';
import { HandleDocumentSidePanel } from '../addDocument/HandleDocumentSidePanel.jsx';
import './MapView.css';
import { CustomControlButtons } from './components/CustomControlButtons.jsx';
import { Legend } from './components/Legend.jsx';
import SidePanel from './components/SidePanel';
import { DocumentManagerProvider } from './providers/DocumentManagerProvider.jsx';

function MapView() {
  // hooks and navigation
  const { showToast } = useFeedbackContext();
  const navigate = useNavigate();
  const location = useLocation();
  const mapMode = location.state?.mapMode || 'view';
  const zoomArea = location.state?.area || null;
  const [docId, setDocId] = useState(location.state?.docId || null);
  const isEditingGeoreference = mapMode === 'georeference' && docId;
  // general states
  const [showCustomControlButtons, setShowCustomControlButtons] =
    useState(false);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const [mapStyle, setMapStyle] = useState(streetMapStyle);
  //states for mapMode = view
  const [documents, setDocuments] = useState([]);
  const [docInfo, setDocInfo] = useState(null);
  //states for mapMode = georeference
  const [newDocument, setNewDocument] = useDocumentInfos(new Document());
  const [coordinates, setCoordinates] = useState([]);
  const [showHandleDocumentSidePanel, setShowHandleDocumentSidePanel] =
    useState(false);
  const [isMunicipalityArea, setIsMunicipalityArea] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [prevSelectedDocId, setPrevSelectedDocId] = useState(null);
  // refs
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const doneRef = useRef(false);
  const draw = useRef(null);

  // Close the addDocument side panel when the map mode changes
  useEffect(() => {
    if (showHandleDocumentSidePanel) {
      setShowHandleDocumentSidePanel(false);
    }
    if (mapMode === 'isEditingDocInfo') {
      setShowHandleDocumentSidePanel(true);
    }
    // eslint-disable-next-line
  }, [mapMode]);

  // Set the docId when the location state changes
  useEffect(() => {
    if (location && location.state && !docId) {
      setDocId(location.state.docId);
    }
    if (mapMode === 'view' && docId === null) {
      setDocInfo(null);
    }
  }, [location, docId, mapMode]);

  const drawArea = useCallback(doc => {
    const polygonCoords = doc.coordinates.map(pos => [pos.lon, pos.lat]);

    // Add polygon to the map
    const polygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygonCoords],
      },
    };
    addArea(doc, polygon);
  }, []);

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

  const hideMarkers = useCallback(() => {
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => {
      const markerDocId = marker.getAttribute('data-doc-id');
      // hide all markers except the one that is selected
      if (+markerDocId !== docId && +markerDocId !== docInfo?.id_file) {
        marker.style.transition = 'opacity 0.5s';
        marker.style.opacity = '0';
        setTimeout(() => {
          marker.style.display = 'none';
        }, 500);
      }
    });
  }, [docId, docInfo]);

  const resetMarkers = useCallback(() => {
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => {
      marker.style.transition = 'opacity 0.5s';
      marker.style.opacity = '1';
      setTimeout(() => {
        marker.style.display = 'block';
      }, 500);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || !zoomArea || !docInfo) return;

    const zoomMap = () => {
      if (!mapRef.current.getLayer(`polygon-${docInfo.id_file}`)) {
        drawArea(docInfo);
      }
      if (zoomArea) {
        // Hide markers when zooming to a document
        hideMarkers();
        resetMapView(zoomArea);
      }
    };
    // Wait for the map to be loaded before zooming
    const waiting = () => {
      if (!mapRef.current.isStyleLoaded()) {
        setTimeout(waiting, 100);
      } else {
        zoomMap();
      }
    };
    waiting();
    return () => {
      mapRef.current.off('style.load', zoomMap);
    };
  }, [zoomArea, docInfo, drawArea, hideMarkers]);

  // Load the map when the component mounts
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: streetMapStyle,
      center: [20.255045, 67.85528],
      minZoom: 1,
      maxZoom: 20,
      zoom: 13,
      /*maxBounds: [
        [20.055045, 67.65528],
        [20.455045, 68.05528],
      ],*/
    });
    // Show the navigation control when the map is loaded
    mapRef.current.on('load', () => {
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
          drawMarker(value, mapRef, setDocId, drawArea);
        }
      });
    } else if (mapMode === 'georeference') {
      const updateCoordinates = () => {
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
      };

      const handleModeChange = e => {
        if (
          doneRef.current &&
          (e.mode === 'draw_polygon' || e.mode === 'draw_point')
        ) {
          showToast('Please georeference with a single area or point', 'warn');
          draw.current.changeMode('simple_select');
        }
      };

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
        const drawEvents = ['draw.create', 'draw.delete', 'draw.update'];
        drawEvents.forEach(event => {
          mapRef.current.on(event, updateCoordinates);
        });
        mapRef.current.on('draw.modechange', handleModeChange);
      });
    }

    return () => {
      mapRef.current.remove();
    };
  }, [documents, mapMode, showToast, drawArea]);

  // Fetch the document data when the docId changes
  useEffect(() => {
    const fetchFullDocument = async docId => {
      try {
        const doc = await API.getDocument(docId);
        const coordinates = await API.getArea(doc.id_area);
        const newDoc = { ...doc, coordinates: coordinates };
        setDocInfo(newDoc);
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
    setShowHandleDocumentSidePanel(false);
    setDocId(docId);
  };

  //when in view mode u can only check the docs and move around
  //when in draw mode u can draw a polygon or a point and the docs should be hidden
  const addArea = (doc, polygon) => {
    const id = doc.docId || doc.id_file;
    if (mapRef.current.getLayer(`polygon-${id}`) !== undefined) return;

    mapRef.current.addLayer({
      id: `polygon-${id}`,
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
      id: `polygon-outline-${id}`,
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

  const removeArea = useCallback(docId => {
    if (
      docId != null &&
      mapRef !== undefined &&
      mapRef.current.getLayer(`polygon-${docId}`)
    ) {
      mapRef.current.removeLayer(`polygon-${docId}`);
      mapRef.current.removeLayer(`polygon-outline-${docId}`);
      mapRef.current.removeSource(`polygon-${docId}`);
      mapRef.current.removeSource(`polygon-outline-${docId}`);
    }
  }, []);

  const handleSaveCoordinates = async () => {
    if (coordinates.length === 0 && !isMunicipalityArea) {
      showToast('Click the map to georeference the document', 'warn');
      return;
    }
    if (isEditingGeoreference) {
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
        await API.updateDocumentGeoreference(docId, newGeoreference);
        showToast('Georeference updated', 'success');
        navigate('/mapView', {
          state: {
            mapMode: 'view',
            docId: null,
          },
        });
      } catch {
        showToast('Failed to update georeference', 'error');
        return;
      }
      setCoordinates([]);
      setDocId(null);
      setDocInfo(null);
      setIsMunicipalityArea(false);
      doneRef.current = false;
      return;
    } else {
      if (isMunicipalityArea) {
        // The municipality area is the first area in the db with id 1
        setNewDocument('id_area', 1);
      } else if (coordinates.length > 0) {
        setNewDocument(
          'georeference',
          coordinates.map(cord => {
            return { lat: cord[1], lon: cord[0] };
          }),
        );
      }
      setShowHandleDocumentSidePanel(true);
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

  const closeHandlePanel = () => {
    navigate('/mapView', {
      replace: true,
      state: { mapMode: 'view', docId: null },
    });
  };

  const handleCloseSidePanel = () => {
    // Remove the area from the map when the side panel is closed
    if (mapRef.current.getLayer(`polygon-${docId}`)) {
      mapRef.current.removeLayer(`polygon-${docId}`);
      mapRef.current.removeLayer(`polygon-outline-${docId}`);
      mapRef.current.removeSource(`polygon-${docId}`);
      mapRef.current.removeSource(`polygon-outline-${docId}`);
    }
    if (zoomArea) {
      navigate('/mapView');
      // Reset markers when the side panel is closed
      resetMarkers();
      resetMapView(getKirunaCenter());
    }
    setDocId(null);
    setDocInfo(null);
  };

  const handleCloseLinksModal = () => {
    setShowLinksModal(false);
    setDocId(null);
    setCoordinates([]);
    setShowHandleDocumentSidePanel(false);
    setDocInfo(null);
    navigate('/mapView', {
      state: {
        mapMode: 'view',
        docId: null,
      },
    });
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
    // Remove the previous area when a new document is selected
    if (!prevSelectedDocId && docId) {
      setPrevSelectedDocId(docId);
      return;
    }
    if (prevSelectedDocId !== docId) {
      removeArea(prevSelectedDocId);
    }
    if (docId) {
      setPrevSelectedDocId(docId);
    }
  }, [docInfo, removeArea, prevSelectedDocId, docId]);

  useEffect(() => {
    // Update the map style when the state changes
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyle); // Update the map style when state changes
    }
  }, [mapStyle]);

  const toggleLegend = () => {
    setIsLegendVisible(!isLegendVisible);
  };

  return (
    <DocumentManagerProvider
      documentData={newDocument}
      setDocumentData={setNewDocument}
      docInfo={docInfo}
      setDocInfo={setDocInfo}
    >
      <Row id="map-wrapper flex">
        <div id="map-container" ref={mapContainerRef} key={mapMode}></div>
        {/* Show custom control buttons only when the map is loaded */}
        {showCustomControlButtons && (
          <>
            <CustomControlButtons
              setMapStyle={setMapStyle}
              resetMapView={resetMapView}
            />
            <Legend
              isLegendVisible={isLegendVisible}
              docTypes={docTypes}
              toggleLegend={toggleLegend}
            />
          </>
        )}

        {docInfo && mapMode === 'view' ? (
          <SidePanel docInfo={docInfo} onClose={handleCloseSidePanel} />
        ) : null}
        {showLinksModal && docId ? (
          <LinkModal
            mode="add"
            show={showLinksModal}
            onHide={handleCloseLinksModal}
            docId={docId}
          />
        ) : null}

        {mapMode === 'georeference' && (
          <HandleDocumentSidePanel
            openLinksModal={handleShowLinksModal}
            mode="add"
            closeHandlePanel={closeHandlePanel}
            show={showHandleDocumentSidePanel}
          />
        )}
        {mapMode === 'isEditingDocInfo' && (
          <HandleDocumentSidePanel
            openLinksModal={handleShowLinksModal}
            mode="modify"
            closeHandlePanel={closeHandlePanel}
            show={showHandleDocumentSidePanel}
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
                disabled={coordinates.length > 0 || showHandleDocumentSidePanel}
              />
              <label
                className="form-check-label"
                htmlFor="confirm-georeference"
              >
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
    </DocumentManagerProvider>
  );
}

export default MapView;
