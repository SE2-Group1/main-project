import mapboxgl from 'mapbox-gl';

import agreementIcon from '/icons/map_icons/agreementDocument.png';
import conflictIcon from '/icons/map_icons/conflictDocument.png';
import consultationIcon from '/icons/map_icons/consultationDocument.png';
import defaultIcon from '/icons/map_icons/default.png';
import designIcon from '/icons/map_icons/designDocument.png';
import informativeIcon from '/icons/map_icons/informativeDocument.png';
import materialEffectsIcon from '/icons/map_icons/materialEffectsDocument.png';
import municipalityIcon from '/icons/map_icons/municipalityDocuments.png';
import prescriptiveIcon from '/icons/map_icons/prescriptiveDocument.png';
import technicalIcon from '/icons/map_icons/technicalDocument.png';

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

export const getColorByType = type =>
  typeColors[type] ? typeColors[type] : 'lightblue';

export const getIconByType = type =>
  typeIcons[type] ? typeIcons[type] : defaultIcon;

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
    markerElement.setAttribute(
      'data-doc-id',
      docs[0].docId ? docs[0].docId : docs[0].id_file,
    );
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
  if (Array.isArray(coordinates[0])) {
    for (const coord of coordinates) {
      const polygonCoords = coord.map(pos => [pos.lon, pos.lat]);
      polygonCoords.forEach(coord => bounds.extend(coord));
    }
  } else {
    const polygonCoords = coordinates.map(pos => [pos.lon, pos.lat]);
    polygonCoords.forEach(coord => bounds.extend(coord));
  }
  const center = bounds.getCenter();

  return center;
};

// Calculate bounds of a polygon or point
export const calculateBounds = coordinates => {
  const bounds = new mapboxgl.LngLatBounds();

  // Extend bounds with properly formatted coordinates
  if (Array.isArray(coordinates[0])) {
    for (const coord of coordinates) {
      const polygonCoords = coord.map(pos => [pos.lon, pos.lat]);
      polygonCoords.forEach(coord => bounds.extend(coord));
    }
  } else {
    const polygonCoords = coordinates.map(pos => [pos.lon, pos.lat]);
    polygonCoords.forEach(coord => bounds.extend(coord));
  }

  // Convert bounds to an array of arrays
  const boundsArray = [
    [bounds._sw.lng, bounds._sw.lat], // [lng, lat] for southwest
    [bounds._ne.lng, bounds._ne.lat], // [lng, lat] for northeast
  ];

  return boundsArray;
};

