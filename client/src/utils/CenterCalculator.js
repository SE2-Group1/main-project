import mapboxgl from 'mapbox-gl';

export const calculatePolygonCenter = coordinates => {
  const bounds = new mapboxgl.LngLatBounds();

  const polygonCoords = coordinates.map(pos => [pos.lat, pos.lon]);
  polygonCoords.forEach(coord => bounds.extend(coord));
  const center = bounds.getCenter();

  return center;
};

export const getKirunaCenter = () => {
  return { lat: 20.255045, lon: 67.85528 };
};
