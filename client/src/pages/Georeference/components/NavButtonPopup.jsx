import { Container, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import '../Georeference.css';

const NavButtonPopup = ({ icon, onclick, text, style }) => {
  return (
    <Container className="NavButtonPopup" onClick={onclick} style={style}>
      <Row>
        <img
          src={icon}
          alt="icon"
          style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
        />
      </Row>
      <Row
        style={{
          textAlign: 'center',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          maxWidth: '100%',
        }}
      >
        {text}
      </Row>
    </Container>
  );
};
NavButtonPopup.propTypes = {
  icon: PropTypes.string,
  onclick: PropTypes.func,
  text: PropTypes.string.isRequired,
  style: PropTypes.object,
};

export default NavButtonPopup;
