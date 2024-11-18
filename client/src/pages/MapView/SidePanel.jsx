// src/components/SidePanel.js
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import '../../components/style.css';
import { typeIcons } from '../../utils/IconsMapper.js';
import './MapView.css';

function SidePanel({ selectedDocument, onClose }) {
  const [isVisible, setIsVisible] = useState(true); // State to manage visibility
  console.log('selected doc ', selectedDocument.title);

  const handleClose = () => {
    setIsVisible(false); // Close the panel
    onClose();
  };

  const handleDate = () => {
    if (selectedDocument.issuance_day) {
      return (
        selectedDocument.issuance_day +
        '/' +
        selectedDocument.issuance_month +
        '/' +
        selectedDocument.issuance_year
      );
    } else if (selectedDocument.issuance_month) {
      return (
        selectedDocument.issuance_month + '/' + selectedDocument.issuance_year
      );
    } else if (selectedDocument.issuance_year) {
      return selectedDocument.issuance_year;
    }
    return 'No issuance date';
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
              <Col md={8} className="d-flex align-items-center">
                <h3 className="pb-3">{selectedDocument.title}</h3>
              </Col>
              <Col md={4}>
                <img
                  src={typeIcons[selectedDocument.type]}
                  style={{
                    width: '90%',
                    height: '70%',
                  }}
                  alt="TypeIcon"
                />
              </Col>
            </Row>
            <Row>
              <p>
                <strong>Type:</strong> {selectedDocument.type}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                {selectedDocument.desc || 'No description'}
              </p>
              <p>
                <strong>Language:</strong> {selectedDocument.language}
              </p>
              <p>
                <strong>Scale:</strong> {selectedDocument.scale}
              </p>
              <p>
                <strong>Pages:</strong> {selectedDocument.pages}
              </p>
              <p>
                <strong>Issuance Date:</strong> {handleDate()}
              </p>
              <p>
                <strong>Stakeholders:</strong>{' '}
                {selectedDocument.stakeholder.join(', ') || 'No stakeholders'}
              </p>
              <p>
                <strong>Links:</strong>{' '}
                {selectedDocument.links.join(', ') || 'No links'}
              </p>
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
    issuance_day: PropTypes.number,
    issuance_month: PropTypes.number,
    issuance_year: PropTypes.number,
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
