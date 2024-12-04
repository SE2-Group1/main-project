import { useState } from 'react';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import './Georeference.css';
import ExistingAreas from './components/ExistingAreas.jsx';
import ManualGeoreference from './components/ManualGeoreference.jsx';

function GeoreferencePopup({
  handleCheckboxChange, // this is for municipality checkbox
  showAddDocumentSidePanel,
  handleSaveCoordinates,
  handleCancelAddDocument,
  coordinates,
  setCoordinates,
  setGeoMode,
  geoMode,
  mapRef,
}) {
  const [mode, setMode] = useState(null);
  const cancelButtonTitle = geoMode === '' ? 'Cancel' : 'Back';

  const navigatePopUpBack = () => {
    if (mode) setMode(null);
    else if (geoMode === 'manual' || geoMode === 'existings') setGeoMode('');
    else if (geoMode === '') handleCancelAddDocument();
    setCoordinates([]);
  };
  return (
    <div id="georeferencePanel" className="georeference-panel">
      {/* Header */}
      <div className="header">
        <div className="close-button" onClick={handleCancelAddDocument}>
          ×
        </div>
        <h2 className="left-sided-panel-title">Georeference</h2>
      </div>

      {/* Content */}
      <div className="content">
        {(geoMode === '' || geoMode === 'onMap') && (
          <>
            <p>
              <strong>How do you want to georeference:</strong>
            </p>
            <div className="form-check mt-2">
              <input
                type="radio"
                className="form-check-input"
                name="georeference"
                id="existings-option"
                value="existings"
                checked={geoMode === 'existings'}
                onChange={() => {
                  setGeoMode('existings');
                }}
                disabled={coordinates.length > 0 || showAddDocumentSidePanel}
              />
              <label className="form-check-label" htmlFor="existings-option">
                Select among existing areas.
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                type="radio"
                className="form-check-input"
                name="georeference"
                id="manual-option"
                value="manual"
                checked={geoMode === 'manual'}
                onChange={() => setGeoMode('manual')}
                disabled={coordinates.length > 0 || showAddDocumentSidePanel}
              />
              <label className="form-check-label" htmlFor="manual-option">
                Georeference manually.
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                type="radio"
                className="form-check-input"
                name="georeference"
                id="on-map-option"
                value="onMap"
                checked={geoMode === 'onMap'}
                onChange={() => setGeoMode('onMap')}
                disabled={coordinates.length > 0 || showAddDocumentSidePanel}
              />
              <label className="form-check-label" htmlFor="on-map-option">
                Select/draw the area on the map.
              </label>
            </div>
            {geoMode === 'onMap' && (
              <div>
                <p>
                  <hr />
                  Use the top right buttons to select a point or draw an area on
                  the map.
                </p>
              </div>
            )}
          </>
        )}
        {(geoMode === 'manual' || geoMode === 'existings') && (
          <div>
            {geoMode === 'manual' && (
              <ManualGeoreference
                setCoordinates={setCoordinates}
                coordinates={coordinates}
              />
            )}
            {geoMode === 'existings' && (
              <ExistingAreas
                handleCheckboxChange={handleCheckboxChange}
                coordinates={coordinates}
                showAddDocumentSidePanel={showAddDocumentSidePanel}
                mapRef={mapRef}
                setCoordinates={setCoordinates}
                mode={mode}
                setMode={setMode}
              />
            )}
          </div>
        )}
        {/* Display the list of coordinates  */}
        {(geoMode === 'manual' || geoMode === 'onMap') &&
          coordinates.length > 0 &&
          coordinates.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h6>Coordinates:</h6>
              <ul>
                {coordinates.map(([lon, lat], index) => (
                  <li key={index}>{`(${lat}, ${lon})`}</li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="footer">
        <FinalButtons
          handleSaveCoordinates={handleSaveCoordinates}
          navigatePopUpBack={navigatePopUpBack}
          showAddDocumentSidePanel={showAddDocumentSidePanel}
          cancelButtonTitle={cancelButtonTitle}
        />
      </div>
    </div>
  );
}

GeoreferencePopup.propTypes = {
  handleCheckboxChange: PropTypes.func.isRequired, // this is for municipality checkbox
  showAddDocumentSidePanel: PropTypes.bool.isRequired,
  handleSaveCoordinates: PropTypes.func.isRequired,
  handleCancelAddDocument: PropTypes.func.isRequired,
  coordinates: PropTypes.array.isRequired,
  setCoordinates: PropTypes.func.isRequired,
  setGeoMode: PropTypes.func.isRequired,
  geoMode: PropTypes.string.isRequired,
  mapRef: PropTypes.object,
};

export default GeoreferencePopup;

function FinalButtons({
  handleSaveCoordinates,
  navigatePopUpBack,
  showAddDocumentSidePanel,
  cancelButtonTitle,
}) {
  return (
    <>
      <Button
        variant="primary"
        className="mb-3"
        onClick={handleSaveCoordinates}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          transform: 'translateX(-50%)',
        }}
        disabled={showAddDocumentSidePanel}
      >
        Save
      </Button>
      <Button
        variant="cancel"
        className="mb-3"
        onClick={navigatePopUpBack}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 80,
          transform: 'translateX(-50%)',
        }}
      >
        {cancelButtonTitle}
      </Button>
    </>
  );
}

FinalButtons.propTypes = {
  handleSaveCoordinates: PropTypes.func.isRequired,
  navigatePopUpBack: PropTypes.func.isRequired,
  showAddDocumentSidePanel: PropTypes.bool.isRequired,
  cancelButtonTitle: PropTypes.string.isRequired,
};
