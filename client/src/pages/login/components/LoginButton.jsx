import PropTypes from 'prop-types';

import { CtaButton } from '../../../components/CtaButton.jsx';

export const LoginButton = ({ submit }) => {
  return (
    <CtaButton onClick={submit} variant="primary" className="w-100">
      Login
    </CtaButton>
  );
};

LoginButton.propTypes = {
  submit: PropTypes.func,
  type: PropTypes.string,
};
