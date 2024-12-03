import PropTypes from 'prop-types';

import Navbar from '../pages/Navbar/Navbar.jsx';

export const LayoutWithNavbar = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

LayoutWithNavbar.propTypes = {
  children: PropTypes.node.isRequired,
};
