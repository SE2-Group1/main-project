import { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import '../../../index.css';
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
  //const { showToast } = useFeedbackContext();
  const [currentMarker, setCurrentMarker] = useState(null);
  //TODO add area points
  // const [, setAreasPoints] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const handlePointSelect = row => {
    //remove the previous marker
    if (currentMarker) {
      removeExistingPointMarker(currentMarker);
    }

    setCoordinates(row.georeference.map(point => [point.lon, point.lat]));
    console.log(row);
    setSelectedRow(row);
    const marker = drawExistingPointMarker(mapRef, [
      row.georeference[0].lat,
      row.georeference[0].lon,
    ]);
    setCurrentMarker(marker);
  };
  const handleAreaSelect = row => {
    if (selectedRow && mapRef.current.getLayer(`polygon-${selectedRow.id}`)) {
      console.log(mapRef.current.getLayer(`polygon-${selectedRow.id}`));
      removeExistingArea(mapRef, selectedRow.id);
    }
    drawExistingArea(mapRef, row);
    const georeference = row.georeference.map(el => [el.lon, el.lat]);
    setCoordinates(georeference);
    setSelectedRow(row);
    setAreaName(row.name);
  };
  /*
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
    }, []);*/
  useEffect(() => {
    if (!mode && selectedRow) {
      if (selectedRow.georeference.length > 1) {
        removeExistingArea(mapRef, selectedRow.id);
      } else {
        removeExistingPointMarker(currentMarker);
        setCurrentMarker(null);
      }
      setSelectedRow(null); // Pulizia automatica
    }
  }, [mode]);

  //TODO delete
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
      id: 5,
      name: 'area2',
      georeference: [
        {
          lat: 20.229209963,
          lon: 67.850652969,
        },
        {
          lat: 20.282167498,
          lon: 67.851429598,
        },
        {
          lat: 20.265859667,
          lon: 67.85993846,
        },
        {
          lat: 20.23264319,
          lon: 67.862073276,
        },
        {
          lat: 20.229209963,
          lon: 67.850652969,
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

  return (
    <>
      {console.log(pageController)}
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
          {areas
            .filter(el => 'name' in el)
            .map(el => (
              <Row
                key={el.id}
                className="pt-2 pb-2 clickable-row"
                onClick={() => handleAreaSelect(el)}
                style={{
                  backgroundColor:
                    el.id === selectedRow?.id
                      ? 'var(--color-secondary-200, #EDE4E1)'
                      : 'transparent',
                }}
              >
                <Col className="align-content-center">Area{el.name}</Col>
              </Row>
            ))}
        </Container>
      )}
      {mode === 'point' && pageController === 2 && (
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
                      el.id === selectedRow?.id
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
  pageController: PropTypes.number.isRequired,
  setPageController: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  setAreaName: PropTypes.func.isRequired,
};

export default ExistingAreas;
