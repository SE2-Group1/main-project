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
  openAttachmentsModal,
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
              <p>
                Do you want to add links, resources or attachments to the
                document?
              </p>
              <Row className="d-flex flex-column align-items-center">
                <Col className="d-flex gap-2 justify-content-center mb-3">
                  <Button
                    style={{
                      width: '28%', // Adjust for 5-column layout (100% / 5 = 20%, minus margins)
                      margin: '1%',
                    }}
                    onClick={() => openLinksModal(docId)}
                  >
                    Add Links
                  </Button>
                  <Button
                    style={{
                      width: '34%', // Adjust for 5-column layout (100% / 5 = 20%, minus margins)
                      margin: '1%',
                    }}
                    onClick={() => openResourcesModal(docId)}
                  >
                    Add Resources
                  </Button>
                  <Button
                    style={{
                      width: '38%', // Adjust for 5-column layout (100% / 5 = 20%, minus margins)
                      margin: '1%',
                    }}
                    onClick={() => openAttachmentsModal(docId)}
                  >
                    Add Attachments
                  </Button>
                </Col>
                <Col className="w-100">
                  <Button
                    variant="cancel"
                    className="w-100"
                    onClick={() => navigate(`/mapView/${docId}`)}
                  >
                    Close
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
  openAttachmentsModal: PropTypes.func,
};
