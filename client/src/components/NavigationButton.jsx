import PropTypes from 'prop-types';

import './style.css';

// Example of a React component with PropTypes
// If props are not used, it won't throw an error
// If props are used but not defined, it will throw an error

export const NavigationButton = ({ text, action, variant, style }) => {
  return (
    <button className={`button ${variant}`} onClick={action} style={style}>
      {text}
    </button>
  );
};

NavigationButton.propTypes = {
  text: PropTypes.string.isRequired,
  action: PropTypes.func,
  variant: PropTypes.string.isRequired,
  style: PropTypes.object,
};
