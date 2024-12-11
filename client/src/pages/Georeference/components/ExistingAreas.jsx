import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../../contexts/FeedbackContext.js';
import '../../../index.css';
import API from '../../../services/API.js';
import {
  drawExistingArea,
  drawExistingPointMarker,
  getKirunaCenter,
  removeExistingArea,
  removeExistingPointMarker,
} from '../../../utils/map.js';
import '../Georeference.css';

function ExistingAreas({
  mapRef,
  setCoordinates,
  pageController,
  setPageController,
  mode,
  setMode,
  setAreaName,
}) {
  const { showToast } = useFeedbackContext();
  const [currentMarker, setCurrentMarker] = useState(null);
  const [areasPoints, setAreasPoints] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const resetMapView = bounds => {
    // Check if bounds is point points
    if (typeof bounds === 'object' && !Array.isArray(bounds)) {
      let zoom = 15;
      let center = [];
      const kirunaCenter = getKirunaCenter();

      // Check if the point is center of Kiruna
      if (bounds.lat === kirunaCenter.lat && bounds.lon === kirunaCenter.lon) {
        zoom = 13;
        center = [kirunaCenter.lon, kirunaCenter.lat];
      } else {
        center = [bounds.lng, bounds.lat];
      }
      mapRef.current.flyTo({
        center: center,
        zoom: zoom,
        pitch: 0, // Resets the camera pitch angle (tilt) to 0
        bearing: 0, // Resets the camera rotation (bearing) to north (0)
        essential: true,
        duration: 1000, // Animation duration in milliseconds
      });
    } else {
      try {
        const options = {
          padding: 50, // Add padding around the bounds
          maxZoom: 18, // Set a maximum zoom level
          duration: 1000, // Animation duration in milliseconds
        };
        mapRef.current.fitBounds(bounds, options);
      } catch (error) {
        console.error('Error resetting map view:', error);
      }
    }
  };

  const handlePointSelect = row => {
    //remove the previous marker
    if (currentMarker) {
      removeExistingPointMarker(currentMarker);
    }

    setCoordinates(row.coordinates.map(point => [point.lon, point.lat]));
    console.log(row);
    setSelectedRow(row);
    const marker = drawExistingPointMarker(mapRef, [
      row.coordinates[0].lon,
      row.coordinates[0].lat,
    ]);
    setCurrentMarker(marker);
  };
  const handleAreaSelect = row => {
    if (
      selectedRow &&
      mapRef.current.getLayer(`polygon-${selectedRow.id_area}`)
    ) {
      removeExistingArea(mapRef, selectedRow.id_area);
    }
    resetMapView(row.coordinates);
    drawExistingArea(mapRef, row);
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
    if (!mode && selectedRow) {
      if (selectedRow.coordinates.length > 1) {
        removeExistingArea(mapRef, selectedRow.id_area);
      } else {
        removeExistingPointMarker(currentMarker);
        setCurrentMarker(null);
      }
      setSelectedRow(null); // Pulizia automatica
    }
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
