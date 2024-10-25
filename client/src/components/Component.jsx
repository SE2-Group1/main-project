import PropTypes from 'prop-types';

// Example of a React component with PropTypes
// If props are not used, it won't throw an error
// If props are used but not defined, it will throw an error

export const Component = ({ prop }) => {
  return (
    <div>
      {prop}
      <h1>Test Component</h1>
    </div>
  );
};

Component.propTypes = {
  prop: PropTypes.number.isRequired,
};
