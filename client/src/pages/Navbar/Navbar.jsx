import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useUserContext } from '../../contexts/UserContext';
import API from '../../services/API';
import './Navbar.css';
import addDocumentIcon from '/icons/addDocumentIcon.svg';
import HouseIcon from '/icons/house.svg';
import logoutIcon from '/icons/logoutIcon.svg';
import profileIcon from '/icons/profileIcon.svg';
import viewDocumentsIcon from '/icons/viewDocumentsIcon.svg';
import viewMapIcon from '/icons/viewMapIcon.svg';

// TODO: add the global css file

const Navbar = () => {
  const { user, setUser } = useUserContext();
  const { showToast } = useFeedbackContext();

  const navigate = useNavigate();

  const handleViewMap = () => {
    navigate('/mapView', {
      mapMode: 'view',
      docId: null,
    });
  };

  const handleLogout = async () => {
    try {
      await API.logout();
      navigate('/mapView', { state: { mapMode: 'view', docId: null } });
      showToast('Logged out', 'success');
      setUser(null);
    } catch {
      showToast('Failed to logout', 'error');
    }
  };

  const handleAddDocument = () => {
    navigate('/mapView', {
      state: { mapMode: 'georeference', docId: null },
    });
  };

  const handleViewDocument = () => {
    navigate('/listView');
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Container fluid className="navbar">
      {user ? (
        <Row className="navbar-item logged">
          <Col xs="auto" className="icon-col">
            <img src={profileIcon} alt="Profile" className="navbar-icon" />
            <span className="link-text user">{user.username}</span>
          </Col>
        </Row>
      ) : (
        <Row className="navbar-item login" onClick={handleLogin}>
          <Col xs="auto" className="icon-col">
            <img src={profileIcon} alt="Login" className="navbar-icon" />
            <span className="link-text">Login</span>
          </Col>
        </Row>
      )}
      <Row className="navbar-item" onClick={handleGoHome}>
        <Col xs="auto" className="icon-col">
          <img src={HouseIcon} alt="Home" className="navbar-icon" />
          <span className="link-text">Home</span>
        </Col>
      </Row>
      {/*<Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img
            src={viewDiagramIcon}
            alt="ViewDiagram"
            className="navbar-icon"
          />
          <span className="link-text">View Diagram</span>
        </Col>
      </Row>
      */}
      <Row className="navbar-item" onClick={handleViewMap}>
        <Col xs="auto" className="icon-col">
          <img src={viewMapIcon} alt="ViewMap" className="navbar-icon" />
          <span className="link-text">View Map</span>
        </Col>
      </Row>
      {/*<Row className="navbar-item">
        <Col xs="auto" className="icon-col">
          <img src={viewAreaIcon} alt="ViewArea" className="navbar-icon" />
          <span className="link-text">View Area</span>
        </Col>
      </Row>*/}
      <Row className="navbar-item" onClick={handleViewDocument}>
        <Col xs="auto" className="icon-col">
          <img
            src={viewDocumentsIcon}
            alt="ViewDocuments"
            className="navbar-icon"
          />
          <span className="link-text">View Documents</span>
        </Col>
      </Row>
      {user ? (
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
      ) : (
        <Row className="navbar-item end" />
      )}
    </Container>
  );
};

export default Navbar;
