import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../../contexts/FeedbackContext.js';
import '../../../index.css';
import API from '../../../services/API.js';
import '../Georeference.css';

function ExistingAreas({
  setCoordinates,
  pageController,
  setPageController,
  mode,
  setMode,
  setAreaName,
}) {
  const { showToast } = useFeedbackContext();
  const [areasPoints, setAreasPoints] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const handlePointSelect = row => {
    setCoordinates(row.coordinates.map(point => [point.lon, point.lat]));
    setSelectedRow(row);
  };
  const handleAreaSelect = row => {
    const georeference = row.coordinates.map(el => [el.lon, el.lat]);
    setCoordinates(georeference);
    setSelectedRow(row);
    setAreaName(row.name_area);
  };
  useEffect(() => {
    const fetchAreasPoints = async () => {
      try {
        const georeference = await API.getAreasAndPoints();
        setAreasPoints(georeference);
        //set
        console.log(georeference);
      } catch (err) {
        console.warn(err);
        showToast('Failed to fetch area', 'error');
      }
    };
    fetchAreasPoints();
  }, []);
  useEffect(() => {
    setSelectedRow(null); // Pulizia automatica
  }, [mode]);

  return (
    <>
      {!mode && pageController === 1 && (
        <Container>
          <Row className="mb-4 mt-2">
            <strong>Select an Area or Point:</strong>
          </Row>
          <Row>
            <Col className="mb-2" md={1}>
              <Form.Check
                type="radio"
                aria-label="radio 1"
                onClick={() => {
                  setMode('area');
                  setPageController(prev => prev + 1);
                }}
              />
            </Col>
            <Col>
              <label>View Existing Areas</label>
            </Col>
          </Row>
          <Row>
            <Col md={1}>
              <Form.Check
                type="radio"
                aria-label="radio 1"
                onClick={() => {
                  setMode('point');
                  setPageController(prev => prev + 1);
                }}
              />
            </Col>
            <Col>
              <label>View Existing Points</label>
            </Col>
          </Row>
        </Container>
      )}
      {mode === 'area' && pageController === 2 && (
        <Container>
          {areasPoints
            .filter(el => el.name_area !== '')
            .map(el => (
              <>
                <Row
                  key={el.id_area}
                  className="pt-2 pb-2 clickable-row"
                  onClick={() => handleAreaSelect(el)}
                  style={{
                    backgroundColor:
                      el.id_area === selectedRow?.id_area
                        ? 'var(--color-secondary-200, #EDE4E1)'
                        : 'transparent',
                  }}
                >
                  <Col className="align-content-center">Area{el.name_area}</Col>
                </Row>
                <hr style={{ color: 'white', margin: '0px' }} />
              </>
            ))}
        </Container>
      )}
      {mode === 'point' && pageController === 2 && (
        <Container>
          {areasPoints
            .filter(el => el.name_area === '' && el.name_area !== null)
            .map(el => (
              <>
                <Row
                  key={el.id_area}
                  className="pt-2 pb-2 clickable-row"
                  onClick={() => handlePointSelect(el)}
                  style={{
                    backgroundColor:
                      el.id_area === selectedRow?.id_area
                        ? 'var(--color-secondary-200, #EDE4E1)'
                        : 'transparent',
                  }}
                >
                  <Col className="align-content-center">Point{el.id}</Col>
                  <Col>
                    <Row>lat: {el.coordinates[0].lat}</Row>
                    <Row>lon: {el.coordinates[0].lon}</Row>
                  </Col>
                </Row>
                <hr style={{ color: 'white', margin: '0px' }} />
              </>
            ))}
        </Container>
      )}
    </>
  );
}
ExistingAreas.propTypes = {
  mapRef: PropTypes.object,
  setCoordinates: PropTypes.func.isRequired,
  pageController: PropTypes.number.isRequired,
  setPageController: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  setAreaName: PropTypes.func.isRequired,
};

export default ExistingAreas;
