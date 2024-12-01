import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

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

  const handleManualGeoreference = () => {
    if (selectedOption === 'manual') setSelectedOption('');
    else setSelectedOption('manual');
  };

  const handleExistings = () => {
    if (selectedOption === 'existings') setSelectedOption('');
    else setSelectedOption('existings');
  };

  return (
    <div id="documentPanel" className="document-panel">
      <Col>
        {/* first row is header */}
        <Row>
          <div>
            <div className="close-button" onClick={handleCancelAddDocument}>
              ×
            </div>
            <h2 className="left-sided-panel-title">Georeference</h2>
          </div>
        </Row>
        {selectedOption === '' && (
          <>
            {' '}
            <Row>
              <p>
                <strong>How do you want to georeference: </strong>
              </p>
            </Row>
            <Row>
              <div className="form-check mt-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="confirm-georeference"
                  onChange={handleExistings} // Giuseppe will handle this in KX19
                  disabled={coordinates.length > 0 || showAddDocumentSidePanel}
                />
                <label
                  className="form-check-label"
                  htmlFor="confirm-georeference"
                >
                  Select among existing areas.
                </label>
              </div>
            </Row>
            <Row>
              <div className="form-check mt-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="confirm-georeference"
                  onChange={handleManualGeoreference}
                  disabled={coordinates.length > 0 || showAddDocumentSidePanel}
                />
                <label
                  className="form-check-label"
                  htmlFor="confirm-georeference"
                >
                  Georeference manually.
                </label>
              </div>
            </Row>
          </>
        )}
        {(selectedOption === 'manual' || selectedOption === 'existings') && (
          <Col>
            {selectedOption === 'manual' && (
              <ManualGeoreference
                setCoordinates={setCoordinates}
                coordinates={coordinates}
              ></ManualGeoreference>
            )}
            {selectedOption === 'existings' && (
              <ExistingAreas
                handleCheckboxChange={handleCheckboxChange}
                coordinates={coordinates}
                showAddDocumentSidePanel={showAddDocumentSidePanel}
              ></ExistingAreas>
            )}
            <FinalButtons
              handleSaveCoordinates={handleSaveCoordinates}
              handleCancelAddDocument={handleCancelAddDocument}
              setCoordinates={setCoordinates}
              coordinates={coordinates}
            />
          </Col>
        )}
      </Col>
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
