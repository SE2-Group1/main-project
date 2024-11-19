import { Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { CustomCarousel } from '../../components/addDocument/CustomCarousel.jsx';
import './AddDocumentSidePanel.css';
import './AddDocumentSidePanel.css';

export const AddDocumentSidePanel = ({
  setDocumentInfoToAdd,
  documentInfoToAdd,
}) => {
  return (
    <Row className="d-flex ms-1">
      <Col className="add-document-side-panel">
        <Row>
          <p className="title-form-addDocument">Add Document</p>
        </Row>
        <Row>
          <CustomCarousel
            setDocumentInfoToAdd={setDocumentInfoToAdd}
            documentInfoToAdd={documentInfoToAdd}
          />
        </Row>
      </Col>
    </Row>
  );
};

AddDocumentSidePanel.propTypes = {
  setDocumentInfoToAdd: PropTypes.func.isRequired,
  documentInfoToAdd: PropTypes.object.isRequired,
};
