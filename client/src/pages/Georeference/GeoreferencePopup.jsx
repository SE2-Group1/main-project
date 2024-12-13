import { useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { InputText } from '../../components/InputText.jsx';
import {
  drawExistingArea,
  drawExistingPointMarker,
  fromArrayToGeoObject,
  getKirunaCenter,
  removeExistingArea,
  removeExistingPointMarker,
  resetMapView,
} from '../../utils/map.js';
import './Georeference.css';
import ExistingAreas from './components/ExistingAreas.jsx';
import ManualGeoreference from './components/ManualGeoreference.jsx';
import TrashIcon from '/icons/trashIcon.svg';

function GeoreferencePopup({
  showAddDocumentSidePanel,
  handleSaveCoordinates,
  handleCancelAddDocument,
  coordinates,
  setCoordinates,
  areaName,
  setAreaName,
  setGeoMode,
  mapRef,
  geoMode,
}) {
  const [pageController, setPageController] = useState(0);
  const [mode, setMode] = useState(null);
  const cancelButtonTitle = geoMode === '' ? 'Cancel' : 'Back';
  const prevCoordinatesRef = useRef([]);
  const [modalTitle, setModalTitle] = useState('Georeference');
  const [marker, setMarker] = useState(null);
  const navigatePopUpBack = () => {
    if (pageController === 0) {
      handleCancelAddDocument();
    } else if (
      (geoMode === 'manual' || geoMode === 'existings') &&
      pageController === 1
    ) {
      setGeoMode('');
      setModalTitle('Georeference');
      setPageController(prev => prev - 1);
    } else if (pageController === 2) {
      setMode(null);
      setPageController(prev => prev - 1);
    } else if (pageController > 0) {
      setPageController(prev => prev - 1);
    }
    setCoordinates([]);
    setAreaName('');
    resetMapView(
      [{ lon: getKirunaCenter().lon, lat: getKirunaCenter().lat }],
      mapRef,
    );
  };
  const deleteManualCoordinate = indexToRemove => {
    setCoordinates(prevCoordinates =>
      prevCoordinates.filter((_, index) => index !== indexToRemove),
    );
  };

  useEffect(() => {
    const prevCoordinatesLength = prevCoordinatesRef.current.length;

    //avoid to draw the area again
    if (geoMode === 'onMap') return;

    if (!mapRef.current) return;
    if (
      prevCoordinatesLength > 1 &&
      mapRef.current.getLayer(`polygon-${prevCoordinatesLength}`)
    ) {
      removeExistingArea(mapRef, prevCoordinatesLength);
    } else if (prevCoordinatesLength === 1 && marker) {
      //delete the previous marker
      removeExistingPointMarker(marker);
    }

    if (coordinates.length === 1) {
      const marker = drawExistingPointMarker(mapRef, coordinates[0]);
      setMarker(marker);
    } else if (coordinates.length > 1) {
      geoMode === 'manual'
        ? drawExistingArea(mapRef, coordinates)
        : drawExistingArea(mapRef, coordinates);
    }
    if (coordinates.length > 0)
      resetMapView(fromArrayToGeoObject(coordinates), mapRef);
    prevCoordinatesRef.current = coordinates;
  }, [coordinates, mapRef]);

  return (
    <div id="georeferencePanel" className="georeference-panel">
      {/* Header */}
      <div className="header">
        <button
          className="close-button-geo"
          onClick={handleCancelAddDocument}
          aria-label="Close Georeference Popup"
        >
          ×
        </button>
        <h2 className="left-sided-panel-title">{modalTitle}</h2>
      </div>

      {/* Content */}
      <div className="content">
        {(geoMode === '' || geoMode === 'onMap') && (
          <>
            <p>
              <strong>How do you want to georeference:</strong>
            </p>
            <div className="form-check mt-2">
              <input
                type="radio"
                className="form-check-input"
                name="georeference"
                id="existings-option"
                value="existings"
                checked={geoMode === 'existings'}
                onChange={() => {
                  setModalTitle('Existings areas/points');
                  setGeoMode('existings');
                  setPageController(prev => prev + 1);
                }}
                disabled={coordinates.length > 0 || showAddDocumentSidePanel}
              />
              <label className="form-check-label" htmlFor="existings-option">
                Select among existing areas.
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                type="radio"
                className="form-check-input"
                name="georeference"
                id="manual-option"
                value="manual"
                checked={geoMode === 'manual'}
                onChange={() => {
                  setGeoMode('manual');
                  setModalTitle('Manual input');
                  setPageController(prev => prev + 1);
                }}
                disabled={coordinates.length > 0 || showAddDocumentSidePanel}
              />
              <label className="form-check-label" htmlFor="manual-option">
                Georeference manually.
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                type="radio"
                className="form-check-input"
                name="georeference"
                id="on-map-option"
                value="onMap"
                checked={geoMode === 'onMap'}
                onChange={() => setGeoMode('onMap')}
                disabled={coordinates.length > 0 || showAddDocumentSidePanel}
              />
              <label className="form-check-label" htmlFor="on-map-option">
                Select/draw the area on the map.
              </label>
            </div>
            {geoMode === 'onMap' && (
              <div>
                <p>
                  <hr />
                  Use the top right buttons to select a point or draw an area on
                  the map.
                </p>
              </div>
            )}
          </>
        )}
        {(geoMode === 'manual' || geoMode === 'existings') && (
          <div>
            {geoMode === 'manual' && pageController > 0 && (
              <ManualGeoreference
                setCoordinates={setCoordinates}
                coordinates={coordinates}
              />
            )}
            {geoMode === 'existings' && pageController > 0 && (
              <ExistingAreas
                mapRef={mapRef}
                setCoordinates={setCoordinates}
                pageController={pageController}
                setPageController={setPageController}
                mode={mode}
                setMode={setMode}
                setAreaName={setAreaName}
              />
            )}
          </div>
        )}
        {/* Display the list of coordinates  */}
        {(geoMode === 'manual' || geoMode === 'onMap') &&
          coordinates.length > 0 &&
          coordinates.length > 0 && (
            <Container>
              <Row className="mb-2 mt-2">Coordinates:</Row>
              {coordinates.map(([lon, lat], index) => {
                const key = `${lat}-${lon}`;
                return (
                  <Row key={key}>
                    <Col md={10}>{`lon: ${lon}, lat: ${lat}`}</Col>
                    {geoMode === 'manual' && (
                      <Col md={1}>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => deleteManualCoordinate(index)}
                          aria-label={`Delete coordinate ${index}`}
                        >
                          <img src={TrashIcon} alt="Delete" />
                        </button>
                      </Col>
                    )}
                  </Row>
                );
              })}
            </Container>
          )}
        {pageController <= 1 && coordinates.length > 2 && (
          <AreaNameForm
            name={areaName}
            setName={setAreaName}
            disabled={showAddDocumentSidePanel}
          />
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <FinalButtons
          saveButtonDisable={!areaName && coordinates.length > 1}
          handleSaveButton={handleSaveCoordinates}
          navigatePopUpBack={navigatePopUpBack}
          showAddDocumentSidePanel={showAddDocumentSidePanel}
          cancelButtonTitle={cancelButtonTitle}
        />
      </div>
    </div>
  );
}

GeoreferencePopup.propTypes = {
  showAddDocumentSidePanel: PropTypes.bool.isRequired,
  handleSaveCoordinates: PropTypes.func.isRequired,
  handleCancelAddDocument: PropTypes.func.isRequired,
  coordinates: PropTypes.array.isRequired,
  setCoordinates: PropTypes.func.isRequired,
  setGeoMode: PropTypes.func.isRequired,
  geoMode: PropTypes.string.isRequired,
  areaName: PropTypes.string.isRequired,
  setAreaName: PropTypes.func.isRequired,
  mapRef: PropTypes.object.isRequired,
};

export default GeoreferencePopup;

function FinalButtons({
  saveButtonDisable,
  handleSaveButton,
  navigatePopUpBack,
  showAddDocumentSidePanel,
  cancelButtonTitle,
}) {
  return (
    <>
      <Button
        variant="primary"
        className="mb-3"
        onClick={handleSaveButton}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          transform: 'translateX(-50%)',
        }}
        disabled={showAddDocumentSidePanel || saveButtonDisable}
      >
        Save
      </Button>
      <Button
        variant="cancel"
        className="mb-3"
        onClick={navigatePopUpBack}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 80,
          transform: 'translateX(-50%)',
        }}
      >
        {cancelButtonTitle}
      </Button>
    </>
  );
}

FinalButtons.propTypes = {
  handleSaveButton: PropTypes.func.isRequired,
  navigatePopUpBack: PropTypes.func.isRequired,
  showAddDocumentSidePanel: PropTypes.bool.isRequired,
  cancelButtonTitle: PropTypes.string.isRequired,
  saveButtonDisable: PropTypes.bool,
};

const AreaNameForm = ({ name, setName, disabled }) => {
  return (
    <Container>
      <Row>Add a name for the area chosen</Row>
      <InputText
        required
        style={{
          paddingTop: 0,
          marginTop: 0,
          height: '50px',
          borderRadius: '10px',
        }}
        placeholder="Add a name for the area"
        value={name}
        handleChange={e => {
          setName(e.target.value);
        }}
        disabled={disabled}
      />
    </Container>
  );
};

AreaNameForm.propTypes = {
  setName: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};
