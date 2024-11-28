import PropTypes from 'prop-types';

import { getIconByType } from '../../../utils/map';
import '../MapView.css';
import legendIcon from '/icons/map_icons/legendIcon.svg';

export const Legend = ({ isLegendVisible, docTypes, toggleLegend }) => {
  return (
    <div>
      <button className="legend-button" onClick={toggleLegend}>
        <img src={legendIcon} alt="Legend of Docs" />
      </button>

      {/* The test commit is actually the legend + the map style commit */}
      {isLegendVisible && docTypes ? (
        <div className={`legend-container ${isLegendVisible ? 'visible' : ''}`}>
          <h3 style={{ textAlign: 'center', marginTop: 15 }}>Legend</h3>
          <ul style={{ listStyle: 'none' }}>
            {docTypes.map(type => (
              <li
                key={type.type_name}
                style={{
                  marginTop: 18,
                  marginBottom: 10,
                  fontWeight: 'bold',
                }}
              >
                <img src={getIconByType(type.type_name)} alt={type.type_name} />
                {type.type_name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

Legend.propTypes = {
  isLegendVisible: PropTypes.bool.isRequired,
  docTypes: PropTypes.array.isRequired,
  toggleLegend: PropTypes.func.isRequired,
};
