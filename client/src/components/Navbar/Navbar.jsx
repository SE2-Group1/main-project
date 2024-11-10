import { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import addDocumentIcon from '../../assets/icons/addDocumentIcon.svg';
import logoutIcon from '../../assets/icons/logoutIcon.svg';
import searchDocumentIcon from '../../assets/icons/searchDocumentIcon.svg';
import viewAreaIcon from '../../assets/icons/viewAreaIcon.svg';
import viewDiagramIcon from '../../assets/icons/viewDiagramIcon.svg';
import viewDocumentsIcon from '../../assets/icons/viewDocumentsIcon.svg';
import viewMapIcon from '../../assets/icons/viewMapIcon.svg';
import './Navbar.css';

// TODO: add the global css file

const Navbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();

  const handleViewMap = () => {
    console.log('View Map');
    navigate('/mapView');
  };

  return (
    <Container
      fluid
      className={`navbar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img
            src={searchDocumentIcon}
            alt="SearchDocument"
            className="navbar-icon"
          />
        </Col>
        {isExpanded && (
          <Col>
            <span>Search Document</span>
          </Col>
        )}
      </Row>
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img
            src={viewDiagramIcon}
            alt="ViewDiagram"
            className="navbar-icon"
          />
        </Col>
        {isExpanded && (
          <Col>
            <span>View Diagram</span>
          </Col>
        )}
      </Row>
      <Row className="navbar-item" onClick={handleViewMap}>
        <Col xs="auto" className="icon-col">
          <img src={viewMapIcon} alt="ViewMap" className="navbar-icon" />
        </Col>
        {isExpanded && (
          <Col>
            <span>View Map</span>
          </Col>
        )}
      </Row>
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img src={viewAreaIcon} alt="ViewArea" className="navbar-icon" />
        </Col>
        {isExpanded && (
          <Col>
            <span>View Area</span>
          </Col>
        )}
      </Row>
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img
            src={viewDocumentsIcon}
            alt="ViewDocuments"
            className="navbar-icon"
          />
        </Col>
        {isExpanded && (
          <Col>
            <span>View Documents</span>
          </Col>
        )}
      </Row>
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img
            src={addDocumentIcon}
            alt="AddDocument"
            className="navbar-icon"
          />
        </Col>
        {isExpanded && (
          <Col>
            <span>Add Document</span>
          </Col>
        )}
      </Row>
      <Row className="navbar-item logout">
        <Col xs="auto" className="icon-col">
          {isExpanded && (
            <img src={logoutIcon} alt="Logout" className="navbar-icon" />
          )}
        </Col>
        {isExpanded && (
          <Col>
            <span>Logout</span>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Navbar;
