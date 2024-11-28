import PropTypes from 'prop-types';

import {
  getKirunaCenter,
  satelliteMapStyle,
  streetMapStyle,
} from '../../../utils/map';
import layersIcon from '/icons/map_icons/layersIcon.svg';
import resetView from '/icons/map_icons/resetView.svg';

export const CustomControlButtons = ({ setMapStyle, resetMapView }) => {
  const handleMapStyle = () => {
    setMapStyle(prev => {
      if (prev === streetMapStyle) {
        return satelliteMapStyle;
      }
      return streetMapStyle;
    });
  };

  return (
    <div className="double-button-container">
      <button
        className="double-button"
        onClick={() => resetMapView(getKirunaCenter())}
      >
        <img src={resetView} alt="Reset Map" />
      </button>
      <button className="double-button" onClick={handleMapStyle}>
        <img src={layersIcon} alt="Change Map Style" />
      </button>
    </div>
  );
};

CustomControlButtons.propTypes = {
  setMapStyle: PropTypes.func.isRequired,
  resetMapView: PropTypes.func.isRequired,
};
