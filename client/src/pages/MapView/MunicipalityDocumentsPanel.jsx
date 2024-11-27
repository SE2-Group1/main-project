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

  /*const exampleCoords = [
    { lon: 20.2205, lat: 67.8557 }, // Sud-Ovest
    { lon: 20.2305, lat: 67.8557 }, // Sud-Est
    { lon: 20.2305, lat: 67.8657 }, // Nord-Est
    { lon: 20.2205, lat: 67.8657 }, // Nord-Ovest
    { lon: 20.2205, lat: 67.8557 }, // Chiudiamo il poligono
  ];*/

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

    // Aggiungi il layer per l'area
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

    // Aggiungi il layer per il bordo dell'area
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

  /* return (
    <div>
      {!isPanelOpen ? (
        <button
          className="marker"
          onClick={handleMarkerClick}
          style={{
            border: '5px solid gray',
            backgroundColor: '#f0f0f0',
            backgroundSize: '100%',
            backgroundImage: `url(${typeIcons['Municipality']})`,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            cursor: 'pointer',
            position: 'fixed',
            bottom: '45px',
            right: '20px',
          }}>
      </button>
      ) : (
        <>
          <div
            id="documentPanel"
            style={{
              position: 'fixed',
              bottom: '45px',
              right: '20px',
              width: '350px',
              height: '50vh',
              backgroundColor: 'var(--color-primary-200)',
              padding: '20px',
              overflowY: 'auto',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '5px',
                right: '15px',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'white',
              }}
              onClick={closePanel}
            >
              ×
            </div>
            <h2
              style={{
                color: '#000',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              Municipality Area
            </h2>
            <input
              type="text"
              placeholder="Search a Document"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '10px',
                marginBottom: '20px',
                width: '60%',
                height: '35px',
                borderRadius: '15px',
                border: '1px solid #ccc',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
            {documents.length === 0 ? (
              <p
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: 'var(--color-secondary-100)',
                  color: 'black',
                  borderRadius: '15px',
                  marginTop: '60px',
                  fontSize: '20px',
                  fontWeight: '600',
                  border: 'var(--color-secondary-100)',
                  boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                No documents found
              </p>
            ) : (
              <ul style={{ padding: 0, margin: 0 }}>
                {documents.map(doc => (
                  <li
                    key={doc.docId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: 'var(--color-secondary-100)',
                      marginBottom: '10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => handleSelection(doc.docId)}
                  >
                    <img
                      src={typeIcons[doc.type]}
                      alt="document icon"
                      style={{
                        width: '24px',
                        height: '24px',
                        marginRight: '10px',
                      }}
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
  );*/
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
