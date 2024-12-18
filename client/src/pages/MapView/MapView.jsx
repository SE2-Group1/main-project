import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropTypes from 'prop-types';

import { AttachmentModal } from '../../components/AttachmentModal.jsx';
import { Filter } from '../../components/Filter.jsx';
import { LinkModal } from '../../components/LinkModal';
import { ResourcesModal } from '../../components/ResourcesModal.jsx';
import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useUserContext } from '../../contexts/UserContext';
import { useDebounceValue } from '../../hooks/useDebounceValue';
import { useDocumentInfos } from '../../hooks/useDocumentInfos.js';
import Document from '../../models/Document.js';
import API from '../../services/API';
import {
  calculateBounds,
  calculatePolygonCenter,
  drawCluster, //drawMarker,
  getColorByType,
  getKirunaCenter,
  isPolygonClosed,
  satelliteMapStyle,
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
  const { user } = useUserContext();
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
  const [mapStyle, setMapStyle] = useState(satelliteMapStyle);
  // states for filter snd search
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceSearch = useDebounceValue(search, 400);
  const [searchCriteria, setSearchCriteria] = useState('Title');
  const [selectedFilters, setSelectedFilters] = useState({
    stakeholders: [],
    scales: [],
    types: [],
    languages: [],
    startDate: [],
    endDate: [],
  });
  const [filteredDocs, setFilteredDocs] = useState([]);
  //states for mapMode = view
  const [documents, setDocuments] = useState([]);
  const [municipalityDocuments, setMunicipalityDocuments] = useState([]);
  const [docInfo, setDocInfo] = useState(null);
  //states for mapMode = georeference
  const [areaName, setAreaName] = useState('');
  const [newDocument, setNewDocument] = useDocumentInfos(new Document());
  const [coordinates, setCoordinates] = useState({
    idArea: null,
    coordinates: [],
  });
  const [showHandleDocumentSidePanel, setShowHandleDocumentSidePanel] =
    useState(false);
  const [isMunicipalityArea, setIsMunicipalityArea] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [prevSelectedDocId, setPrevSelectedDocId] = useState(null);
  // navigation to a docId
  const [zoomArea, setZoomArea] = useState(null);
  const [linkModalMode, setLinkModalMode] = useState();
  const [resourceModalMode, setResourceModalMode] = useState();
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentModalMode, setAttachmentModalMode] = useState();
  // refs
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const doneRef = useRef(false);
  const draw = useRef(null);
  const filtersRef = useRef();

  const [readyToSave, setReadyToSave] = useState(false);
  const [geoMode, setGeoMode] = useState('');

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

  // Document filtering logic
  const fetchFilteredDocuments = useCallback(async () => {
    try {
      // Construct filters object
      const filters = {
        stakeholders: selectedFilters.stakeholders || [],
        scales: selectedFilters.scales || [],
        types: selectedFilters.types || [],
        languages: selectedFilters.languages || [],
        startDate: selectedFilters.startDate || [],
        endDate: selectedFilters.endDate || [],
      };
      // Call the API with current criteria, term, and filters
      const response = await API.getFilteredDocuments(
        searchCriteria,
        debounceSearch,
        filters,
      );
      setFilteredDocs(response);
    } catch (error) {
      console.error('Error fetching filtered documents:', error);
    }
  }, [debounceSearch, searchCriteria, selectedFilters]);

  // Trigger fetch whenever criteria, term, or filters change
  useEffect(() => {
    if (docId) return;
    fetchFilteredDocuments();
  }, [selectedFilters, fetchFilteredDocuments]);

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
    if (mapRef.current.getLayer('clusters')) {
      mapRef.current.removeLayer('clusters');
      mapRef.current.removeLayer('cluster-count');
      mapRef.current.removeSource('documents');
    }
    let doc;
    if (!docInfo) {
      doc = documents.find(doc => doc.docId === selectedDocId);
    } else {
      doc = docInfo;
    }
    const doc2 = [
      {
        ...doc,
        center:
          coordinates.length > 1
            ? calculatePolygonCenter(coordinates)
            : [doc.coordinates[0].lon, doc.coordinates[0].lat],
      },
    ];
    const groupedDocs = doc2.reduce((acc, doc) => {
      const centerKey = `${doc.center[0]},${doc.center[1]}`;
      if (!acc[centerKey]) {
        acc[centerKey] = [];
      }
      acc[centerKey].push(doc);
      return acc;
    }, {});
    drawCluster(
      groupedDocs,
      mapRef,
      setSelectedDocId,
      drawArea,
      user,
      updDocGeo,
    );
  }, [selectedDocId, docInfo]);

  const resetMarkers = useCallback(() => {
    if (mapRef.current.getLayer('clusters')) {
      mapRef.current.removeLayer('clusters');
      mapRef.current.removeLayer('cluster-count');
      mapRef.current.removeSource('documents');
    }
    const docs2 = documents.map(doc => {
      if (doc.coordinates.length === 1) {
        return {
          ...doc,
          center: [doc.coordinates[0].lon, doc.coordinates[0].lat],
        };
      } else {
        const center = calculatePolygonCenter(doc.coordinates);
        return { ...doc, center: [center.lng, center.lat] };
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
    drawCluster(
      groupedDocs,
      mapRef,
      setSelectedDocId,
      drawArea,
      user,
      updDocGeo,
    );
  }, [documents, drawArea, user]);

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
        filtersRef.current.clearAllFilters();
        resetMapView(zoomArea);
        hideMarkers();
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

  const updDocGeo = async (docId, georeference) => {
    try {
      await API.updateDocumentGeoreference(docId, georeference);
      showToast('Georeference updated', 'success');
      const docs = await API.getGeorefereces();
      setDocuments(docs.filter(doc => doc.id_area !== 1));
      setMunicipalityDocuments(docs.filter(doc => doc.id_area === 1));
    } catch {
      showToast('Failed to update georeference', 'error');
    }
  };

  // Load the map when the component mounts
  useEffect(() => {
    const style = mapStyle || satelliteMapStyle;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: style,
      center: [20.255045, 67.85528],
      minZoom: 6,
      maxZoom: 16,
      zoom: 13,
      maxBounds: [
        /*[15.255045, 62.85528], // Sud-Ovest
    [25.255045, 72.85528], // Nord-Est*/
        [10.255045, 65.85528], // Sud-Ovest
        [30.255045, 69.85528], // Nord-Est
      ],
    });
    // Show the navigation control when the map is loaded
    mapRef.current.on('load', () => {
      setShowCustomControlButtons(true);
      mapRef.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
      );
    });
    if (
      isViewMode &&
      documents.length > 0 &&
      !mapRef.current.getLayer('clusters')
    ) {
      // Draw the markers when the map is loaded
      mapRef.current.on('load', () => {
        const docs2 = documents.map(doc => {
          if (doc.coordinates.length === 1) {
            return {
              ...doc,
              center: [doc.coordinates[0].lon, doc.coordinates[0].lat],
            };
          } else {
            const center = calculatePolygonCenter(doc.coordinates);
            return { ...doc, center: [center.lng, center.lat] };
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
        if (!isSearching) {
          drawCluster(
            groupedDocs,
            mapRef,
            setSelectedDocId,
            drawArea,
            user,
            updDocGeo,
          );
        }
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
    mapStyle,
  ]);

  useEffect(() => {
    // Show draw controls when the map is in georeference mode
    if (isViewMode || !mapRef) return;
    const updateCoordinates = () => {
      const data = draw.current.getAll();
      if (data.features.length > 0) {
        const featureType = data.features[0].geometry.type;

        if (featureType === 'Polygon') {
          const coords = data.features[0].geometry.coordinates[0];
          setCoordinates({ idArea: null, coordinates: coords });
        } else if (featureType === 'Point') {
          const coords = data.features[0].geometry.coordinates;
          setCoordinates({ idArea: null, coordinates: [coords] });
        }
        doneRef.current = true;
      } else {
        setCoordinates({ idArea: null, coordinates: [] });
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

    if (geoMode === 'onMap') {
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
    } else if (
      geoMode === '' &&
      mapRef.current._controls.includes(draw.current)
    ) {
      mapRef.current.removeControl(draw.current);
    }
  }, [geoMode, isViewMode, showToast]);

  useEffect(() => {
    const filteredDocIds = new Set(
      filteredDocs
        .filter(doc => doc.id_area !== 1)
        .map(doc => String(doc.docId)),
    );
    if (documents.length === 0) return;
    const newFiltered = filteredDocs.filter(doc => doc.id_area !== 1);
    if (filteredDocIds.size === documents.length) {
      if (isSearching) {
        mapRef.current.removeLayer('clusters');
        mapRef.current.removeLayer('cluster-count');
        mapRef.current.removeSource('documents');
        //need to remove the markers created by drawCluster
        const markers = document.querySelectorAll('.mapboxgl-marker');
        markers.forEach(marker => {
          marker.remove();
        });
        const docs2 = documents.map(doc => {
          if (doc.coordinates.length === 1) {
            return {
              ...doc,
              center: [doc.coordinates[0].lon, doc.coordinates[0].lat],
            };
          } else {
            const center = calculatePolygonCenter(doc.coordinates);
            return { ...doc, center: [center.lng, center.lat] };
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
        drawCluster(
          groupedDocs,
          mapRef,
          setSelectedDocId,
          drawArea,
          user,
          updDocGeo,
        );
      }
      setIsSearching(false);
    } else {
      setIsSearching(true);
      const docs2 = newFiltered.map(doc => {
        if (doc.coordinates.length === 1) {
          return {
            ...doc,
            center: [doc.coordinates[0].lon, doc.coordinates[0].lat],
          };
        } else {
          const center = calculatePolygonCenter(doc.coordinates);
          return { ...doc, center: [center.lng, center.lat] };
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
      if (mapRef.current.getSource('documents')) {
        mapRef.current.removeLayer('clusters');
        mapRef.current.removeLayer('cluster-count');
        mapRef.current.removeSource('documents');
        //need to remove the markers created by drawCluster
        const markers = document.querySelectorAll('.mapboxgl-marker');
        markers.forEach(marker => {
          marker.remove();
        });
      }
      drawCluster(
        groupedDocs,
        mapRef,
        setSelectedDocId,
        drawArea,
        user,
        updDocGeo,
      );
    }
  }, [filteredDocs]);

  // Fetch the document data when the docId changes

  const fetchFullDocument = async docId => {
    try {
      const doc = await API.getDocument(docId);
      const coordinates = await API.getArea(doc.id_area);
      const center =
        coordinates.length > 1
          ? calculatePolygonCenter(coordinates)
          : { lng: coordinates[0].lon, lat: coordinates[0].lat };
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

  const handleShowResourcesModal = (docId, mode) => {
    setShowResourcesModal(true);
    setShowHandleDocumentSidePanel(false);
    setSelectedDocId(docId);
    setResourceModalMode(mode);
  };

  const handleShowAttachmentsModal = (docId, mode) => {
    setShowAttachmentModal(true);
    setShowHandleDocumentSidePanel(false);
    setSelectedDocId(docId);
    setAttachmentModalMode(mode);
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
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => {
      if (
        marker.classList.contains('highlight') &&
        parseInt(marker.getAttribute('data-doc-id')) === docId
      ) {
        marker.classList.remove('highlight');
      }
    });
  }, []);

  // Trigger proceedToSave after coordinates update
  useEffect(() => {
    if (readyToSave) {
      handleSaveCoordinates();
      setReadyToSave(false); // Reset the flag after saving
    }
  }, [readyToSave]);

  const handleManualSave = async () => {
    const coordinateValue = coordinates.coordinates;
    if (
      coordinateValue.length > 2 &&
      !isPolygonClosed(
        coordinateValue[0],
        coordinateValue[coordinateValue.length - 1],
      )
    ) {
      const updatedCoordinates = [...coordinateValue, coordinateValue[0]];
      setCoordinates({ idArea: null, coordinates: updatedCoordinates }); // Update coordinates to close the polygon
      setReadyToSave(true); // Trigger the saving process after update
    } else {
      handleSaveCoordinates(); // If no update needed, proceed directly
    }
  };

  const handleSaveCoordinates = async () => {
    let coordinatesValues = coordinates.coordinates;
    setNewDocument('id_area', coordinates.idArea);
    if (coordinatesValues.length === 0 && !isMunicipalityArea) {
      showToast('Georeference the document.', 'warn');
      return;
    }

    if (coordinatesValues.length === 2) {
      showToast('A polygon requires at least 3 points.', 'error');
      return;
    }

    if (isEditingGeoreference) {
      let newGeoreference = null;
      if (isMunicipalityArea) {
        // The municipality area is the first area in the db with id 1
        newGeoreference = {
          georeference: null,
          id_area: 1,
          name_area: 'Municipality',
        };
      } else {
        const coords = coordinatesValues.map(cord => {
          return { lon: cord[0], lat: cord[1] };
        });
        newGeoreference = {
          georeference: coords,
          id_area: coordinates.idArea,
          name_area: areaName,
        };
      }
      try {
        await API.updateDocumentGeoreference(docId, newGeoreference);
        showToast('Georeference updated', 'success');
        navigate('/mapView');
      } catch {
        showToast('Failed to update georeference', 'error');
        return;
      }
      setGeoMode('');
      doneRef.current = false;
      return;
    } else {
      if (isMunicipalityArea) {
        // The municipality area is the first area in the db with id 1
        setNewDocument('id_area', 1);
        setNewDocument('georeference', null);
        setIsMunicipalityArea(false);
      } else if (coordinatesValues.length > 0) {
        setNewDocument(
          'georeference',
          coordinatesValues.map(cord => {
            return { lon: cord[0], lat: cord[1] };
          }),
        );
      }
      setShowHandleDocumentSidePanel(true);
    }

    setNewDocument('name_area', areaName);
    setGeoMode('');
    doneRef.current = false;
  };

  const handleCloseSidePanel = () => {
    const id = selectedDocId || docId;
    setSearch('');
    if (docId || selectedDocId) {
      setSelectedFilters({
        stakeholders: [],
        scales: [],
        types: [],
        languages: [],
        startDate: [],
        endDate: [],
      });
      filtersRef.current.clearAllFilters();
    }
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
      // Reset markers when the side panel is closed
      resetMapView(getKirunaCenter());
      const data = mapRef.current.getSource('documents')._data.features;
      if (data.length !== documents.length) {
        resetMarkers();
      }
    }
    setSelectedDocId(null);
    setDocInfo(null);
  };

  const handleCloseLinksModal = () => {
    if (isViewMode || isEditingDocInfo) {
      // Fetch the document again to update the resources or attachments
      fetchFullDocument(selectedDocId);
    }
    setShowHandleDocumentSidePanel(true);
    setShowLinksModal(false);
  };

  const handleCloseResourcesModal = () => {
    if (isViewMode || isEditingDocInfo) {
      // Fetch the document again to update the links or attachments
      fetchFullDocument(selectedDocId);
    }
    setShowResourcesModal(false);
    setShowHandleDocumentSidePanel(true);
  };

  const handleCloseAttachmentModal = () => {
    if (isViewMode || isEditingDocInfo) {
      // Fetch the document again to update the links or resources
      fetchFullDocument(selectedDocId);
    }
    setShowAttachmentModal(false);
    setShowHandleDocumentSidePanel(true);
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
        center = [kirunaCenter.lon, kirunaCenter.lat];
      } else {
        center = [bounds.lng, bounds.lat];
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
      mapRef.current.setStyle(mapStyle);
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
            {isViewMode ? (
              <div className="map-searchbar-container">
                <Filter
                  ref={filtersRef}
                  search={search}
                  setSearch={setSearch}
                  searchBy={searchCriteria}
                  setSearchBy={setSearchCriteria}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                />
              </div>
            ) : null}

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
            mode="map"
            docInfo={docInfo}
            onClose={handleCloseSidePanel}
            handleShowLinksModal={handleShowLinksModal}
            handleShowResourcesModal={handleShowResourcesModal}
            handleShowAttachmentsModal={handleShowAttachmentsModal}
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

        {showResourcesModal && selectedDocId ? (
          <ResourcesModal
            //mode="add"
            mode={resourceModalMode}
            show={showResourcesModal}
            onHide={handleCloseResourcesModal}
            docId={selectedDocId}
          />
        ) : null}

        {showResourcesModal && docId ? (
          <ResourcesModal
            //mode="edit"
            mode={resourceModalMode}
            show={showResourcesModal}
            onHide={handleCloseResourcesModal}
            docId={docId}
          />
        ) : null}

        {showAttachmentModal && selectedDocId ? (
          <AttachmentModal
            mode={attachmentModalMode}
            show={showAttachmentModal}
            onHide={handleCloseAttachmentModal}
            docId={selectedDocId}
          />
        ) : null}

        {showAttachmentModal && docId ? (
          <AttachmentModal
            //mode="edit"
            mode={attachmentModalMode}
            show={showAttachmentModal}
            onHide={handleCloseAttachmentModal}
            docId={docId}
          />
        ) : null}

        {isAddingDocument && (
          <HandleDocumentSidePanel
            show={showHandleDocumentSidePanel}
            openLinksModal={handleShowLinksModal}
            mode="add"
            openResourcesModal={handleShowResourcesModal}
            openAttachmentsModal={handleShowAttachmentsModal}
            closeHandlePanel={() => navigate(`/mapView}`)}
          />
        )}

        {isEditingDocInfo && (
          <HandleDocumentSidePanel
            show={isEditingDocInfo}
            mode="modify"
            openLinksModal={handleShowLinksModal}
            openResourcesModal={handleShowResourcesModal}
            openAttachmentsModal={handleShowAttachmentsModal}
            closeHandlePanel={id => navigate(`/mapView/${id}`)}
          />
        )}

        {isAddingDocument || isEditingGeoreference ? (
          <GeoreferencePopup
            showAddDocumentSidePanel={showHandleDocumentSidePanel}
            handleSaveCoordinates={handleManualSave}
            handleCancelAddDocument={() => navigate('/mapView')}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            setGeoMode={setGeoMode}
            geoMode={geoMode}
            areaName={areaName}
            mapRef={mapRef}
            setAreaName={setAreaName}
            setIsMunicipalityArea={setIsMunicipalityArea}
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
