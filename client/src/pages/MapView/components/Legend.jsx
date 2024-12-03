import PropTypes from 'prop-types';

import { Button } from '../../../components/Button';
import { getIconByType } from '../../../utils/map';
import '../MapView.css';
import legendIcon from '/icons/map_icons/legendIcon.svg';

export const Legend = ({ isLegendVisible, docTypes, toggleLegend }) => {
  // Function to scroll the legend horizontally
  const scrollLegend = direction => {
    const container = document.querySelector('.legend-list');
    const scrollAmount = direction === 'left' ? -150 : 150;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div>
      <button className="legend-button" onClick={toggleLegend}>
        <img src={legendIcon} alt="Legend of Docs" />
      </button>

      {isLegendVisible && docTypes ? (
        <div className={`legend-container ${isLegendVisible ? 'visible' : ''}`}>
          <div className="legend-wrapper">
            <Button
              className="pagination-btn ms-2 me-2"
              onClick={() => scrollLegend('left')}
              aria-label="Scroll Left"
            >
              &#8592;
            </Button>
            <ul className="legend-list">
              {docTypes.map(type => (
                <li key={type.type_name} className="legend-item">
                  <img
                    src={getIconByType(type.type_name)}
                    alt={type.type_name}
                    className="legend-icon"
                  />
                  <span>{type.type_name}</span>
                </li>
              ))}
            </ul>
            <Button
              className="pagination-btn ms-2 me-2"
              onClick={() => scrollLegend('right')}
              aria-label="Scroll Right"
            >
              &#8594;
            </Button>
          </div>
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
