import { useEffect, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { CustomCarousel } from '../../components/addDocument/CustomCarousel.jsx';
import './AddDocumentSidePanel.css';
import './AddDocumentSidePanel.css';

export const AddDocumentSidePanel = ({
  setDocumentInfoToAdd,
  documentInfoToAdd,
  show,
  openLinksModal,
}) => {
  const [isDocumentSubmitted, setIsDocumentSubmitted] = useState(false);
  const [docId, setDocId] = useState(null);
  const navigate = useNavigate();

  const handleDocumentSubmit = docId => {
    setIsDocumentSubmitted(true);
    setDocId(docId);
  };

  // Reset the state when the modal is closed
  useEffect(() => {
    if (!show) {
      setDocumentInfoToAdd('stakeholders', []);
      setIsDocumentSubmitted(false);
      setDocId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <Modal show={show} backdrop={false} dialogClassName="modal-add-document">
      <Modal.Header className="justify-content-start">
        <div className="document-title">Add Document</div>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {!isDocumentSubmitted ? (
            <CustomCarousel
              setDocumentInfoToAdd={setDocumentInfoToAdd}
              documentInfoToAdd={documentInfoToAdd}
              handleDocumentSubmit={handleDocumentSubmit}
            />
          ) : (
            <div>
              <h3>Document uploaded.</h3>
              <p>Do you want to add links to the document?</p>
              <Row>
                <Col md="6">
                  <Button onClick={() => openLinksModal(docId)}>Yes</Button>
                </Col>
                <Col>
                  <Button
                    variant="cancel"
                    onClick={() =>
                      navigate('/mapView', {
                        state: {
                          isAddingDocument: false,
                          timestamp: Date.now(),
                          showAddDocumentSidePanel: false,
                        },
                      })
                    }
                  >
                    No
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

AddDocumentSidePanel.propTypes = {
  setDocumentInfoToAdd: PropTypes.func.isRequired,
  documentInfoToAdd: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  openLinksModal: PropTypes.func.isRequired,
};
