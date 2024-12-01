import { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import { arePointsEqual } from '../../../utils/map.js';
import '../MapView.css';
import ExistingAreas from './ExistingAreas.jsx';
import ManualGeoreference from './ManualGeoreference.jsx';

function GeoreferencePopup({
  handleCheckboxChange, // this is for municipality checkbox
  showAddDocumentSidePanel,
  handleSaveCoordinates,
  handleCancelAddDocument,
  coordinates,
  setCoordinates,
}) {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = option => {
    setSelectedOption(option);
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
        {(selectedOption === '' || selectedOption === 'onMap') && (
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
                checked={selectedOption === 'existings'}
                onChange={() => handleOptionChange('existings')}
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
                checked={selectedOption === 'manual'}
                onChange={() => handleOptionChange('manual')}
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
                checked={selectedOption === 'onMap'}
                onChange={() => handleOptionChange('onMap')}
                disabled={coordinates.length > 0 || showAddDocumentSidePanel}
              />
              <label className="form-check-label" htmlFor="on-map-option">
                Select/draw the area on the map.
              </label>
            </div>
            {selectedOption === 'onMap' && (
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
        {(selectedOption === 'manual' || selectedOption === 'existings') && (
          <div>
            {selectedOption === 'manual' && (
              <ManualGeoreference
                setCoordinates={setCoordinates}
                coordinates={coordinates}
              />
            )}
            {selectedOption === 'existings' && (
              <ExistingAreas
                handleCheckboxChange={handleCheckboxChange}
                coordinates={coordinates}
                showAddDocumentSidePanel={showAddDocumentSidePanel}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <FinalButtons
          handleSaveCoordinates={handleSaveCoordinates}
          handleCancelAddDocument={handleCancelAddDocument}
          setCoordinates={setCoordinates}
          coordinates={coordinates}
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
};

export default GeoreferencePopup;

function FinalButtons({
  handleSaveCoordinates,
  handleCancelAddDocument,
  coordinates,
  setCoordinates,
}) {
  //states for polygon check in manual inputs
  const [polygonCheckTrigger, setPolygonCheckTrigger] = useState(false);

  useEffect(() => {
    if (
      coordinates.length > 2 &&
      !arePointsEqual(coordinates[0], coordinates[coordinates.length - 1])
    ) {
      setCoordinates([...coordinates, coordinates[0]]);
    }
  }, [polygonCheckTrigger, coordinates, setCoordinates]);

  const handleSave = () => {
    if (coordinates.length > 2) {
      setPolygonCheckTrigger(prev => !prev); // Trigger polygon closure
    } else {
      handleSaveCoordinates(); // Directly save if no polygon closing is needed
    }
  };

  useEffect(() => {
    if (polygonCheckTrigger) {
      handleSaveCoordinates(); // Ensure save after polygon closure
    }
  }, [polygonCheckTrigger, handleSaveCoordinates]);

  return (
    <>
      <Button
        variant="primary"
        className="mb-3"
        onClick={handleSave}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          transform: 'translateX(-50%)',
        }}
      >
        Save
      </Button>
      <Button
        variant="cancel"
        className="mb-3"
        onClick={handleCancelAddDocument}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 80,
          transform: 'translateX(-50%)',
        }}
      >
        Cancel
      </Button>
    </>
  );
}

FinalButtons.propTypes = {
  handleSaveCoordinates: PropTypes.func.isRequired,
  handleCancelAddDocument: PropTypes.func.isRequired,
  coordinates: PropTypes.array.isRequired,
  setCoordinates: PropTypes.func.isRequired,
};
