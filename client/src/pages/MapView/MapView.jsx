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

import API from '../../services/API';
import './MapView.css';
import SidePanel from './SidePanel';
//import addDocument from '../../assets/icons/addDocumentIcon.svg';
import agreementIcon from '/icons/map_icons/agreementDocument.svg';
import conflictIcon from '/icons/map_icons/conflictDocument.svg';
import consultationIcon from '/icons/map_icons/consultationDocument.svg';
import designIcon from '/icons/map_icons/designDocument.svg';
import informativeIcon from '/icons/map_icons/informativeDocument.svg';
import materialEffectsIcon from '/icons/map_icons/materialEffectsDocument.svg';
import prescriptiveIcon from '/icons/map_icons/prescriptiveDocument.svg';
import resetView from '/icons/map_icons/resetView.svg';
import technicalIcon from '/icons/map_icons/technicalDocument.svg';

function MapView() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const location = useLocation();
  const [isAddingDocument, setIsAddingDocument] = useState(
    location.state?.isAddingDocument || false,
  );
  const [documents, setDocuments] = useState([]); // State to store fetched documents
  // New state
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  //const { user } = useUserContext();
  const doneRef = useRef(false);
  const navigate = useNavigate();

  //when in view mode u can only check the docs and move around
  //when in draw mode u can draw a polygon or a point and the docs should be hidden
  //const [mode, setMode] = useState('view'); // view, draw

  useEffect(() => {
    if (location.state?.isAddingDocument) {
      setIsAddingDocument(true);
    } else {
      setIsAddingDocument(false);
    }
  }, [location.state?.timestamp]);

  const fetchDocuments = async () => {
    try {
      const docs = await API.getGeorefereces();

      docs.push({
        docId: '123',
        title: 'Test Document',
        type: 'Material Effects',
        coordinates: [{ lat: 20.256245, lon: 67.85288 }], //20.255045, 67.85528
      });

      setDocuments(docs);
      setIsLoaded(true);
    } catch (err) {
      console.warn(err);
      toast.error('Failed to fetch documents');
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchFullDocument = async docId => {
    try {
      const doc = await API.getDocument(docId);
      setSelectedDocument(doc);
      return doc;
    } catch (err) {
      console.warn(err);
      toast.error('Failed to fetch document');
    }
  };

  const typeColors = {
    Agreement: 'black',
    Conflict: 'red',
    Consultation: 'purple',
    Design: 'blue',
    Informative: 'yellow',
    'Material Effects': 'green',
    Prescriptive: 'cyan',
    Technical: 'pink',
  };

  const typeIcons = {
    Agreement: agreementIcon,
    Conflict: conflictIcon,
    Consultation: consultationIcon,
    Design: designIcon,
    Informative: informativeIcon,
    'Material Effects': materialEffectsIcon,
    Prescriptive: prescriptiveIcon,
    Technical: technicalIcon,
  };

  const drawArea = doc => {
    const polygonCoords = doc.coordinates.map(pos => [pos.lat, pos.lon]);

    console.log(polygonCoords);

    // Add polygon to the map
    const polygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygonCoords],
      },
    };

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

  const drawMarker = docs => {
    const el = document.createElement('div');
    el.className = 'marker';
    const color = docs.length == 1 ? typeColors[docs[0].type] : 'gray';
    el.style.border = `5px solid ${color}`;
    el.style.setProperty('--marker-border-color', color);
    el.style.backgroundColor = '#f0f0f0';
    el.style.width = `50px`;
    el.style.height = `50px`;
    el.style.backgroundSize = '100%';
    el.style.borderRadius = '50%';
    el.style.cursor = 'pointer';
    el.style.top = '-25px';
    el.style.transform = 'translateY(-50%)';

    if (docs.length > 1) {
      el.textContent = '+' + docs.length;
      el.style.fontSize = '20px';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.textAlign = 'center';
      console.log(docs.map(doc => doc.docId).join(', '));

      const list = document.createElement('ul');
      list.style.padding = '0'; // Remove default padding
      list.style.margin = '0'; // Remove default margin
      docs.forEach(doc => {
        const listItem = document.createElement('li');
        listItem.textContent = doc.title;
        listItem.style.cursor = 'pointer';
        listItem.style.color = 'blue';

        listItem.addEventListener('click', () => {
          console.log('Selected document: ' + selectedDocument?.id_file);
          console.log(selectedDocument);

          if (selectedDocument !== null) {
            mapRef.current.removeLayer(`polygon-${selectedDocument.id_file}`);
            mapRef.current.removeLayer(
              `polygon-outline-${selectedDocument.id_file}`,
            );
            mapRef.current.removeSource(`polygon-${selectedDocument.id_file}`);
            mapRef.current.removeSource(
              `polygon-outline-${selectedDocument.id_file}`,
            );
          }

          if (doc.coordinates.length > 1) {
            console.log('Drawing area');
            drawArea(doc);
          }

          fetchFullDocument(doc.docId);
        });

        list.appendChild(listItem);
      });

      const popupContainer = document.createElement('div');
      popupContainer.style.display = 'flex';
      popupContainer.style.flexDirection = 'column';
      popupContainer.style.alignItems = 'center'; // Center content horizontally
      popupContainer.style.justifyContent = 'center'; // Center content vertically
      popupContainer.style.textAlign = 'center'; // Center the text

      // Add "Documents here" title and the list to the popup container
      const title = document.createElement('p');
      title.textContent = 'Documents here:';
      title.style.marginBottom = '10px'; // Add some spacing between the title and list
      popupContainer.appendChild(title);
      popupContainer.appendChild(list);

      // Create the popup with centered content
      const popup = new mapboxgl.Popup({
        offset: 25,
      }).setDOMContent(popupContainer);

      new mapboxgl.Marker(el)
        .setLngLat(docs[0].center)
        .setPopup(popup)
        .addTo(mapRef.current);
    } else {
      console.log('Docs ', docs);

      el.style.backgroundImage = `url(${typeIcons[docs[0].type]})`;

      el.addEventListener('click', () => {
        //TODO call api to get all the infos about this selected doc and then set it to the selectedDocument

        //fetchFullDocument(docs[0].docId);
        drawArea(docs[0]);
      });

      new mapboxgl.Marker(el).setLngLat(docs[0].center).addTo(mapRef.current);
    }
  };

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

    fetchDocuments();

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
            return { ...doc, center };
          }
        });

        console.log(docs2);

        docs2[0].coordinates = [
          { lat: 20.249508920592746, lon: 67.8562991176257 },
          { lat: 20.24470240203766, lon: 67.8542284827472 },
          { lat: 20.25671869842418, lon: 67.85257831392988 },
          { lat: 20.260924402160015, lon: 67.85526382317093 },
          { lat: 20.249508920592746, lon: 67.8562991176257 },
        ];

        docs2[2].coordinates = [
          { lat: 20.249508920592746, lon: 67.8562991176257 },
          { lat: 20.24470240203766, lon: 67.8542284827472 },
          { lat: 20.25671869842418, lon: 67.85257831392988 },
          { lat: 20.260924402160015, lon: 67.85526382317093 },
          { lat: 20.249508920592746, lon: 67.8562991176257 },
        ];

        const groupedDocs = docs2.reduce((acc, doc) => {
          const centerKey = `${doc.center[0]},${doc.center[1]}`;
          if (!acc[centerKey]) {
            acc[centerKey] = [];
          }
          acc[centerKey].push(doc);
          return acc;
        }, {});

        if (!isAddingDocument) {
          for (const [key, value] of Object.entries(groupedDocs)) {
            console.log(key, value);

            drawMarker(value);
          }
        }

        /*if (!isAddingDocument) {
          const markers = documents.map(doc => {
            const el = document.createElement('div');
            el.className = 'marker';
            const color = typeColors[doc.type] || 'pink';
            el.style.backgroundImage = `url(${typeIcons[doc.type]})`;
            el.style.border = `5px solid ${color}`;
            el.style.setProperty('--marker-border-color', color);
            el.style.backgroundColor = '#f0f0f0';
            el.style.width = `50px`;
            el.style.height = `50px`;
            el.style.backgroundSize = '100%';
            el.style.borderRadius = '50%';
            el.style.cursor = 'pointer';
            el.style.top = '-25px';
            el.style.transform = 'translateY(-50%)';

            el.addEventListener('click', () => {
              //TODO call api to get all the infos about this selected doc and then set it to the selectedDocument
              fetchFullDocument(doc.docId);
            });

            if (doc.coordinates.length > 1) {
              const polygonCoords = doc.coordinates.map(pos => [
                pos.lon,
                pos.lat,
              ]);

              // Add polygon to the map
              const polygon = {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [polygonCoords],
                },
              };

              mapRef.current.addLayer({
                id: `polygon-${doc.id}`,
                type: 'fill',
                source: {
                  type: 'geojson',
                  data: polygon,
                },
                paint: {
                  'fill-color': `${color}`,
                  'fill-opacity': 0.25,
                },
              });

              mapRef.current.addLayer({
                id: `polygon-outline-${doc.id}`,
                type: 'line',
                source: {
                  type: 'geojson',
                  data: polygon,
                },
                paint: {
                  'line-color': `${color}`,
                  'line-width': 2,
                },
              });

              const bounds = new mapboxgl.LngLatBounds();
              polygonCoords.forEach(coord => bounds.extend(coord));
              const center = bounds.getCenter();

              //new mapboxgl.Marker(el).setLngLat(center).addTo(mapRef.current);

              return {el, center, polygon};
            } else {
              const pst = [doc.coordinates[0].lat, doc.coordinates[0].lon];

              return {el, center: pst, polygon: null};
            }
          });

          console.log(markers);

        }*/
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
  }, [isAddingDocument, isLoaded]);

  const handleSaveCoordinates = async () => {
    if (coordinates.length === 0) {
      toast.warn('Click the map to georeference the document');
      return;
    }
    if (coordinates.length > 0) {
      const docId = location.state.docId;
      console.log(coordinates);
      try {
        await API.uploadDocumentGeoreference(docId, coordinates);
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
    console.log('Close side panel ' + selectedDocument);
    console.log(selectedDocument);
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

    console.log('Setting it at null');
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
