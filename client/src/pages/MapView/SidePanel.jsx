// src/components/SidePanel.js
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import '../../components/style.css';
import './MapView.css';

function SidePanel({ selectedDocument, onClose }) {
  const [isVisible, setIsVisible] = useState(true); // State to manage visibility
  console.log('selected doc ', selectedDocument.title);

  const handleClose = () => {
    setIsVisible(false); // Close the panel
    onClose();
  };

  if (!isVisible) return null; // Do not render the panel if it's closed

  return (
    <Row className="d-flex">
      <Col className="side-panel">
        {selectedDocument ? (
          <div>
            <button className="cls-button" onClick={handleClose}>
              Done
            </button>
            <Row>
              <h3 className="pb-5">{selectedDocument.title}</h3>
              <p>
                <strong>Type:</strong> {selectedDocument.type}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                {selectedDocument.desc || 'No description'}
              </p>
              {/* You can add more document info here */}
            </Row>
          </div>
        ) : (
          <p>Select a marker to see details</p>
        )}
      </Col>
    </Row>
  );
}

SidePanel.propTypes = {
  selectedDocument: PropTypes.shape({
    desc: PropTypes.string,
    id_area: PropTypes.number,
    id_file: PropTypes.number,
    issuances_day: PropTypes.number,
    issuances_month: PropTypes.number,
    issuances_year: PropTypes.number,
    language: PropTypes.string,
    links: PropTypes.array,
    pages: PropTypes.string,
    scale: PropTypes.string,
    stakeholder: PropTypes.array,
    title: PropTypes.string,
    type: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default SidePanel;
