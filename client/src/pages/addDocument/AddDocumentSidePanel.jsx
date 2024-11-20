import { Modal, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { CustomCarousel } from '../../components/addDocument/CustomCarousel.jsx';
import './AddDocumentSidePanel.css';
import './AddDocumentSidePanel.css';

export const AddDocumentSidePanel = ({
  setDocumentInfoToAdd,
  documentInfoToAdd,
  show,
}) => {
  return (
    <Modal show={show} backdrop={false}>
      <Modal.Header className="justify-content-start">
        <div className="document-title">Add Document</div>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <CustomCarousel
            setDocumentInfoToAdd={setDocumentInfoToAdd}
            documentInfoToAdd={documentInfoToAdd}
          />
        </Row>
      </Modal.Body>
    </Modal>
  );
};

AddDocumentSidePanel.propTypes = {
  setDocumentInfoToAdd: PropTypes.func.isRequired,
  documentInfoToAdd: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
};
