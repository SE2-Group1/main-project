import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import '../MapView.css';
import ManualGeoreference from './ManualGeoreference.jsx';

function GeoreferencePopup({
  handleCheckboxChange,
  showAddDocumentSidePanel,
  handleSaveCoordinates,
  handleCancelAddDocument,
  coordinates,
}) {
  const [selectedOption, setSelectedOption] = useState('');

  const handleManualGeoreference = () => {
    if (selectedOption === 'manual') setSelectedOption('');
    else setSelectedOption('manual');
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
                  onChange={handleCheckboxChange}
                  disabled={coordinates.length > 0 || showAddDocumentSidePanel}
                />
                <label
                  className="form-check-label"
                  htmlFor="confirm-georeference"
                >
                  Use Municipality Area
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
                  Georeference manually
                </label>
              </div>
            </Row>
          </>
        )}
        {selectedOption === 'manual' && (
          <Col>
            <ManualGeoreference></ManualGeoreference>
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
          </Col>
        )}
      </Col>
    </div>
  );
}

GeoreferencePopup.propTypes = {
  handleCheckboxChange: PropTypes.func.isRequired,
  showAddDocumentSidePanel: PropTypes.bool.isRequired,
  handleSaveCoordinates: PropTypes.func.isRequired,
  handleCancelAddDocument: PropTypes.func.isRequired,
  coordinates: PropTypes.array.isRequired,
};

export default GeoreferencePopup;
