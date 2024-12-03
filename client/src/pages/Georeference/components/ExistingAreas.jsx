import { useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import '../../../index.css';
import {
  drawExistingArea,
  drawExistingPointMarker,
  removeExistingPointMarker,
} from '../../../utils/map.js';
import '../Georeference.css';

function ExistingAreas({
  coordinates,
  handleCheckboxChange,
  showAddDocumentSidePanel,
  mapRef,
  setCoordinates,
}) {
  //  const { showToast } = useFeedbackContext();
  const [mode, setMode] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);
  const areas = [
    {
      id: 4,
      name: 'area1',
      georeference: [
        {
          lat: 20.267833773,
          lon: 67.864725351,
        },
        {
          lat: 20.302595201,
          lon: 67.851688469,
        },
        {
          lat: 20.248178545,
          lon: 67.850911848,
        },
        {
          lat: 20.236419741,
          lon: 67.859000373,
        },
        {
          lat: 20.267833773,
          lon: 67.864725351,
        },
      ],
    },
    {
      id: 58, // Cambiato id per evitare duplicati
      georeference: [{ lon: 67.862833353, lat: 20.273284021 }],
    },
    {
      id: 47, // Cambiato id per evitare duplicati
      georeference: [{ lon: 67.860519, lat: 20.304311 }],
    },
  ];

  console.log(areas);

  /*  useEffect(() => {
    const fetchAreasPoints = async () => {
      try {
      } catch (err) {
        console.warn(err);
        showToast('Failed to fetch area', 'error');
      }
    };
  }, []);*/
  //momentaneous this is must passed from georeference
  const [, setSelectedGeoreference] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const handlePointSelect = row => {
    //remove the previous marker
    if (currentMarker) {
      removeExistingPointMarker(currentMarker);
    }
    setCoordinates(row.georeference.map(point => [point.lon, point.lat]));
    console.log(row);
    setSelectedRowId(row.id);
    setSelectedGeoreference(row);
    const marker = drawExistingPointMarker(mapRef, [
      row.georeference[0].lat,
      row.georeference[0].lon,
    ]);
    setCurrentMarker(marker);
  };

  const handleAreaSelect = row => {
    drawExistingArea(mapRef, row);
    setSelectedRowId(row.id);
    setSelectedGeoreference(row);
    const georeference = row.georeference.map(el => [el.lon, el.lat]);
    setCoordinates(georeference);
  };
  return (
    <>
      {/*<Container
        style={{
          width: '300px',
          border: '1px solid #ddd',
          padding: '15px',
          borderRadius: '8px',
        }}
      >
        <div className="form-check mt-2">
        <input
          type="checkbox"
          className="form-check-input"
          id="confirm-georeference"
          onChange={handleCheckboxChange}
          disabled={coordinates.length > 0 || showAddDocumentSidePanel}
        />
        <label className="form-check-label" htmlFor="confirm-georeference">
          Municipality Area.
        </label>
      </div>

      </Container>
      <Container style={{
        width: '300px',
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '8px',
      }}>
        View Existig
      </Container>*/}
      {!mode && (
        <Container>
          <Row>
            <Button variant="link" onClick={() => setMode('area')}>
              {' '}
              View Existing Areas
            </Button>
          </Row>
          <Row>
            <Button variant="link" onClick={() => setMode('point')}>
              View Existing Points
            </Button>
          </Row>
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
      {mode === 'area' && (
        <Container>
          {areas
            .filter(el => 'name' in el)
            .map(el => (
              <Row
                key={el.id}
                className="pt-2 pb-2 clickable-row"
                onClick={() => handleAreaSelect(el)}
                style={{
                  backgroundColor:
                    el.id === selectedRowId
                      ? 'var(--color-secondary-200, #EDE4E1)'
                      : 'transparent',
                }}
              >
                <Col className="align-content-center">Area{el.name}</Col>
              </Row>
            ))}
        </Container>
      )}
      {mode === 'point' && (
        <Container>
          {areas
            .filter(el => !('name' in el))
            .map(el => (
              <>
                <Row
                  key={el.id}
                  className="pt-2 pb-2 clickable-row"
                  onClick={() => handlePointSelect(el)}
                  style={{
                    backgroundColor:
                      el.id === selectedRowId
                        ? 'var(--color-secondary-200, #EDE4E1)'
                        : 'transparent',
                  }}
                >
                  <Col className="align-content-center">Point{el.id}</Col>
                  <Col>
                    <Row>lon: {el.georeference[0].lon}</Row>
                    <Row>lat: {el.georeference[0].lat}</Row>
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
};

export default ExistingAreas;
