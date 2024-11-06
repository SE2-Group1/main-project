import { Col, Container, Row } from 'react-bootstrap';

import { NavWindow } from '../../components/HomePage/NavWindow.jsx';
import './Home.css';

export const HomePage = () => {
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
          <p className="title">Welcome to Kyruna</p>
        </Col>
      </Row>
    </Container>
  );
};
