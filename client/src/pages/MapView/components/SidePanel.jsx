// src/components/SidePanel.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { FaFileImage, FaFilePdf, FaFileWord } from 'react-icons/fa6';
import { IoArrowForwardCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import '../../../components/style.css';
import { useUserContext } from '../../../contexts/UserContext.js';
import API from '../../../services/API.js';
import {
  calculatePolygonCenter,
  decimalToDMS,
  getIconByType,
} from '../../../utils/map.js';
import '../MapView.css';

function SidePanel({ docInfo, onClose, handleShowLinksModal, clearDocState }) {
  const [isVisible, setIsVisible] = useState(true); // State to manage visibility
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [area, setArea] = useState([]);
  const [center, setCenter] = useState(null);
  const [resources, setResources] = useState([]);
  const sidePanelRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFileTypes, setActiveFileTypes] = useState({
    pdf: true,
    docx: true,
    png: true,
  });

  useEffect(() => {
    if (area.length === 0) return;
    const cent =
      area.length > 1
        ? calculatePolygonCenter(area)
        : { lat: area[0].lat, lng: area[0].lon };
    setCenter(cent);
  }, [area]);

  const handleClose = () => {
    setIsVisible(false); // Close the panel
    onClose();
  };

  useEffect(() => {
    const getResources = async () => {
      try {
        const resources = await API.getDocumentResources(docInfo.id_file);
        setResources(resources);
        console.log(resources);
      } catch (err) {
        console.warn('Error fetching resources:', err);
      }
    };
    if (docInfo) getResources();
  }, [docInfo]);

  const getIconByFileType = fileName => {
    if (fileName.endsWith('.pdf'))
      return <FaFilePdf size={54} color="#ff2525" />;
    if (fileName.endsWith('.docx'))
      return <FaFileWord size={54} color="#258bff" />;
    if (fileName.endsWith('.png') || fileName.endsWith('.PNG'))
      return <FaFileImage size={54} color="#eab543" />;
    return null;
  };

  const handleNavigate = useCallback(() => {
    if (!center) return;
    navigate(`/mapView/${docInfo.id_file}`);
  }, [navigate, center, docInfo]);

  useEffect(() => {
    // Fetch area data
    const fetchDocArea = async () => {
      try {
        const coordinates = await API.getArea(docInfo.id_area);
        setArea(coordinates); // Update state with fetched coordinates
      } catch (err) {
        console.warn('Error fetching area:', err);
      }
    };
    fetchDocArea();
  }, [docInfo]);

  // Scroll to top when `docInfo` changes
  useEffect(() => {
    if (sidePanelRef.current) {
      sidePanelRef.current.scrollTop = 0;
    }
  }, [docInfo]);

  const content = useMemo(() => {
    if (!center) return;
    if (area.length === 1) {
      const latDMS = decimalToDMS(area[0].lat, true);
      const lonDMS = decimalToDMS(area[0].lon, false);
      return user ? (
        <a className="hyperlink" onClick={handleNavigate}>
          <br /> Point
          <br /> {latDMS}
          <br /> {lonDMS}
        </a>
      ) : (
        <a className="hyperlink" onClick={handleNavigate}>
          View on Map
        </a>
      );
    } else if (area.length > 1) {
      const centerLatDMS = decimalToDMS(center.lat, true);
      const centerLonDMS = decimalToDMS(center.lng, false);
      return user ? (
        docInfo.id_area === 1 ? (
          <a className="hyperlink" onClick={handleNavigate}>
            View Municipality Area
          </a>
        ) : (
          <a className="hyperlink" onClick={handleNavigate}>
            <br /> Center
            <br /> {centerLatDMS}
            <br /> {centerLonDMS}
          </a>
        )
      ) : (
        <a className="hyperlink" onClick={handleNavigate}>
          View on Map
        </a>
      );
    } else {
      return <span>No coordinates available</span>;
    }
  }, [area, user, handleNavigate, center, docInfo.id_area]);

  const handleDate = () => {
    if (docInfo.issuance_day) {
      return (
        docInfo.issuance_day +
        '/' +
        docInfo.issuance_month +
        '/' +
        docInfo.issuance_year
      );
    } else if (docInfo.issuance_month) {
      return docInfo.issuance_month + '/' + docInfo.issuance_year;
    } else if (docInfo.issuance_year) {
      return docInfo.issuance_year;
    }
    return 'No issuance date';
  };

  const groupedLinks = docInfo.links.reduce((acc, link) => {
    if (!acc[link.doc]) {
      acc[link.doc] = { id: link.docId, types: [] };
    }
    acc[link.doc].types.push(link.link_type);
    return acc;
  }, {});

  const displayedResources = resources.slice(0, 3);

  const handleFileClick = id => {
    API.fetchResource(id);
  };

  const toggleFileType = type => {
    setActiveFileTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const filteredResources = resources.filter(resource => {
    const extension = resource.name.split('.').pop().toLowerCase();
    return (
      (extension === 'pdf' && activeFileTypes.pdf) ||
      (extension === 'docx' && activeFileTypes.docx) ||
      (['png', 'jpeg', 'jpg'].includes(extension) && activeFileTypes.png)
    );
  });

  if (!isVisible) return null; // Do not render the panel if it's closed

  return (
    <Row className="d-flex">
      <Col className="side-panel">
        {docInfo ? (
          <div className="side-panel-content" ref={sidePanelRef}>
            <Row>
              <Col md={8} className="d-flex align-items-center">
                <h3 className="pb-3">{docInfo.title}</h3>
              </Col>
              <Col md={4}>
                <img
                  src={getIconByType(docInfo.type)}
                  style={{
                    width: '90%',
                    height: '70%',
                  }}
                  alt="TypeIcon"
                />
              </Col>
            </Row>
            {user && (
              <a
                className="hyperlink"
                onClick={() =>
                  navigate(`/mapView/${docInfo.id_file}/edit-info`)
                }
              >
                Edit document info
              </a>
            )}

            <Row className="mt-2">
              <p>
                <strong>Type:</strong> {docInfo.type}
              </p>
              <p>
                <strong>Description:</strong>{' '}
              </p>
              <div
                style={{
                  overflowY: 'auto',
                  maxHeight: '150px',
                  maxWidth: '300px',
                  wordBreak: 'break-word',
                  marginBottom: '10px',
                  border: '1.5px solid #dee2e6',
                  padding: '5px',
                  marginLeft: '5px',
                  borderRadius: '5px',
                }}
              >
                {docInfo.desc || 'No description'}
              </div>
              <Row>
                <Col>
                  <p>
                    <strong>Resources:</strong>{' '}
                  </p>
                  <div className="d-flex align-items-center">
                    {resources.length > 0 ? (
                      <div className="d-flex">
                        {displayedResources.map(resource => (
                          <div
                            key={resource.id}
                            className="resource-item"
                            onClick={() => handleFileClick(resource.id)}
                          >
                            {getIconByFileType(resource.name)}
                            <p title={resource.name}>{resource.name}</p>
                          </div>
                        ))}
                        {resources.length > 3 && (
                          <Button
                            onClick={() => setShowModal(true)}
                            style={{
                              background: 'none',
                              color: 'var(--color-primary-500)',
                              padding: 0,
                            }}
                          >
                            <IoArrowForwardCircleOutline size={48} />
                            <p>View All</p>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p>No resources available</p>
                    )}
                  </div>
                </Col>
              </Row>
              <p>
                <strong>Pages:</strong>{' '}
                {resources.length > 0
                  ? resources.map(resource => resource.pages).join('-')
                  : 'No pages available'}
              </p>
              <p>
                <strong>Language:</strong>{' '}
                {docInfo.language ? docInfo.language : 'No language'}
              </p>
              <p>
                <strong>Scale:</strong> {docInfo.scale}
              </p>
              <p>
                <strong>Issuance Date:</strong> {handleDate()}
              </p>
              <p>
                <strong>Stakeholders:</strong>{' '}
                {docInfo.stakeholder.join(', ') || 'No stakeholders'}
              </p>
              <p>
                <>
                  <strong>Coordinates</strong>:
                  {user && (
                    <img
                      className="ms-2"
                      src="/icons/editIcon.svg"
                      alt="Edit Coordinates"
                      onClick={() =>
                        navigate(
                          `/mapView/${docInfo.id_file}/edit-georeference`,
                        )
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </>{' '}
                {content}
              </p>
              <p>
                <>
                  <strong>Links</strong>:{' '}
                  {user && (
                    <>
                      <img
                        className="ms-2"
                        src="/icons/editIcon.svg"
                        alt="Edit Coordinates"
                        onClick={() =>
                          handleShowLinksModal(docInfo.id_file, 'edit')
                        }
                        style={{ cursor: 'pointer' }}
                      />
                      <br />
                    </>
                  )}
                </>
                {docInfo.links.length === 0 ? (
                  'No links'
                ) : (
                  <ul>
                    {Object.entries(groupedLinks).map(
                      ([docId, { id, types }]) => (
                        <li key={id}>
                          <a
                            className="hyperlink"
                            onClick={() => {
                              if (clearDocState) clearDocState(id);
                              navigate(`/mapView/${id}`);
                            }}
                          >
                            {docId}
                          </a>{' '}
                          -{'>'} {types.join(', ')}
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </p>
            </Row>
          </div>
        ) : (
          <p>Select a marker to see details</p>
        )}
        <div className="button-container d-flex justify-content-end">
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        </div>
      </Col>

      {/* Modal for viewing all resources */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setActiveFileTypes({ pdf: true, docx: true, png: true });
        }}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>All Resources</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex align-items-center">
          <Col>
            <Col className="filter-buttons-col justify-content-start mb-3">
              <Button
                className={`pdf-filter-btn ${activeFileTypes.pdf ? '' : 'active'}`}
                onClick={() => toggleFileType('pdf')}
              >
                <FaFilePdf /> PDF Files
              </Button>
              <Button
                className={`word-filter-btn ${activeFileTypes.docx ? '' : 'active'}`}
                onClick={() => toggleFileType('docx')}
              >
                <FaFileWord /> DOCX Files
              </Button>
              <Button
                className={`png-filter-btn ${activeFileTypes.png ? '' : 'active'}`}
                onClick={() => toggleFileType('png')}
              >
                <FaFileImage /> PNG Files
              </Button>
            </Col>
            <Row>
              {filteredResources.length > 0 ? (
                <div className="d-flex flex-wrap">
                  {filteredResources.map(resource => (
                    <Row
                      key={resource.id}
                      className="resource-item"
                      style={{
                        maxWidth: '19%',
                        marginRight: '8px',
                        marginLeft: '8px',
                      }}
                      onClick={() => handleFileClick(resource.id)}
                    >
                      {getIconByFileType(resource.name)}
                      <p
                        title={resource.name}
                        className="mt-2"
                        style={{ wordBreak: 'break-word' }}
                      >
                        {resource.name}
                      </p>
                    </Row>
                  ))}
                </div>
              ) : (
                <p>No resources available for the selected file types</p>
              )}
            </Row>
          </Col>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
}

SidePanel.propTypes = {
  docInfo: PropTypes.shape({
    desc: PropTypes.string,
    id_area: PropTypes.number,
    id_file: PropTypes.number,
    issuance_day: PropTypes.any,
    issuance_month: PropTypes.any,
    issuance_year: PropTypes.string,
    language: PropTypes.string,
    links: PropTypes.array,
    scale: PropTypes.string,
    stakeholder: PropTypes.array,
    title: PropTypes.string,
    type: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  handleShowLinksModal: PropTypes.func.isRequired,
  clearDocState: PropTypes.func,
};

export default SidePanel;
