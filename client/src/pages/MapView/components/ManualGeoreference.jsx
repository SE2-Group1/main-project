import { useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import { useFeedbackContext } from '../../../contexts/FeedbackContext.js';
import '../MapView.css';

function ManualGeoreference({ coordinates, setCoordinates }) {
  const { showToast } = useFeedbackContext();
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const handleAddCoordinate = () => {
    // Validate that both latitude and longitude are provided
    if (lat === '' || lon === '') {
      showToast('Please enter both latitude and longitude.', 'warn');
      return;
    }

    // Add the new coordinate to the list
    setCoordinates([...coordinates, [parseFloat(lat), parseFloat(lon)]]);

    // Clear the inputs
    setLat('');
    setLon('');
  };

  return (
    <Container>
      <Form
        style={{
          width: '300px',
          border: '1px solid #ddd',
          padding: '12px',
          borderRadius: '8px',
        }}
      >
        <Form.Group as={Row} className="mb-3" controlId="latitude">
          <Form.Label column sm="2">
            Lat:
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              placeholder="Enter latitude"
              value={lat}
              onChange={e => setLat(e.target.value)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="longitude">
          <Form.Label column sm="2">
            Lon:
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              placeholder="Enter longitude"
              value={lon}
              onChange={e => setLon(e.target.value)}
            />
          </Col>
        </Form.Group>

        <div
          className="justify-content-end d-flex"
          style={{ textAlign: 'right' }}
        >
          <Button variant="primary" type="button" onClick={handleAddCoordinate}>
            +
          </Button>
        </div>
      </Form>

      {/* Display the list of coordinates */}
      <div style={{ marginTop: '15px' }}>
        <h6>Coordinates:</h6>
        {coordinates.length > 0 ? (
          <ul>
            {coordinates.map(([lat, lon], index) => (
              <li key={index}>{`(${lat}, ${lon})`}</li>
            ))}
          </ul>
        ) : (
          <p>No coordinates added yet.</p>
        )}
      </div>
    </Container>
  );
}

ManualGeoreference.propTypes = {
  setCoordinates: PropTypes.func.isRequired,
  coordinates: PropTypes.array.isRequired,
};

export default ManualGeoreference;
