import { Col, Container, Form, Row } from 'react-bootstrap';

import { Button } from '../../../components/Button.jsx';
import '../MapView.css';

function ManualGeoreference() {
  return (
    <Container
      style={{
        width: '310px',
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '8px',
      }}
    >
      <Form>
        <Form.Group as={Row} className="mb-3" controlId="latitude">
          <Form.Label column sm="2">
            Lat:
          </Form.Label>
          <Col sm="9">
            <Form.Control type="text" placeholder="Enter latitude" />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="longitude">
          <Form.Label column sm="2">
            Lon:
          </Form.Label>
          <Col sm="9">
            <Form.Control type="text" placeholder="Enter longitude" />
          </Col>
        </Form.Group>

        <div
          className="justify-content-end d-flex"
          style={{ textAlign: 'right' }}
        >
          <Button
            variant="primary"
            type="submit"
            style={{ transform: 'translateX(-50%)' }}
          >
            +
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default ManualGeoreference;
