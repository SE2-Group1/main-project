import mapboxgl from 'mapbox-gl';

import agreementIcon from '/icons/map_icons/agreementDocument.png';
import conflictIcon from '/icons/map_icons/conflictDocument.png';
import consultationIcon from '/icons/map_icons/consultationDocument.png';
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

const registerIcons = mapRef => {
  Object.entries(typeIcons).forEach(([type, iconUrl]) => {
    mapRef.current.loadImage(iconUrl, (error, image) => {
      if (error) {
        console.error('Error loading image:', error);
        return;
      }
      mapRef.current.addImage(type, image); // Register the image with Mapbox
    });
  });
};

/* Function to create clusters of markers */
export const drawCluster = (groupedDocs, mapRef, setDocId, drawArea) => {
  if (!groupedDocs || groupedDocs.length === 0 || !mapRef.current) return;

  registerIcons(mapRef);

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
      //console.log('Data loaded');
      const docs = mapRef.current.querySourceFeatures('documents');
      const unclusteredDocs = docs.filter(doc => !doc.properties.cluster);
      //console.log(unclusteredDocs.map(doc => doc.properties.documents));

      let uniqueDocs = new Set();
      let uniqueDocsList = [];
      unclusteredDocs
        .map(doc => doc.properties.documents)
        .forEach(doc => {
          const jsonObject = JSON.parse(doc);
          //console.log(jsonObject[0]);
          if (!uniqueDocs.has(jsonObject[0].docId)) {
            uniqueDocs.add(jsonObject[0].docId);
            uniqueDocsList.push(jsonObject[0]);
          }
        });
      uniqueDocsList.forEach(doc => {
        const coordinates = doc.coordinates;
        const docData = [doc];
        //console.log('Creating marker for:', docData);
        const markerElement = createMarkerElement(docData, getColorByType);
        if (doc.length > 1) {
          const popup = createPopup(doc, drawArea, setDocId);
          new mapboxgl.Marker(markerElement)
            .setLngLat(doc[0].center)
            .setPopup(popup)
            .addTo(mapRef.current);
        } else {
          //console.log(doc);
          markerElement.style.backgroundImage = `url(${getIconByType(doc.type)})`;
          markerElement.addEventListener('click', () => {
            setDocId(doc.docId);
            if (doc.coordinates.length > 1) drawArea(doc);
          });
          //console.log(coordinates.length);
          let center = calculatePolygonCenter(coordinates);
          //console.log(center);
          if (coordinates.length > 1) {
            center = { lng: center.lat, lat: center.lng };
          }
          new mapboxgl.Marker(markerElement)
            .setLngLat(center)
            .addTo(mapRef.current);
        }
      });
    }
  });

  // Listen for zoom changes to toggle marker visibility based on zoom level
  mapRef.current.on('zoom', () => {
    console.log('Zoom level:', mapRef.current.getZoom());
    const clusters = mapRef.current.querySourceFeatures('documents');
    const markersOnScreen = document.querySelectorAll('.mapboxgl-marker');
    const unclusteredDocs = clusters.filter(doc => !doc.properties.cluster);
    //console.log(unclusteredDocs.map(doc => doc.properties.documents));
    const uncluderedDocIds = unclusteredDocs.map(doc =>
      JSON.parse(doc.properties.documents),
    );
    const newUnclusteredDocsIds = uncluderedDocIds.map(doc => doc[0].docId);
    let IdsOnScreen = [];
    markersOnScreen.forEach(marker => {
      const docId = parseInt(marker.getAttribute('data-doc-id'));
      if (!newUnclusteredDocsIds.includes(docId)) {
        //console.log('Removing marker for:', docId);
        marker.remove();
      } else {
        IdsOnScreen.push(docId);
      }
    });
    uncluderedDocIds.forEach(doc => {
      if (!IdsOnScreen.includes(doc[0].docId)) {
        //console.log('Creating marker for22222:', doc);
        const coordinates = doc[0].coordinates;
        const docData = doc;
        const markerElement = createMarkerElement(docData, getColorByType);
        if (doc[0].length > 1) {
          const popup = createPopup(doc[0], drawArea, setDocId);
          new mapboxgl.Marker(markerElement)
            .setLngLat(doc[0].center)
            .setPopup(popup)
            .addTo(mapRef.current);
        } else {
          markerElement.style.backgroundImage = `url(${getIconByType(doc[0].type)})`;
          markerElement.addEventListener('click', () => {
            setDocId(doc[0].docId);
            if (doc[0].coordinates.length > 1) drawArea(doc[0]);
          });
          let center = calculatePolygonCenter(coordinates);
          if (coordinates.length > 1) {
            center = { lng: center.lat, lat: center.lng };
          }
          new mapboxgl.Marker(markerElement)
            .setLngLat(center)
            .addTo(mapRef.current);
        }
      }
    });
  });

  mapRef.current.on('zoomend', () => {
    mapRef.current.getSource('documents').setData({
      type: 'FeatureCollection',
      features: Object.entries(groupedDocs).map(([, docs], index) => ({
        id: index,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: docs[0].center, // [lon, lat]
        },
        properties: {
          documents: docs,
          documentCount: docs.length,
          type: docs[0].type,
          color: docs.length === 1 ? getColorByType(docs[0].type) : 'gray',
        },
      })),
    });
  });
};
