import { useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import { useFeedbackContext } from '../../../contexts/FeedbackContext.js';
import API from '../../../services/API.js';
import {
  drawExistingArea,
  drawExistingPointMarker,
  removeExistingArea,
  removeExistingPointMarker,
} from '../../../utils/map.js';
import { pointInMunicipality } from '../../../utils/map.js';
import '../Georeference.css';

function ManualGeoreference({ coordinates, setCoordinates, mapRef }) {
  const { showToast } = useFeedbackContext();
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [insertedPointArea, setInsertedPointArea] = useState(null);

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
      //TODO center the camera
      if (coordinates.length === 0) {
        //draw the marker
        const marker = drawExistingPointMarker(mapRef, [parsedLon, parsedLat]);
        setInsertedPointArea(marker);
      } else if (coordinates.length === 1) {
        //remove the point
        removeExistingPointMarker(insertedPointArea);
        setInsertedPointArea(null);
      } else if (coordinates.length > 1) {
        /*
        check if there is an existing area, if true delete the existing area and
        create a new ID named area-length of coordinates. Then create a new area. Else, add
        the area, without deleting a new one
         */
        if (
          insertedPointArea &&
          mapRef.current.getLayer(`polygon-${insertedPointArea}`)
        ) {
          //remove the previous area
          removeExistingArea(mapRef, insertedPointArea);
        }
        drawExistingArea(mapRef, [
          ...coordinates,
          { lon: parsedLon, lat: parsedLat },
        ]);
      }
      // Add the new coordinate to the list
      setCoordinates([...coordinates, [parsedLon, parsedLat]]);

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
  mapRef: PropTypes.object.isRequired,
};

export default ManualGeoreference;
