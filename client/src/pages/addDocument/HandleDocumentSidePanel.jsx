import { useEffect, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { useDocumentManagerContext } from '../MapView/contexts/DocumentManagerContext.js';
import './AddDocumentSidePanel.css';
import './AddDocumentSidePanel.css';
import { CarouselForm } from './CarouselForm.jsx';

export const HandleDocumentSidePanel = ({
  openLinksModal,
  mode,
  closeHandlePanel,
  show,
}) => {
  const [isDocumentSubmitted, setIsDocumentSubmitted] = useState(false);
  const [docId, setDocId] = useState(null);
  const navigate = useNavigate();
  const { setDocumentData } = useDocumentManagerContext();

  const handleDocumentSubmit = docId => {
    setIsDocumentSubmitted(true);
    setDocId(docId);
  };

  // remove fields from documentInfoToAdd when modal is closed
  useEffect(() => {
    return () => {
      setDocumentData('stakeholders', []);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <Modal
      show={show}
      backdrop={false}
      dialogClassName="modal-add-document"
      className="modal-add-document"
    >
      <Modal.Header className="justify-content-start">
        <div className="document-title">Add Document</div>
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
                          mapMode: 'view',
                          docId: null,
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

HandleDocumentSidePanel.propTypes = {
  openLinksModal: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  closeHandlePanel: PropTypes.func,
  show: PropTypes.bool,
};
