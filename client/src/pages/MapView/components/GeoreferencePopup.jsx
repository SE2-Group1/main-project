import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import '../MapView.css';

function GeoreferencePopup({
  handleCheckboxChange,
  showAddDocumentSidePanel,
  handleSaveCoordinates,
  handleCancelAddDocument,
  coordinates,
}) {
  return (
    <div className="calculation-box2 text-center">
      <p>
        <strong>Click the map to georeference the document</strong>
      </p>
      <div className="form-check mt-2">
        <input
          type="checkbox"
          className="form-check-input"
          id="confirm-georeference"
          onChange={handleCheckboxChange}
          disabled={coordinates.length > 0 || showAddDocumentSidePanel}
        />
        <label className="form-check-label" htmlFor="confirm-georeference">
          Use Municipality Area
        </label>
      </div>
      <Button
        variant="primary"
        className="mb-2"
        onClick={handleSaveCoordinates}
        style={{
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        Save
      </Button>
      <Button
        variant="cancel"
        onClick={handleCancelAddDocument}
        style={{
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        Cancel
      </Button>
    </div>
  );
}

GeoreferencePopup.propTypes = {
  handleCheckboxChange: PropTypes.func.isRequired,
  showAddDocumentSidePanel: PropTypes.bool.isRequired,
  handleSaveCoordinates: PropTypes.func.isRequired,
  handleCancelAddDocument: PropTypes.func.isRequired,
  coordinates: PropTypes.array.isRequired,
};

export default GeoreferencePopup;
