import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { useFeedbackContext } from '../../contexts/FeedbackContext';
import { useUserContext } from '../../contexts/UserContext';
import API from '../../services/API';
import './Navbar.css';
import addDocumentIcon from '/icons/addDocumentIcon.svg';
import logoutIcon from '/icons/logoutIcon.svg';
import searchDocumentIcon from '/icons/searchDocumentIcon.svg';
import viewAreaIcon from '/icons/viewAreaIcon.svg';
import viewDiagramIcon from '/icons/viewDiagramIcon.svg';
import viewDocumentsIcon from '/icons/viewDocumentsIcon.svg';
import viewMapIcon from '/icons/viewMapIcon.svg';

// TODO: add the global css file

const Navbar = () => {
  const { user, setUser } = useUserContext();
  const { showToast } = useFeedbackContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.isAddingDocument) {
      navigate(location.pathname, { replace: true, state: {} }); // Clear state on mount
    }
  }, [location, navigate]);

  const handleViewMap = () => {
    navigate('/mapView', { isAddingDocument: false, timestamp: Date.now() });
  };

  const handleLogout = async () => {
    try {
      await API.logout();
      navigate('/home');
      showToast('Logged out', 'success');
      setUser(null);
    } catch {
      showToast('Failed to logout', 'error');
    }
  };

  const handleAddDocument = () => {
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
      {user && (
        <>
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
        </>
      )}
    </Container>
  );
};

export default Navbar;
