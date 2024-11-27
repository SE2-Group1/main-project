import { useState } from 'react';

import PropTypes from 'prop-types';

import API from '../../services/API';
import { typeIcons } from '../../utils/IconsMapper.js';

const MunicipalityDocumentsPanel = ({
  documents,
  setSelectedDocument,
  mapRef,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelection = async docId => {
    const doc = await API.getDocument(docId);
    setSelectedDocument(doc);
  };

  const drawMunicipalityArea = coords => {
    console.log('coordinate passate:', coords);
    console.log('mappa:', mapRef.current);
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
  };

  const removeMunicipalityArea = () => {
    if (mapRef.current.getLayer(`polygon-municipality`)) {
      mapRef.current.removeLayer(`polygon-municipality`);
      mapRef.current.removeLayer(`polygon-outline-municipality`);
      mapRef.current.removeSource(`polygon-municipality`);
      mapRef.current.removeSource(`polygon-outline-municipality`);
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
            backgroundImage: `url(${typeIcons['Municipality']})`,
          }}
        ></button>
      ) : (
        <>
          <div id="documentPanel" className="document-panel ">
            <div className="close-button" onClick={closePanel}>
              ×
            </div>
            <h2 className="document-panel-title">Municipality Area</h2>
            <input
              type="text"
              placeholder="Search a Document"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {documents.length === 0 ? (
              <p className="no-documents">No documents found</p>
            ) : (
              <ul className="documents-list">
                {documents.map(doc => (
                  <li
                    key={doc.docId}
                    className="document-item"
                    onClick={() => handleSelection(doc.docId)}
                  >
                    <img
                      src={typeIcons[doc.type]}
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
        </>
      )}
    </div>
  );
};

MunicipalityDocumentsPanel.propTypes = {
  documents: PropTypes.array.isRequired,
  setSelectedDocument: PropTypes.func.isRequired,
  mapRef: PropTypes.object.isRequired,
};

export default MunicipalityDocumentsPanel;
