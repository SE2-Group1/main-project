import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import addDocumentIcon from '../../assets/icons/addDocumentIcon.svg';
import logoutIcon from '../../assets/icons/logoutIcon.svg';
import searchDocumentIcon from '../../assets/icons/searchDocumentIcon.svg';
import viewAreaIcon from '../../assets/icons/viewAreaIcon.svg';
import viewDiagramIcon from '../../assets/icons/viewDiagramIcon.svg';
import viewDocumentsIcon from '../../assets/icons/viewDocumentsIcon.svg';
import viewMapIcon from '../../assets/icons/viewMapIcon.svg';
import { useUserContext } from '../../context/userContext';
import API from '../../services/API';
import './Navbar.css';

// TODO: add the global css file

const Navbar = () => {
  const { setUser } = useUserContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.isAddingDocument) {
      navigate(location.pathname, { replace: true, state: {} }); // Clear state on mount
    }
  }, [location, navigate]);

  const handleViewMap = () => {
    console.log('View Map');
    navigate('/mapView');
  };

  const handleLogout = async () => {
    await API.logout().then(() => navigate('/login'));
    setUser(null);
  };

  const handleAddDocument = () => {
    console.log('Add Document');
    navigate('/mapView', {
      state: { isAddingDocument: true, timestamp: Date.now() },
    });
  };

  return (
    <Container fluid className="navbar">
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img
            src={searchDocumentIcon}
            alt="SearchDocument"
            className="navbar-icon"
          />
          <span className="link-text">Search Document</span>
        </Col>
      </Row>
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img
            src={viewDiagramIcon}
            alt="ViewDiagram"
            className="navbar-icon"
          />
          <span className="link-text">View Diagram</span>
        </Col>
      </Row>
      <Row className="navbar-item" onClick={handleViewMap}>
        <Col xs="auto" className="icon-col">
          <img src={viewMapIcon} alt="ViewMap" className="navbar-icon" />
          <span className="link-text">View Map</span>
        </Col>
      </Row>
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img src={viewAreaIcon} alt="ViewArea" className="navbar-icon" />
          <span className="link-text">View Area</span>
        </Col>
      </Row>
      <Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img
            src={viewDocumentsIcon}
            alt="ViewDocuments"
            className="navbar-icon"
          />
          <span className="link-text">View Documents</span>
        </Col>
      </Row>
      <Row className="navbar-item" onClick={handleAddDocument}>
        <Col xs="auto" className="icon-col">
          <img
            src={addDocumentIcon}
            alt="AddDocument"
            className="navbar-icon"
          />
          <span className="link-text">Add Document</span>
        </Col>
      </Row>
      <Row className="navbar-item logout" onClick={handleLogout}>
        <Col xs="auto" className="icon-col">
          <img src={logoutIcon} alt="Logout" className="navbar-icon" />
          <span className="link-text">Logout</span>
        </Col>
      </Row>
    </Container>
  );
};

export default Navbar;
