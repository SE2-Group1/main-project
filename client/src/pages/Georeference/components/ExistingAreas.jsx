import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../../contexts/FeedbackContext.js';
import '../../../index.css';
import API from '../../../services/API.js';
import '../Georeference.css';

function ExistingAreas({ setCoordinates, mode, setAreaName }) {
  const { showToast } = useFeedbackContext();
  const [areasPoints, setAreasPoints] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const handlePointSelect = row => {
    setCoordinates({
      idArea: row.id_area,
      coordinates: row.coordinates.map(point => [point.lon, point.lat]),
    });
    setSelectedRow(row);
  };
  const handleAreaSelect = row => {
    const georeference =
      row.id_area === 1
        ? row.coordinates
        : row.coordinates.map(el => [el.lon, el.lat]);
    setCoordinates({ idArea: row.id_area, coordinates: georeference });
    setSelectedRow(row);
    setAreaName(row.name_area);
  };
  useEffect(() => {
    const fetchAreasPoints = async () => {
      try {
        const georeference = await API.getAreasAndPoints();
        setAreasPoints(georeference);
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
      {mode !== 'point' && (
        <Container>
          {areasPoints
            .filter(el => el.coordinates.length > 1)
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
                  <Col className="align-content-center">{el.name_area}</Col>
                </Row>
                <hr style={{ color: 'white', margin: '0px' }} />
              </>
            ))}
        </Container>
      )}
      {mode === 'point' && (
        <Container>
          {areasPoints
            .filter(el => el.coordinates.length === 1)
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
  setCoordinates: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  setAreaName: PropTypes.func.isRequired,
};

export default ExistingAreas;
