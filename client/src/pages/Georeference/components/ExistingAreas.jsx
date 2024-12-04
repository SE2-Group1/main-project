import { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../../contexts/FeedbackContext.js';
import '../../../index.css';
import API from '../../../services/API.js';
import {
  drawExistingArea,
  drawExistingPointMarker,
  removeExistingArea,
  removeExistingPointMarker,
} from '../../../utils/map.js';
import '../Georeference.css';

function ExistingAreas({
  coordinates,
  handleCheckboxChange,
  showAddDocumentSidePanel,
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

  const handlePointSelect = row => {
    //remove the previous marker
    if (currentMarker) {
      removeExistingPointMarker(currentMarker);
    }

    setCoordinates(row.coordinates.map(point => [point.lon, point.lat]));
    console.log(row);
    setSelectedRow(row);
    const marker = drawExistingPointMarker(mapRef, [
      row.coordinates[0].lat,
      row.coordinates[0].lon,
    ]);
    setCurrentMarker(marker);
  };
  const handleAreaSelect = row => {
    if (selectedRow && mapRef.current.getLayer(`polygon-${selectedRow.id}`)) {
      removeExistingArea(mapRef, selectedRow.id);
    }
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
        removeExistingArea(mapRef, selectedRow.id);
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
          <Row>
            <Button
              variant="link"
              onClick={() => {
                setMode('area');
                setPageController(prev => prev + 1);
              }}
            >
              {' '}
              View Existing Areas
            </Button>
          </Row>
          <Row>
            <Button
              variant="link"
              onClick={() => {
                setMode('point');
                setPageController(prev => prev + 1);
              }}
            >
              View Existing Points
            </Button>
          </Row>
          <hr />
          <Row>Or Select</Row>
          <Row>
            {!mode && (
              <div className="form-check mt-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="confirm-georeference"
                  onChange={handleCheckboxChange}
                  disabled={coordinates.length > 0 || showAddDocumentSidePanel}
                />
                <label
                  className="form-check-label"
                  htmlFor="confirm-georeference"
                >
                  Municipality Area.
                </label>
              </div>
            )}
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
            .filter(el => el.name_area === '')
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
                    <Row>lon: {el.coordinates[0].lon}</Row>
                    <Row>lat: {el.coordinates[0].lat}</Row>
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
  handleCheckboxChange: PropTypes.func.isRequired, // this is for municipality checkbox
  coordinates: PropTypes.array.isRequired,
  showAddDocumentSidePanel: PropTypes.bool.isRequired,
  mapRef: PropTypes.object,
  setCoordinates: PropTypes.func.isRequired,
  pageController: PropTypes.number.isRequired,
  setPageController: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  setAreaName: PropTypes.func.isRequired,
};

export default ExistingAreas;
