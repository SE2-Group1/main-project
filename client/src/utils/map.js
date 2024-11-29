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

  if (Array.isArray(coordinates[0])) {
    for (const coord of coordinates) {
      const polygonCoords = coord.map(pos => [pos.lat, pos.lon]);
      polygonCoords.forEach(coord => bounds.extend(coord));
    }
  } else {
    const polygonCoords = coordinates.map(pos => [pos.lat, pos.lon]);
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
  return { lat: 20.255045, lon: 67.85528 };
};

const handleDocumentClick = (doc, setDocId, drawArea) => {
  setDocId(doc.docId);
  if (doc.coordinates.length > 1) drawArea(doc);
};

/* Function to create clusters of markers */
export const drawCluster = (groupedDocs, mapRef, setDocId, drawArea) => {
  if (!groupedDocs || groupedDocs.length === 0 || !mapRef.current) return;

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
            color: docs.length === 1 ? getColorByType(docs[0].type) : 'gray', // Add the type of document as a property
            icon: docs.length === 1 ? getIconByType(docs[0].type) : '', // Add the icon URL as a property
          },
        };
      }),
    },
    cluster: true, // Enable clustering
    clusterMaxZoom: 14, // Maximum zoom to cluster points
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

  // TODO check if its possible to create custom triangles for each cluster
  /*const triangleCoordinates = (center) => {
    const size = 0.0002; // Adjust for scale (experiment with this for the right size)
    const [x, y] = center;
    return [
      [x, y - size], // Tip of the triangle (below the circle)
      [x - size / 2, y - size / 2], // Bottom-left corner
      [x + size / 2, y - size / 2], // Bottom-right corner
      [x, y - size], // Close the loop
    ];
  };
  
  // Prepare triangle features
  const documentsData = mapRef.current.getSource('documents')._data;

  const triangleFeatures = documentsData.features.map((feature) => ({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [triangleCoordinates(feature.geometry.coordinates)],
    },
    properties: feature.properties,
  }));
  
  // Add a GeoJSON source for the triangles
  mapRef.current.addSource('triangle-source', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: triangleFeatures,
    },
  });
  
  // Add the triangle layer
  mapRef.current.addLayer({
    id: 'triangle-layer',
    type: 'fill',
    source: 'triangle-source',
    filter: ['<', ['has', 'point_count'], 2], // Ensure the triangles only show for unclustered points
    paint: {
      'fill-color': ['get', 'color'], // Match color with the circle
      'fill-opacity': 0.5,
    },
  });*/

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

  // Add unclustered point layer and display document count for each unclustered point
  mapRef.current.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'documents',
    filter: ['!', ['has', 'point_count']], // Show only unclustered points
    paint: {
      'circle-color': [
        'case', // Conditional logic
        ['<', ['get', 'documentCount'], 2], // Only when there's exactly one document
        ['get', 'color'], // Apply dynamic coloring based on type
        'red', // Default color for other cases
      ],
      'circle-radius': [
        'case', // Conditional logic for the circle size
        ['>', ['get', 'documentCount'], 1], // If documentCount > 1, increase size
        25, // Larger size for unclustered points with more than 1 document
        20, // Default size for other unclustered points
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
      'circle-opacity': 0.5,
    },
  });

  // TORNA QUI

  mapRef.current.addLayer({
    id: 'unclustered-point-icon',
    type: 'symbol',
    source: 'documents',
    filter: ['!', ['has', 'point_count']], // Show only unclustered points
    layout: {
      'icon-image': ['get', 'image'], // Use the precomputed image property
      'icon-size': 1, // Adjust icon size as needed
    },
  });

  // Add unclustered point count layer to display the document count as a label
  mapRef.current.addLayer({
    id: 'unclustered-point-count',
    type: 'symbol',
    source: 'documents',
    filter: ['>', ['get', 'documentCount'], 1], // Show only unclustered points with more than 1 document
    layout: {
      'text-field': '{documentCount}', // Use the documentCount property for unclustered points
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
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

  mapRef.current.on('click', 'unclustered-point', e => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    let docs = e.features[0].properties.documents;

    // Parse the documents if it's a stringified JSON array
    try {
      docs = JSON.parse(docs); // Converts the stringified JSON back into an array
    } catch (error) {
      console.error('Error parsing documents:', error);
      docs = []; // Fallback to an empty array in case of a parsing error
    }
    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    if (
      ['mercator', 'equirectangular'].includes(
        mapRef.current.getProjection().name,
      )
    ) {
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
    }

    if (docs.length > 1) {
      const popup = new mapboxgl.Popup().setLngLat(coordinates);
      const popupContent = document.createElement('div');

      // Create and style the header
      const header = document.createElement('h3');
      header.textContent = 'Documents in this area';
      popupContent.appendChild(header);

      const totalDocs = document.createElement('p');
      totalDocs.textContent = `Total Documents: ${docs.length}`;
      popupContent.appendChild(totalDocs);

      // Create and style the list
      const list = document.createElement('ul');
      list.style.cssText = `
        padding: 5px;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        list-style-type: disc;
        list-style-position: outside;
        padding-left: 5px;
      `;

      // Create each list item dynamically
      docs.forEach(doc => {
        const listItem = document.createElement('li');
        listItem.textContent = doc.title;
        listItem.style.cssText = `
          text-decoration: underline;
          margin-left: 5px;
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
          padding-left: 5px;
          cursor: pointer;
        `;

        // Add click event listener
        listItem.addEventListener('click', () => {
          handleDocumentClick(doc, setDocId, drawArea);
        });

        list.appendChild(listItem);
      });

      popupContent.appendChild(list);

      // Set the popup's HTML content and add to the map
      popup.setDOMContent(popupContent).addTo(mapRef.current);
    } else {
      handleDocumentClick(docs[0], setDocId, drawArea);
    }
  });

  mapRef.current.on('render', () => {
    if (!mapRef.current.isSourceLoaded('documents')) return;
    updateMarkers();
  });

  const markers = {};
  let markersOnScreen = {};

  function updateMarkers() {
    const newMarkers = {};
    const features = mapRef.current.querySourceFeatures('documents');

    // Loop through features from the 'earthquakes' source
    for (const feature of features) {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;

      // Skip clusters (those with 'cluster' property)
      if (props.cluster) continue;

      const id = feature.id; // Use feature ID for unclustered points (or another unique identifier)

      if (props.documentCount === 1) {
        let marker = markers[id];
        if (!marker) {
          // Create an image marker for unclustered points
          const el = createImageMarker(props); // Use the new function to create image markers
          marker = markers[id] = new mapboxgl.Marker({
            element: el,
          }).setLngLat(coords);
        }
        newMarkers[id] = marker;

        // Add the marker if it's not already on the map
        if (!markersOnScreen[id]) marker.addTo(mapRef.current);
      }
    }

    // Remove markers for any unclustered points that are no longer visible
    for (const id in markersOnScreen) {
      if (!newMarkers[id]) markersOnScreen[id].remove();
    }

    markersOnScreen = newMarkers;
  }

  function createImageMarker(props) {
    const img = document.createElement('img');

    // Set the image source based on the properties of the unclustered point
    img.src = props.icon; // Adjust as needed to select image based on data

    // Set styling for the image
    img.style.width = '40px'; // Adjust size as needed
    img.style.height = '40px'; // Adjust size as needed
    img.style.borderRadius = '50%'; // Optional: make it circular
    img.style.border = '2px solid #fff'; // Optional: add a border
    img.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)'; // Optional: add shadow

    const el = document.createElement('div');
    el.appendChild(img);

    return el;
  }
};
