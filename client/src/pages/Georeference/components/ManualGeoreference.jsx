import { useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import { useFeedbackContext } from '../../../contexts/FeedbackContext.js';
import API from '../../../services/API.js';
import { pointInMunicipality } from '../../../utils/map.js';
import '../Georeference.css';

function ManualGeoreference({ coordinates, setCoordinates }) {
  const { showToast } = useFeedbackContext();
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const handleAddCoordinate = async () => {
    // Validate that both latitude and longitude are provided
    if (lat === '' || lon === '') {
      showToast('Please enter both latitude and longitude.', 'warn');
      return;
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    // Validate that the inputs are numbers
    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      showToast('Latitude and Longitude must be valid numbers.', 'warn');
      return;
    }

    // Check for duplicate coordinates
    const isDuplicate = coordinates.some(
      ([existingLon, existingLat]) =>
        existingLon === parsedLon && existingLat === parsedLat,
    );

    if (isDuplicate) {
      showToast('This coordinate is already added.', 'warn');
      return;
    }

    try {
      // Fetch the municipality area
      const municipalityArea = await API.getMunicipalityArea();
      // Check if the coordinate falls within the municipality area
      const isWithinMunicipality = pointInMunicipality(municipalityArea, {
        lon: parsedLon,
        lat: parsedLat,
      });

      if (!isWithinMunicipality) {
        showToast(
          'The coordinate must fall within the municipality area.',
          'error',
        );
        return;
      }

      coordinates.length > 2
        ? setCoordinates([
            ...coordinates,
            [parsedLon, parsedLat],
            coordinates[0],
          ])
        : setCoordinates([...coordinates, [parsedLon, parsedLat]]);
      // Clear the inputs
      setLat('');
      setLon('');
    } catch (error) {
      console.error('Error validating coordinates:', error);
      showToast(
        'Failed to validate the coordinates. Please try again later.',
        'error',
      );
    }
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
    </Container>
  );
}

ManualGeoreference.propTypes = {
  setCoordinates: PropTypes.func.isRequired,
  coordinates: PropTypes.array.isRequired,
};

export default ManualGeoreference;
