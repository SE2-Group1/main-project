import { Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import addDocumentIcon from '/icons/addDocumentIcon.svg';
import searchDocumentIcon from '/icons/searchDocumentIcon.svg';
import viewAreaIcon from '/icons/viewAreaIcon.svg';
import viewDiagramIcon from '/icons/viewDiagramIcon.svg';
import viewDocumentsIcon from '/icons/viewDocumentsIcon.svg';
import viewMapIcon from '/icons/viewMapIcon.svg';

export const NavComponent = ({ name, icon, onclick }) => {
  const iconMap = {
    viewDocumentIcon: viewDocumentsIcon,
    addDocumentIcon: addDocumentIcon,
    viewAreaIcon: viewAreaIcon,
    viewMapIcon: viewMapIcon,
    searchDocumentIcon: searchDocumentIcon,
    viewDiagramIcon: viewDiagramIcon,
  };

  const assignedIcon = iconMap[icon] || viewMapIcon;

  return (
    <Row
      className="align-items-center gx-1 mb-2 my-4 navComponentRow"
      onClick={onclick}
      style={{ cursor: 'pointer' }} // Add pointer cursor
    >
      <Col xs="auto" className="d-flex align-items-center p-0">
        <img
          src={assignedIcon}
          alt={`${name} icon`}
          style={{ width: '20px', height: '20px' }}
        />
      </Col>
      <Col xs="auto" className="d-flex align-items-center p-0">
        <p className="mb-0">{name}</p>
      </Col>
    </Row>
  );
};

NavComponent.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  onclick: PropTypes.func,
};
