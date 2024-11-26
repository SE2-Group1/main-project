// src/components/SidePanel.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import '../../../components/style.css';
import { useUserContext } from '../../../contexts/UserContext.js';
import API from '../../../services/API.js';
import {
  calculateBounds,
  calculatePolygonCenter,
  getIconByType,
} from '../../../utils/map.js';
import '../MapView.css';

function SidePanel({ docInfo, onClose }) {
  const [isVisible, setIsVisible] = useState(true); // State to manage visibility
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [area, setArea] = useState([]);
  const [center, setCenter] = useState(null);
  const [bound, setBound] = useState(null);

  useEffect(() => {
    if (area.length > 1) {
      setCenter(calculatePolygonCenter(area));
      setBound(calculateBounds(area));
    } else if (area.length === 1) {
      setCenter(area.map(pos => ({ lat: pos.lat, lng: pos.lon }))[0]);
      setBound(center);
    }
  }, [area]);

  const handleClose = () => {
    setIsVisible(false); // Close the panel
    onClose();
  };

  const handleNavigate = useCallback(() => {
    if (!center) return;
    navigate(`/mapView/${docInfo.id_file}`, {
      state: {
        mapMode: 'view',
        docId: docInfo.id_file,
        area: bound,
      },
    });
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

  const content = useMemo(() => {
    if (!center) return;
    if (area.length === 1) {
      return user ? (
        <>
          <a className="hyperlink" onClick={handleNavigate}>
            <br /> Point:
            <br /> Lat: {area[0].lat}
            <br /> Lon: {area[0].lon}
          </a>
        </>
      ) : (
        <a className="hyperlink" onClick={handleNavigate}>
          View on Map
        </a>
      );
    } else if (area.length > 1) {
      return user ? (
        <>
          <a className="hyperlink" onClick={handleNavigate}>
            <br /> Center:
            <br /> Lat: {center.lat}
            <br /> Lon: {center.lng}
          </a>
        </>
      ) : (
        <a className="hyperlink" onClick={handleNavigate}>
          View on Map
        </a>
      );
    } else {
      return <span>No coordinates available</span>;
    }
  }, [area, user, handleNavigate, center]);

  const handleNewGeoreference = () => {
    navigate('/mapView', {
      state: {
        mapMode: 'georeference',
        docId: docInfo.id_file,
      },
    });
  };

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

  if (!isVisible) return null; // Do not render the panel if it's closed

  return (
    <Row className="d-flex">
      <Col className="side-panel">
        {docInfo ? (
          //TODO: if the screen gets smaller the buttons bugs
          <div className="side-panel-content">
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
            <Row>
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
                  maxWidth: '280px',
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
              <p>
                <strong>Language:</strong>{' '}
                {docInfo.language ? docInfo.language : 'No language'}
              </p>
              <p>
                <strong>Scale:</strong> {docInfo.scale}
              </p>
              <p>
                <strong>Pages:</strong>{' '}
                {docInfo.pages ? docInfo.pages : 'No pages'}
              </p>
              <p>
                <strong>Issuance Date:</strong> {handleDate()}
              </p>
              <p>
                <strong>Stakeholders:</strong>{' '}
                {docInfo.stakeholder.join(', ') || 'No stakeholders'}
              </p>
              <p>
                <strong>Coordinates</strong>: {content}
              </p>
              <p>
                <strong>Links:</strong>{' '}
                {docInfo.links.length === 0 ? (
                  'No links'
                ) : (
                  <ul>
                    {docInfo.links.map((link, index) => (
                      <li key={link.doc + index}>
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
    pages: PropTypes.string,
    scale: PropTypes.string,
    stakeholder: PropTypes.array,
    title: PropTypes.string,
    type: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default SidePanel;
