import * as turf from '@turf/turf';

import mapboxgl from 'mapbox-gl';

import agreementIcon from '/icons/map_icons/agreementDocument.svg';
import conflictIcon from '/icons/map_icons/conflictDocument.svg';
import consultationIcon from '/icons/map_icons/consultationDocument.svg';
import designIcon from '/icons/map_icons/designDocument.svg';
import informativeIcon from '/icons/map_icons/informativeDocument.svg';
import materialEffectsIcon from '/icons/map_icons/materialEffectsDocument.svg';
import municipalityIcon from '/icons/map_icons/municipalityDocuments.svg';
import prescriptiveIcon from '/icons/map_icons/prescriptiveDocument.svg';
import technicalIcon from '/icons/map_icons/technicalDocument.svg';

const typeIcons = {
  Agreement: agreementIcon,
  Conflict: conflictIcon,
  Consultation: consultationIcon,
  Design: designIcon,
  Informative: informativeIcon,
  'Material effects': materialEffectsIcon,
  Prescriptive: prescriptiveIcon,
  Technical: technicalIcon,
  Municipality: municipalityIcon,
};

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

// Map styles

export const satelliteMapStyle = 'mapbox://styles/mapbox/satellite-v9';
export const streetMapStyle = 'mapbox://styles/mapbox/streets-v11';

export const getColorByType = type => typeColors[type];

export const getIconByType = type => typeIcons[type];

/**
 * Creates a marker element for a list of documents and adds it to the map.
 * @param {Array} docs - The array of document objects.
 * @param {Object} mapRef - A React ref to the Mapbox map instance.
 * @param {Function} setDocId - A function to update the selected document ID.
 * @param {Function} drawArea - A function to draw the area for a document.
 * @param {Function} getIconByType - A function to get an icon URL based on document type.
 * @param {Function} getColorByType - A function to get a color based on document type.
 */
export const drawMarker = (docs, mapRef, setDocId, drawArea) => {
  if (!docs || docs.length === 0 || !mapRef.current) return;

  const markerElement = createMarkerElement(docs, getColorByType);

  if (docs.length > 1) {
    const popup = createPopup(docs, drawArea, setDocId);
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

/**
 * Creates the marker element with the appropriate styles.
 */
const createMarkerElement = (docs, getColorByType) => {
  const markerElement = document.createElement('div');
  const color = docs.length === 1 ? getColorByType(docs[0].type) : 'gray';

  markerElement.className = 'marker';
  markerElement.style.cssText = `
    border: 5px solid ${color};
    --marker-border-color: ${color};
    background-color: #f0f0f0;
    width: 50px;
    height: 50px;
    background-size: 100%;
    border-radius: 50%;
    cursor: pointer;
    top: -25px;
    transform: translateY(-50%);
  `;

  if (docs.length === 1) {
    markerElement.setAttribute('data-doc-id', docs[0].docId);
  } else {
    const docIds = docs.map(doc => doc.docId).join(',');
    markerElement.setAttribute('data-doc-ids', docIds);

    markerElement.textContent = `+${docs.length}`;
    markerElement.style.cssText += `
      font-size: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      margin-bottom: 10px;
    `;
  }

  return markerElement;
};

/**
 * Creates a popup with a list of documents for the marker.
 */
const createPopup = (docs, drawArea, setDocId) => {
  const popupContainer = document.createElement('div');
  popupContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: white;
    text-align: left;
    padding: 10px;
  `;

  const title = document.createElement('p');
  title.textContent = 'Documents here:';
  title.style.cssText = `
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 15px;
  `;
  popupContainer.appendChild(title);

  const listInsideMarker = createDocumentList(docs, drawArea, setDocId);
  popupContainer.appendChild(listInsideMarker);

  return new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContainer);
};

/**
 * Creates a list of document titles with event listeners.
 */
const createDocumentList = (docs, drawArea, setDocId) => {
  const listInsideMarker = document.createElement('ul');
  listInsideMarker.style.cssText = `
    padding: 5px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style-type: disc;
    list-style-position: outside;
    padding-left: 20px;
  `;

  docs.forEach(doc => {
    const listItem = document.createElement('li');
    listItem.textContent = doc.title;
    listItem.className = 'hyperlink';
    listItem.style.cssText = `
      text-decoration: underline;
      margin-left: 14px;
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    `;

    listItem.addEventListener('click', () => {
      if (doc.coordinates.length > 1) drawArea(doc);
      setDocId(doc.docId);
    });

    listInsideMarker.appendChild(listItem);
  });

  return listInsideMarker;
};

export const calculatePolygonCenter = coordinates => {
  const bounds = new mapboxgl.LngLatBounds();

  const polygonCoords = coordinates.map(pos => [pos.lat, pos.lon]);
  polygonCoords.forEach(coord => bounds.extend(coord));
  const center = bounds.getCenter();

  return center;
};

// Calculate bounds of a polygon or point
export const calculateBounds = coordinates => {
  const bounds = new mapboxgl.LngLatBounds();

  // Extend bounds with properly formatted coordinates
  coordinates.forEach(pos => bounds.extend([pos.lon, pos.lat]));

  // Convert bounds to an array of arrays
  const boundsArray = [
    [bounds._sw.lng, bounds._sw.lat], // [lng, lat] for southwest
    [bounds._ne.lng, bounds._ne.lat], // [lng, lat] for northeast
  ];

  return boundsArray;
};

export const getKirunaCenter = () => {
  return { lat: 20.255045, lon: 67.85528 };
};

export const decimalToDMS = (decimal, isLat) => {
  const degrees = Math.floor(Math.abs(decimal));
  const minutes = Math.floor((Math.abs(decimal) - degrees) * 60);
  const seconds = ((Math.abs(decimal) - degrees) * 60 - minutes) * 60;

  const direction = isLat
    ? decimal >= 0
      ? 'N'
      : 'S'
    : decimal >= 0
      ? 'E'
      : 'W';

  return `${degrees}° ${minutes}′ ${seconds.toFixed(2)}″ ${direction}`;
};

// Function to check if starting point and ending point of a polygon is equal
export const isPolygonClosed = (point1, point2) => {
  return (
    Array.isArray(point1) &&
    Array.isArray(point2) &&
    point1.length === 2 &&
    point2.length === 2 &&
    point1[0] === point2[0] &&
    point1[1] === point2[1]
  );
};

/**
 * Check if a point is inside a polygon
 * @param {Array<{lat: number, lon: number}>} polygonCoords - Array of polygon coordinates
 * @param {{lat: number, lon: number}} point - Point coordinates
 * @returns {boolean} - True if the point is inside the polygon, false otherwise
 */
export function isPointInPolygon(polygonCoords, point) {
  // Convert the polygonCoords to a GeoJSON-compliant format
  const polygon = turf.polygon([
    polygonCoords.map(coord => [coord.lon, coord.lat]),
  ]);

  // Create a Turf.js point
  const pointGeoJson = turf.point([point.lon, point.lat]);

  // Check if the point is inside the polygon
  return turf.booleanPointInPolygon(pointGeoJson, polygon);
}
