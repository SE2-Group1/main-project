import PropTypes from 'prop-types';

import { NavigationButton } from '../../../components/NavigationButton.jsx';

export const LoginButton = ({ submit }) => {
  console.log(submit);
  return (
    <NavigationButton
      text={'Login'}
      action={submit}
      variant="add-button"
      style={{
        width: '100%',
        height: '20%',
        fontSize: '17px',
        marginTop: '60px',
      }}
    />
  );
};

LoginButton.propTypes = {
  submit: PropTypes.func,
  type: PropTypes.string,
};
