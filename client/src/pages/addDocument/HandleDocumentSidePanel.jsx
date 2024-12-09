import { useEffect, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { useDocumentManagerContext } from '../MapView/contexts/DocumentManagerContext.js';
import './AddDocumentSidePanel.css';
import { CarouselForm } from './CarouselForm.jsx';

export const HandleDocumentSidePanel = ({
  openLinksModal,
  mode,
  closeHandlePanel,
  show,
  openResourcesModal,
}) => {
  const [isDocumentSubmitted, setIsDocumentSubmitted] = useState(false);
  const [docId, setDocId] = useState(null);
  const navigate = useNavigate();
  const { setDocumentData } = useDocumentManagerContext();

  const handleDocumentSubmit = docId => {
    setDocId(docId);
    setIsDocumentSubmitted(true);
  };

  // remove fields from documentInfoToAdd when modal is closed
  useEffect(() => {
    return () => {
      setDocumentData('stakeholders', []);
    };
    // eslint-disable-next-line
  }, []);

  if (!show) return null;

  return (
    <Modal
      show={show}
      backdrop={false}
      dialogClassName="modal-add-document"
      className="modal-add-document"
    >
      <Modal.Header className="justify-content-start">
        <div className="document-title">
          {mode === 'add' ? 'Add Document' : 'Edit Document'}
        </div>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <Row>
          {!isDocumentSubmitted ? (
            <CarouselForm
              handleDocumentSubmit={handleDocumentSubmit}
              mode={mode}
              closeHandlePanel={closeHandlePanel}
            />
          ) : (
            <div>
              <h3>Document uploaded</h3>
              <p>Do you want to add links or resources to the document?</p>
              <Row className="d-flex align-items-center justify-content-between">
                <Col md="auto">
                  <Button
                    variant="cancel"
                    onClick={() => navigate(`/mapView/${docId}`)}
                  >
                    Close
                  </Button>
                </Col>
                <Col md="auto" className="d-flex gap-2 justify-content-end">
                  <Button onClick={() => openLinksModal(docId)}>
                    Add Links
                  </Button>
                  <Button onClick={() => openResourcesModal(docId)}>
                    Add Resources
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

HandleDocumentSidePanel.propTypes = {
  openLinksModal: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  closeHandlePanel: PropTypes.func,
  show: PropTypes.bool,
  openResourcesModal: PropTypes.func,
};
