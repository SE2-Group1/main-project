import { Button } from 'react-bootstrap';

import PropTypes from 'prop-types';

export const CtaButton = ({ children, onClick, disabled, ...rest }) => {
  return (
    <Button
      onClick={onClick}
      className={`py-2 m-0 cta-btn ${disabled ? 'disabled' : ''}`}
      {...rest}
    >
      {children}
    </Button>
  );
};

CtaButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
