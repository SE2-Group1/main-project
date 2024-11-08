import { Col, Container, Image, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { useFeedbackContext } from '../../../contexts/FeedbackContext.js';
import { useUserContext } from '../../../contexts/UserContext.js';
import API from '../../../services/API.js';
import { NavComponent } from './NavComponent.jsx';
import './NavWindow.css';
import homebg from '/images/homebg.jpeg';

export const NavWindow = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const { showToast } = useFeedbackContext();

  const handleLogout = async () => {
    try {
      await API.logout();
      showToast('Logged out', 'success');
      setUser(null);
    } catch {
      showToast('Failed to logout', 'error');
    }
  };
  return (
    <Container className="navWindow">
      <Row className="align-items-center">
        <Col xs="auto" className="p-0">
          <Image src={homebg} className="profile-img" roundedCircle />
        </Col>
        <Col
          xs="auto"
          className="p-0 justify-content-center align-items-center pt-3"
        >
          <Row className="m-0">
            <p className="name-text">{user ? user.username : ''}</p>
          </Row>
          <Row className="m-0">
            <p className="role-text">{user ? user.role : ''}</p>
          </Row>
        </Col>
      </Row>
      {/* TODO: Add the following code to the NavWindow component */}
      {/* <Row>
        <p className="mx-0 px-0 my-0 section-text mt-3">View Documents</p>
      </Row>
      <Row className="pt-0">
        <Col>
          <NavComponent
            name="View Map"
            icon="viewMapIcon"
            onclick={() => navigate('/')}
          />
          <NavComponent
            name="Search Document"
            icon="searchDocumentIcon"
            onclick={() => navigate('/')}
          />
          <NavComponent
            name="View Diagram"
            icon="viewDiagramIcon"
            onclick={() => navigate('/')}
          />
          <NavComponent
            name="View Area"
            icon="viewAreaIcon"
            onclick={() => navigate('/')}
          />
          <NavComponent
            name="View Documents"
            icon="viewDocumentIcon"
            onclick={() => navigate('/')}
          />
        </Col>
      </Row> */}
      <Row>
        <a
          className="mx-0 px-0 my-0 section-text mt-3"
          style={{ cursor: 'pointer' }}
          onClick={handleLogout}
        >
          Logout
        </a>
      </Row>
      <Row>
        <p className="mx-0 px-0 my-0 section-text mt-3">Edit Documents</p>
      </Row>
      <Row>
        <Col>
          <NavComponent
            name="Add Document"
            icon="addDocumentIcon"
            onclick={() => navigate('/submitDocument')}
          />
          <NavComponent
            name="Edit Links"
            icon="addDocumentIcon"
            onclick={() => navigate('/submitDocument')}
          />
        </Col>
      </Row>
    </Container>
  );
};

NavWindow.propTypes = {};
