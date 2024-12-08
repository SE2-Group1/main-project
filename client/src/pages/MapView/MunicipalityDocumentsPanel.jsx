import { useMemo, useState } from 'react';

import PropTypes from 'prop-types';

import { SearchBar } from '../../components/SearchBar';
import { useDebounceValue } from '../../hooks/useDebounceValue';
import API from '../../services/API';
import { getIconByType } from '../../utils/map';

const MunicipalityDocumentsPanel = ({
  documents,
  setSelectedDocId,
  mapRef,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounceValue(search, 400);

  const filteredDocs = useMemo(
    () =>
      documents.filter(doc =>
        doc.title.toLowerCase().includes(debounceSearch.toLowerCase()),
      ),
    [debounceSearch, documents],
  );

  const docsToShow = debounceSearch ? filteredDocs : documents;

  const drawMunicipalityArea = coords => {
    if (Array.isArray(coords[0])) {
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
          id: `multipolygon-municipality-${index}`,
          type: 'fill',
          source: {
            type: 'geojson',
            data: polygon,
          },
          paint: {
            'fill-color': 'lightblue',
            'fill-opacity': 0.25,
          },
        });

        // Add an outline layer for the current polygon
        mapRef.current.addLayer({
          id: `multipolygon-outline-municipality-${index}`,
          type: 'line',
          source: {
            type: 'geojson',
            data: polygon,
          },
          paint: {
            'line-color': 'blue',
            'line-width': 2,
          },
        });
      });
    }
  };

  const removeMunicipalityArea = () => {
    if (mapRef.current.getLayer(`multipolygon-municipality-0`)) {
      const layers = mapRef.current.getStyle().layers;
      layers.forEach(layer => {
        if (
          layer.id.startsWith(`multipolygon-municipality-`) ||
          layer.id.startsWith(`multipolygon-outline-municipality-`)
        ) {
          mapRef.current.removeLayer(layer.id);
          mapRef.current.removeSource(layer.id);
        }
      });
    }
  };

  const handleMarkerClick = async () => {
    setIsPanelOpen(true);
    const coords = await API.getMunicipalityArea();
    drawMunicipalityArea(coords);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    removeMunicipalityArea();
  };

  return (
    <div>
      {!isPanelOpen ? (
        <button
          className="marker"
          onClick={handleMarkerClick}
          style={{
            backgroundImage: `url(${getIconByType('Municipality')})`,
          }}
        ></button>
      ) : (
        <div id="documentPanel" className="document-panel">
          <div>
            <div className="close-button" onClick={closePanel}>
              ×
            </div>
            <h2 className="document-panel-title">Municipality Area</h2>
            <SearchBar search={search} setSearch={setSearch} />
          </div>
          <div className="documents-list-container">
            {documents.length === 0 ? (
              <p className="no-documents">No documents found</p>
            ) : (
              <ul className="documents-list">
                {docsToShow.map(doc => (
                  <li
                    key={doc.docId}
                    className="document-item"
                    onClick={() => setSelectedDocId(doc.docId)}
                  >
                    <img
                      src={getIconByType(doc.type)}
                      alt="document icon"
                      className="document-icon"
                    />
                    <span style={{ fontWeight: 'bold', color: '#333' }}>
                      {doc.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

MunicipalityDocumentsPanel.propTypes = {
  documents: PropTypes.array.isRequired,
  setSelectedDocId: PropTypes.func.isRequired,
  mapRef: PropTypes.object.isRequired,
};

export default MunicipalityDocumentsPanel;
