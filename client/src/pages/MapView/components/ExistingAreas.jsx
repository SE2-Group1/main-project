import { Container } from 'react-bootstrap';

import PropTypes from 'prop-types';

import '../MapView.css';

function ExistingAreas({
  coordinates,
  handleCheckboxChange,
  showAddDocumentSidePanel,
}) {
  return (
    <Container
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
  );
}

ExistingAreas.propTypes = {
  handleCheckboxChange: PropTypes.func.isRequired, // this is for municipality checkbox
  coordinates: PropTypes.array.isRequired,
  showAddDocumentSidePanel: PropTypes.bool.isRequired,
};

export default ExistingAreas;
