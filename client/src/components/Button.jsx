import { Button as BButton } from 'react-bootstrap';

import PropTypes from 'prop-types';

export const Button = ({
  children,
  onClick,
  disabled,
  variant,
  className,
  ...rest
}) => {
  return (
    <BButton
      onClick={onClick}
      className={`py-2 m-0 custom-btn ${variant ? variant : 'primary'} ${disabled ? 'disabled' : ''} ${className}`}
      {...rest}
    >
      {children}
    </BButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'cancel']),
  className: PropTypes.string,
};