export const getKirunaCenter = () => {
  return { lon: 20.255045, lat: 67.85528 };
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

// Helper function: Check if a point is inside a polygon (Ray-Casting Algorithm)
function pointInPolygon(point, polygon) {
  const { lon, lat } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon,
      yi = polygon[i].lat;
    const xj = polygon[j].lon,
      yj = polygon[j].lat;

    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// Check if a point is inside any polygon of a Kiruna Municipality *MultiPolygon*
export function pointInMunicipality(municipality, point) {
  for (const polygon of municipality) {
    if (pointInPolygon(point, polygon)) {
      return true; // Point is inside one of the polygons
    }
  }
  return false; // Point is outside all polygons
}

/**
 * Draw a marker when a point is selected
 * @param {Object} mapRef - A React ref to the Mapbox map instance.
 * @param georeference {Array} - indicates the lon and lat of the point
 * */

export function drawExistingPointMarker(mapRef, georeference) {
  return new mapboxgl.Marker({ color: '#9EB5CD', rotation: 0 })
    .setLngLat(georeference)
    .addTo(mapRef.current);
}

/**
 * remove the marker of a selected point
 * @param marker - the marker to remove
 * */

export function removeExistingPointMarker(marker) {
  marker.remove();
}

export const removeMunicipalityArea = mapRef => {
  if (mapRef.current.getLayer(`polygon-municipality-0`)) {
    const layers = mapRef.current.getStyle().layers;
    layers.forEach(layer => {
      if (
        layer.id.startsWith(`polygon-municipality-`) ||
        layer.id.startsWith(`polygon-outline-municipality-`)
      ) {
        mapRef.current.removeLayer(layer.id);
        mapRef.current.removeSource(layer.id);
      }
    });
  }
};

/**
 * draw the area insed the map
 *
 * */

export function drawExistingArea(mapRef, coordinates, idLayer) {
  const polygon = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  };
  mapRef.current.addLayer({
    id: `polygon-${idLayer}`,
    type: 'fill',
    source: {
      type: 'geojson',
      data: polygon,
    },
    paint: {
      'fill-color': `#9EB5CD`,
      'fill-opacity': 0.25,
    },
  });

  mapRef.current.addLayer({
    id: `polygon-outline-${idLayer}`,
    type: 'line',
    source: {
      type: 'geojson',
      data: polygon,
    },
    paint: {
      'line-color': `#9EB5CD`,
      'line-width': 2,
    },
  });
  return idLayer;
}

export function removeExistingArea(mapRef, id) {
  mapRef.current.removeLayer(`polygon-${id}`);
  mapRef.current.removeLayer(`polygon-outline-${id}`);
  mapRef.current.removeSource(`polygon-${id}`);
  mapRef.current.removeSource(`polygon-outline-${id}`);
}

export function resetMapView(coordinates, mapRef) {
  const center =
    coordinates.length > 1
      ? calculatePolygonCenter(coordinates)
      : { lng: coordinates[0].lon, lat: coordinates[0].lat };
  mapRef.current.flyTo({
    center: center,
    essential: true, // this animation is considered essential with respect to prefers-reduced-motion
  });
}

export function fromArrayToGeoObject(array) {
  return array.map(el => ({ lon: el[0], lat: el[1] }));
}

const registerIcons = mapRef => {
  if (!mapRef.current) return;
  Object.entries(typeIcons).forEach(([type, iconUrl]) => {
    if (!mapRef.current.hasImage(type)) {
      mapRef.current.loadImage(iconUrl, (error, image) => {
        if (error) {
          console.error('Error loading image:', error);
          return;
        }
        mapRef.current.addImage(type, image); // Register the image with Mapbox
      });
    }
  });
};

/* Function to create clusters of markers */
export const drawCluster = (
  groupedDocs,
  mapRef,
  setDocId,
  drawArea,
  user,
  updDocGeo,
) => {
  if (!groupedDocs || !mapRef.current) return;
  registerIcons(mapRef);
  let copyDocs = { ...groupedDocs };
  mapRef.current.addSource('documents', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: Object.entries(groupedDocs).map(([, docs], index) => {
        return {
          id: index,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: docs[0].center, // [lon, lat]
          },
          properties: {
            documents: docs, // The actual documents array in the properties
            documentCount: docs.length, // Add the count of documents as a property
            type: docs[0].type,
            color: docs.length === 1 ? getColorByType(docs[0].type) : 'gray', // Add the type of document as a property
          },
        };
      }),
    },
    cluster: true, // Enable clustering
    clusterRadius: 50, // Radius of cluster in pixels
    clusterProperties: {
      documentCount: ['+', ['length', ['get', 'documents']]], // Sum up the number of documents
    },
  });

  // Add cluster layer with dynamic colors and radius based on document count
  mapRef.current.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'documents',
    filter: ['has', 'point_count'], // Show only clusters
    paint: {
      'circle-color': [
        'step',
        ['get', 'documentCount'], // Use the documentCount property for dynamic colors
        '#51bbd6', // Small clusters
        10,
        '#f28cb1', // Medium clusters
        30,
        '#f1f075', // Large clusters
        50,
        '#f28cb1', // Extra large clusters
      ],
      'circle-radius': [
        'step',
        ['get', 'documentCount'], // Use the documentCount property for dynamic radius
        20, // Radius for small clusters
        23,
        28, // Radius for medium clusters
        30,
        35, // Radius for large clusters
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  });

  // Add cluster count layer to display the document count in the cluster
  mapRef.current.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'documents',
    filter: ['has', 'point_count'], // Show only clusters
    layout: {
      'text-field': '{documentCount}', // Display the document count
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], // Make the text bold
      'text-size': 20,
    },
  });

  // Listen for click events on clusters
  mapRef.current.on('click', 'clusters', e => {
    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ['clusters'],
    });
    const clusterId = features[0].properties.cluster_id;
    mapRef.current
      .getSource('documents')
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        mapRef.current.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });
  mapRef.current.on('data', e => {
    if (e.sourceId === 'documents' && e.isSourceLoaded) {
      const docs = mapRef.current.querySourceFeatures('documents');
      const unclusteredDocs = docs.filter(doc => !doc.properties.cluster);
      let uniqueDocs = new Set();
      let uniqueDocsList = [];
      unclusteredDocs
        .map(doc => doc.properties.documents)
        .forEach(doc => {
          const jsonObject = JSON.parse(doc);
          if (Array.isArray(jsonObject)) {
            // Check if jsonObject is an array
            const primaryDoc = jsonObject[0]; // Assume the first doc is the primary for uniqueness
            if (!uniqueDocs.has(primaryDoc.docId)) {
              uniqueDocs.add(primaryDoc.docId); // Add primary doc's ID to the Set
              uniqueDocsList.push(jsonObject); // Keep the entire array (grouped docs) together
            }
          } else {
            if (!uniqueDocs.has(jsonObject.docId)) {
              uniqueDocs.add(jsonObject.docId); // Handle the case where jsonObject is a single document
              uniqueDocsList.push([jsonObject]); // Wrap single doc in an array for consistency
            }
          }
        });
      uniqueDocsList.forEach(doc => {
        const coordinates = doc[0].coordinates;
        const docData = doc;

        // Create a marker only if its not already on the map with the same id
        const markersOnScreen = document.querySelectorAll('.mapboxgl-marker');
        let isMarkerOnScreen = false;
        markersOnScreen.forEach(marker => {
          if (parseInt(marker.getAttribute('data-doc-id'))) {
            if (parseInt(marker.getAttribute('data-doc-id')) === doc[0].docId) {
              isMarkerOnScreen = true;
            }
          } else {
            const docIds = marker.getAttribute('data-doc-ids').split(',');
            docIds.forEach(docId => {
              if (parseInt(docId) === doc[0].docId) {
                isMarkerOnScreen = true;
              }
            });
          }
        });
        if (isMarkerOnScreen) return;
        const markerElement = createMarkerElement(docData, getColorByType);
        if (doc.length > 1) {
          const popup = createPopup(doc, drawArea, setDocId);
          new mapboxgl.Marker(markerElement)
            .setLngLat(doc[0].center)
            .setPopup(popup)
            .addTo(mapRef.current);
        } else {
          let popup = null;
          markerElement.style.backgroundImage = `url(${getIconByType(doc[0].type)})`;
          let center = calculatePolygonCenter(coordinates);
          markerElement.addEventListener('mouseenter', () => {
            popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 50,
            })
              .setLngLat(center) // Set the popup's position to the marker's center
              .setText(doc[0].title) // Display the title of the document
              .addTo(mapRef.current); // Add the popup to the map
            markerElement.addEventListener('mouseleave', () => {
              if (popup) {
                popup.remove();
                popup = null;
              }
            });

            mapRef.current.on('zoom', () => {
              if (popup) {
                popup.remove();
                popup = null;
              }
            });
          });

          markerElement.addEventListener('click', () => {
            setDocId(doc[0].docId);
            if (doc[0].coordinates.length > 1) drawArea(doc[0]);
            markerElement.classList.add('highlight');
          });
          if (coordinates.length > 1) {
            center = { lng: center.lng, lat: center.lat };
          }
          if (coordinates.length === 1) {
            center = { lng: center.lng, lat: center.lat };
          }
          const newMarker = new mapboxgl.Marker(markerElement)
            .setLngLat(center)
            .setDraggable(user && coordinates.length === 1 ? true : false)
            .addTo(mapRef.current);

          let dragPopup = null;

          newMarker.on('dragstart', () => {
            dragPopup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 50, // Adjust the offset to position above the marker
            })
              .setLngLat(center)
              .setText(
                `Lng: ${center.lng.toFixed(5)}, Lat: ${center.lat.toFixed(5)}`,
              )
              .addTo(mapRef.current);
          });

          // Add event listeners for drag events
          newMarker.on('drag', () => {
            const lngLat = newMarker.getLngLat();
            dragPopup
              .setLngLat(lngLat)
              .setText(
                `Lng: ${lngLat.lng.toFixed(5)}, Lat: ${lngLat.lat.toFixed(5)}`,
              );
          });

          newMarker.on('dragend', async () => {
            const lngLat = newMarker.getLngLat();
            const coords = [{ lat: lngLat.lat, lon: lngLat.lng }];
            const newGeoreference = {
              georeference: coords,
              id_area: null,
              name_area: '',
            };
            const isConfirmed = confirm(
              'Are you sure you want to save the new position?',
            );
            if (isConfirmed) {
              updDocGeo(doc[0].docId, newGeoreference);
            } else {
              newMarker.setLngLat(center);
            }
            // Remove popup when dragging ends
            if (dragPopup) {
              dragPopup.remove();
              dragPopup = null; // Clean up reference to avoid memory leaks
            }
          });
        }
      });
    }
  });

  // Listen for zoom changes to toggle marker visibility based on zoom level
  mapRef.current.on('zoom', () => {
    const clusters = mapRef.current.querySourceFeatures('documents');
    const markersOnScreen = document.querySelectorAll('.mapboxgl-marker');
    const unclusteredDocs = clusters.filter(doc => !doc.properties.cluster);
    const uncluderedDocIds = unclusteredDocs.map(doc =>
      JSON.parse(doc.properties.documents),
    );
    const newUnclusteredDocsIds = uncluderedDocIds.flatMap(doc => {
      // Ensure `doc` is treated as an array dynamically
      const docsArray = Array.isArray(doc) ? doc : [doc];
      return docsArray.map(d => (d.docId ? d.docId : d.id_file)); // Extract `docId` from each document
    });
    let IdsOnScreen = [];
    markersOnScreen.forEach(marker => {
      if (!parseInt(marker.getAttribute('data-doc-id'))) {
        const docIds = marker.getAttribute('data-doc-ids').split(',');
        docIds.forEach(docId => {
          if (!newUnclusteredDocsIds.includes(parseInt(docId))) {
            marker.remove();
          } else {
            if (!IdsOnScreen.includes(parseInt(docId)))
              IdsOnScreen.push(parseInt(docId));
          }
        });
      } else {
        const docId = parseInt(marker.getAttribute('data-doc-id'));
        if (!newUnclusteredDocsIds.includes(docId)) {
          marker.remove();
        } else {
          if (!IdsOnScreen.includes(docId)) IdsOnScreen.push(docId);
        }
      }
    });
  });

  mapRef.current.on('zoomend', () => {
    copyDocs = mapRef.current
      .getSource('documents')
      ._data.features.reduce((acc, feature) => {
        const doc = feature.properties.documents;
        const docId = doc[0].docId;
        acc[docId] = doc;
        return acc;
      }, {});
    mapRef.current.getSource('documents').setData({
      type: 'FeatureCollection',
      features: Object.entries(copyDocs).map(([, docs], index) => {
        return {
          id: index,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: docs[0].center, // [lon, lat]
          },
          properties: {
            documents: docs, // The actual documents array in the properties
            documentCount: docs.length, // Add the count of documents as a property
            type: docs[0].type,
            color: docs.length === 1 ? getColorByType(docs[0].type) : 'gray', // Add the type of document as a property
          },
        };
      }),
    });
  });
};
