import { Col, Container, Image, Row } from 'react-bootstrap';

import homebg from '../../assets/images/homebg.jpeg';
import { NavComponent } from './NavComponent.jsx';
import './NavWindow.css';

// Example of a React component with PropTypes
// If props are not used, it won't throw an error
// If props are used but not defined, it will throw an error

export const NavWindow = () => {
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
            <p className="name-text"> Test1 Test1</p>
          </Row>
          <Row className="m-0">
            <p className="role-text">Urban Planner</p>
          </Row>
        </Col>
      </Row>
      <Row>
        <p className="mx-0 px-0 my-0 section-text mt-3">View Documents</p>
      </Row>
      <Row className="pt-0">
        <Col>
          <NavComponent
            name="View Map"
            icon="viewMapIcon"
            onclick={() => console.log('Ciaooo')}
          />
          <NavComponent name="Search Document" icon="searchDocumentIcon" />
          <NavComponent name="View Diagram" icon="viewDiagramIcon" />
          <NavComponent name="View Area" icon="viewAreaIcon" />
          <NavComponent name="View Documents" icon="viewDocumentIcon" />
        </Col>
      </Row>
      <Row>
        <p className="mx-0 px-0 my-0 section-text mt-3">Edit Documents</p>
      </Row>
      <Row>
        <Col>
          <NavComponent name="Add Document" icon="addDocumentIcon" />
        </Col>
      </Row>
    </Container>
  );
};

NavWindow.propTypes = {};
