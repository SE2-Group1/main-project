// src/components/SidePanel.js
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button';
import '../../components/style.css';
import { useUserContext } from '../../contexts/UserContext';
import { typeIcons } from '../../utils/IconsMapper.js';
import './MapView.css';

function SidePanel({ selectedDocument, onClose, setIsModifyingGeoreference }) {
  const [isVisible, setIsVisible] = useState(true); // State to manage visibility
  const navigate = useNavigate();
  const handleClose = () => {
    setIsVisible(false); // Close the panel
    onClose();
  };
  const { user } = useUserContext();

  const handleNewGeoreference = () => {
    console.log('Georeference document');
    setIsModifyingGeoreference(true);
    navigate('/mapView', {
      state: {
        isAddingDocument: true,
        timestamp: Date.now(),
        selectedDocument: null,
        isModifyingDocument: false,
      },
    });
  };

  const handleDate = () => {
    console.log(selectedDocument);
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
              </p>
              <div
                style={{
                  overflowY: 'auto',
                  maxHeight: '70px',
                  wordBreak: 'break-word',
                  marginBottom: '20px',
                  border: '1.5px solid #dee2e6',
                  padding: '5px',
                  borderRadius: '5px',
                }}
              >
                {selectedDocument.desc || 'No description'}
              </div>
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
                {selectedDocument.links.length === 0 ? (
                  'No links'
                ) : (
                  <ul>
                    {selectedDocument.links.map(link => (
                      <li key={link.doc}>
                        {link.doc} -{'>'} {link.link_type}
                      </li>
                    ))}
                  </ul>
                )}
              </p>
            </Row>
            {user && (
              <a className="hyperlink" onClick={handleNewGeoreference}>
                Edit georeference
              </a>
            )}
            <div className="button-container d-flex justify-content-end">
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </div>
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
  setIsModifyingGeoreference: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SidePanel;
