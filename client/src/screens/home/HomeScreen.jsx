import { Col, Container, Row } from 'react-bootstrap';

import './Home.css';
import { NavWindow } from './components/NavWindow';

export const HomeScreen = () => {
  return (
    <Container fluid className="bg">
      <Row>
        <Col xs={3} className="bg-white ps-5 vh-100 custom-col">
          <NavWindow />
        </Col>
        <Col
          xs={9}
          className="d-flex align-content-center justify-content-center"
        >
          <p className="title">Welcome to Kiruna</p>
        </Col>
      </Row>
    </Container>
  );
};
