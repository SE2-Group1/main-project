import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropTypes from 'prop-types';

import { LinkModal } from '../../components/LinkModal';
import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useDocumentInfos } from '../../hooks/useDocumentInfos.js';
import Document from '../../models/Document.js';
import API from '../../services/API';
import {
  calculateBounds,
  calculatePolygonCenter,
  drawMarker,
  getColorByType,
  getKirunaCenter,
  streetMapStyle,
} from '../../utils/map.js';
import GeoreferencePopup from '../Georeference/GeoreferencePopup.jsx';
import { HandleDocumentSidePanel } from '../addDocument/HandleDocumentSidePanel.jsx';
import './MapView.css';
import MunicipalityDocumentsPanel from './MunicipalityDocumentsPanel';
import { CustomControlButtons } from './components/CustomControlButtons.jsx';
import { Legend } from './components/Legend.jsx';
import SidePanel from './components/SidePanel';
import { DocumentManagerProvider } from './providers/DocumentManagerProvider.jsx';

function MapView({ mode }) {
  // hooks and navigation
  const { showToast } = useFeedbackContext();
  const navigate = useNavigate();
  const { docId } = useParams();
  const [selectedDocId, setSelectedDocId] = useState(null);
  const isEditingGeoreference =
    mode === 'edit-georeference' && docId ? true : false;
  const isEditingDocInfo = mode === 'edit-info' && docId ? true : false;
  const isAddingDocument = mode === 'new' ? true : false;
  const isViewMode = mode === 'view' ? true : false;
  // general states
  const [showCustomControlButtons, setShowCustomControlButtons] =
    useState(false);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const [mapStyle, setMapStyle] = useState(streetMapStyle);
  //states for mapMode = view
  const [documents, setDocuments] = useState([]);
  const [municipalityDocuments, setMunicipalityDocuments] = useState([]);
  const [docInfo, setDocInfo] = useState(null);
  //states for mapMode = georeference
  const [newDocument, setNewDocument] = useDocumentInfos(new Document());
  const [coordinates, setCoordinates] = useState([]);
  const [showHandleDocumentSidePanel, setShowHandleDocumentSidePanel] =
    useState(false);
  const [isMunicipalityArea, setIsMunicipalityArea] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [prevSelectedDocId, setPrevSelectedDocId] = useState(null);
  // navigation to a docId
  const [zoomArea, setZoomArea] = useState(null);
  const [linkModalMode, setLinkModalMode] = useState();
  // refs
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const doneRef = useRef(false);
  const draw = useRef(null);

  //states for popup add document
  const [areaName, setAreaName] = useState('');

  const drawArea = useCallback(doc => {
    let polygon;

    if (Array.isArray(doc.coordinates[0])) {
      const multiPolygonCoords = doc.coordinates.map(polygon => {
        // For each polygon, map the coordinates and convert them into [lon, lat]
        return polygon.map(pos => [pos.lon, pos.lat]);
      });
      multiPolygonCoords.forEach((polygonCoords, index) => {
        const polygon = {
          type: 'Feature',
          geometry: {
            type: 'Polygon', // Use 'Polygon' for individual polygons
            coordinates: [polygonCoords], // Each layer gets its own coordinates
          },
        };
        let id;
        if (doc.docId === undefined) {
          id = doc.id_file;
        } else {
          id = doc.docId;
        }
        // Add a fill layer for the current polygon
        mapRef.current.addLayer({
          id: `multipolygon-${id}-${index}`,
          type: 'fill',
          source: {
            type: 'geojson',
            data: polygon,
          },
          paint: {
            'fill-color': getColorByType(doc.type),
            'fill-opacity': 0.25,
          },
        });

        // Add an outline layer for the current polygon
        mapRef.current.addLayer({
          id: `multipolygon-outline-${id}-${index}`,
          type: 'line',
          source: {
            type: 'geojson',
            data: polygon,
          },
          paint: {
            'line-color': getColorByType(doc.type),
            'line-width': 2,
          },
        });
      });
    } else {
      const polygonCoords = doc.coordinates.map(pos => [pos.lon, pos.lat]);
      // Add polygon to the map
      polygon = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoords],
        },
      };
      addArea(doc, polygon);
    }
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await API.getGeorefereces();
        setDocuments(docs.filter(doc => doc.id_area !== 1));
        setMunicipalityDocuments(docs.filter(doc => doc.id_area === 1));
      } catch (err) {
        console.warn(err);
        showToast('Failed to fetch documents', 'error');
      }
    };
    // Fetch the documents only when the map is in view mode
    if (!isViewMode) return;
    fetchDocuments();
  }, [showToast, isViewMode]);

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
      if (+markerDocId !== selectedDocId && +markerDocId !== docInfo?.id_file) {
        marker.style.transition = 'opacity 0.5s';
        marker.style.opacity = '0';
        setTimeout(() => {
          marker.style.display = 'none';
        }, 500);
      }
    });
  }, [selectedDocId, docInfo]);

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
    if (!mapRef.current || !zoomArea || !docId || !docInfo || !isViewMode)
      return;

    const zoomMap = () => {
      if (
        !mapRef.current.getLayer(`polygon-${docInfo.id_file}`) &&
        !mapRef.current.getLayer(`multipolygon-${docInfo.id_file}-0`)
      ) {
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
  }, [zoomArea, docInfo, drawArea, hideMarkers, docId, isViewMode]);

  // Load the map when the component mounts
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: streetMapStyle,
      center: [20.255045, 67.85528],
      minZoom: 1,
      maxZoom: 20,
      zoom: 13,
    });
    // Show the navigation control when the map is loaded
    mapRef.current.on('load', () => {
      setShowCustomControlButtons(true);
      mapRef.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
      );
    });
    if (isViewMode && documents.length > 0) {
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
          drawMarker(value, mapRef, setSelectedDocId, drawArea);
        }
      });
    } else if (isEditingGeoreference || isAddingDocument) {
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
  }, [
    documents,
    isEditingGeoreference,
    isAddingDocument,
    showToast,
    drawArea,
    isViewMode,
  ]);

  // Fetch the document data when the docId changes

  const fetchFullDocument = async docId => {
    try {
      const doc = await API.getDocument(docId);
      const coordinates = await API.getArea(doc.id_area);
      const center =
        coordinates.length > 1
          ? calculatePolygonCenter(coordinates)
          : { lat: coordinates[0].lat, lng: coordinates[0].lon };
      setZoomArea(
        coordinates.length > 1 ? calculateBounds(coordinates) : center,
      );
      const newDoc = { ...doc, coordinates: coordinates };
      setDocInfo(newDoc);
      return doc;
    } catch (err) {
      console.warn(err);
      showToast('Failed to fetch document', 'error');
    }
  };
  useEffect(() => {
    const id = selectedDocId || docId;
    if (id) {
      fetchFullDocument(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocId, showToast, docId]);

  const handleShowLinksModal = (docId, mode) => {
    setLinkModalMode(mode);
    setShowLinksModal(true);
    setShowHandleDocumentSidePanel(false);
    setSelectedDocId(docId);
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
    } else if (
      docId != null &&
      mapRef !== undefined &&
      mapRef.current.getLayer(`multipolygon-${docId}-0`)
    ) {
      const layers = mapRef.current.getStyle().layers;
      layers.forEach(layer => {
        if (layer.id.startsWith(`multipolygon-`)) {
          mapRef.current.removeLayer(layer.id);
          mapRef.current.removeSource(layer.id);
        }
      });
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
        navigate('/mapView');
      } catch {
        showToast('Failed to update georeference', 'error');
        return;
      }
      doneRef.current = false;
      return;
    } else {
      if (isMunicipalityArea) {
        // The municipality area is the first area in the db with id 1
        setNewDocument('id_area', 1);
        setIsMunicipalityArea(false);
      } else if (coordinates.length > 0) {
        setNewDocument(
          'georeference',
          coordinates.map(cord => {
            return { lat: cord[1], lon: cord[0] };
          }),
        );
        setNewDocument('name_area', areaName);
      }
      setShowHandleDocumentSidePanel(true);
    }
    doneRef.current = false;
  };

  const handleCloseSidePanel = () => {
    const id = selectedDocId || docId;
    // Remove the area from the map when the side panel is closed
    if (mapRef.current.getLayer(`polygon-${id}`)) {
      mapRef.current.removeLayer(`polygon-${id}`);
      mapRef.current.removeLayer(`polygon-outline-${id}`);
      mapRef.current.removeSource(`polygon-${id}`);
      mapRef.current.removeSource(`polygon-outline-${id}`);
    } else {
      const layers = mapRef.current.getStyle().layers;
      layers.forEach(layer => {
        if (layer.id.startsWith('multipolygon-')) {
          mapRef.current.removeLayer(layer.id);
          mapRef.current.removeSource(layer.id);
        }
      });
    }
    if (zoomArea) {
      navigate('/mapView');
      resetMarkers();
      // Reset markers when the side panel is closed
      resetMapView(getKirunaCenter());
    }
    setSelectedDocId(null);
    setDocInfo(null);
  };

  const handleCloseLinksModal = docId => {
    if (isAddingDocument) {
      navigate(`/mapView/${docId}`);
    } else if (isViewMode || isEditingDocInfo) {
      // Fetch the document again to update the links
      fetchFullDocument(selectedDocId);
      setShowLinksModal(false);
    }
  };

  const handleCheckboxChange = async e => {
    if (e.target.checked) {
      setIsMunicipalityArea(true);
      //Display the whole municipality area
      mapRef.current.removeControl(draw.current);
      const coords = await API.getMunicipalityArea();

      const multiPolygonCoords = coords.map(polygon => {
        // For each polygon, map the coordinates and convert them into [lon, lat]
        return polygon.map(pos => [pos.lon, pos.lat]);
      });

      multiPolygonCoords.forEach((polygonCoords, index) => {
        const polygon = {
          type: 'Feature',
          geometry: {
            type: 'Polygon', // Use 'Polygon' for individual polygons
            coordinates: [polygonCoords], // Each layer gets its own coordinates
          },
        };

        // Add a fill layer for the current polygon
        mapRef.current.addLayer({
          id: `polygon-municipality-${index}`,
          type: 'fill',
          source: {
            type: 'geojson',
            data: polygon,
          },
          paint: {
            'fill-color': `lightblue`,
            'fill-opacity': 0.5,
          },
        });

        // Add an outline layer for the current polygon
        mapRef.current.addLayer({
          id: `polygon-outline-municipality-${index}`,
          type: 'line',
          source: {
            type: 'geojson',
            data: polygon,
          },
          paint: {
            'line-color': `blue`,
            'line-width': 2,
          },
        });
      });
    } else {
      if (mapRef.current.getLayer(`polygon-municipality`)) {
        mapRef.current.removeLayer(`polygon-municipality`);
        mapRef.current.removeLayer(`polygon-outline-municipality`);
        mapRef.current.removeSource(`polygon-municipality`);
        mapRef.current.removeSource(`polygon-outline-municipality`);
      }
      mapRef.current.addControl(draw.current);
    }
  };

  // Reset map view to fit bounds
  const resetMapView = bounds => {
    // Check if bounds is point points
    if (typeof bounds === 'object' && !Array.isArray(bounds)) {
      let zoom = 15;
      let center = [];
      const kirunaCenter = getKirunaCenter();

      // Check if the point is center of Kiruna
      if (bounds.lat === kirunaCenter.lat && bounds.lon === kirunaCenter.lon) {
        zoom = 13;
        center = [kirunaCenter.lat, kirunaCenter.lon];
      } else {
        center = [bounds.lat, bounds.lng];
      }
      mapRef.current.flyTo({
        center: center,
        zoom: zoom,
        pitch: 0, // Resets the camera pitch angle (tilt) to 0
        bearing: 0, // Resets the camera rotation (bearing) to north (0)
        essential: true,
        duration: 1000, // Animation duration in milliseconds
      });
    } else {
      try {
        const options = {
          padding: 50, // Add padding around the bounds
          maxZoom: 18, // Set a maximum zoom level
          duration: 1000, // Animation duration in milliseconds
        };
        mapRef.current.fitBounds(bounds, options);
      } catch (error) {
        console.error('Error resetting map view:', error);
      }
    }
  };

  useEffect(() => {
    if (!prevSelectedDocId && docId) {
      setPrevSelectedDocId(docId);
      return;
    }
    if (!prevSelectedDocId && selectedDocId) {
      setPrevSelectedDocId(selectedDocId);
      return;
    }
    if (prevSelectedDocId !== selectedDocId) {
      removeArea(prevSelectedDocId);
    }
    if (selectedDocId) {
      setPrevSelectedDocId(selectedDocId);
    }
  }, [docInfo, removeArea, prevSelectedDocId, selectedDocId, docId]);

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
        <div id="map-container" ref={mapContainerRef}></div>
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

        {isViewMode ? (
          <MunicipalityDocumentsPanel
            documents={municipalityDocuments}
            setSelectedDocId={setSelectedDocId}
            mapRef={mapRef}
          />
        ) : null}

        {docInfo && isViewMode ? (
          <SidePanel
            docInfo={docInfo}
            onClose={handleCloseSidePanel}
            handleShowLinksModal={handleShowLinksModal}
            clearDocState={id => {
              setDocInfo(null);
              setSelectedDocId(id);
              resetMarkers();
            }}
          />
        ) : null}

        {showLinksModal && selectedDocId ? (
          <LinkModal
            mode={linkModalMode}
            show={showLinksModal}
            onHide={handleCloseLinksModal}
            docId={selectedDocId}
          />
        ) : null}

        {isAddingDocument && (
          <HandleDocumentSidePanel
            show={showHandleDocumentSidePanel}
            openLinksModal={handleShowLinksModal}
            mode="add"
            closeHandlePanel={() => navigate('/mapView')}
          />
        )}

        {isEditingDocInfo && (
          <HandleDocumentSidePanel
            show={isEditingDocInfo}
            openLinksModal={handleShowLinksModal}
            mode="modify"
            closeHandlePanel={id => navigate(`/mapView/${id}`)}
          />
        )}

        {isAddingDocument || isEditingGeoreference ? (
          <GeoreferencePopup
            handleCheckboxChange={handleCheckboxChange} // this is for municipality checkbox
            showAddDocumentSidePanel={showHandleDocumentSidePanel}
            handleSaveCoordinates={handleSaveCoordinates}
            handleCancelAddDocument={() => navigate('/mapView')}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            mapRef={mapRef}
            areaName={areaName}
            setAreaName={setAreaName}
          />
        ) : null}
      </Row>
    </DocumentManagerProvider>
  );
}

MapView.propTypes = {
  mode: PropTypes.string,
};

export default MapView;
