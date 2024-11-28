import { useEffect, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { CustomCarousel } from '../../components/addDocument/CustomCarousel.jsx';
import { useDocumentManagerContext } from '../MapView/contexts/DocumentManagerContext.js';
import './AddDocumentSidePanel.css';
import './AddDocumentSidePanel.css';

export const AddDocumentSidePanel = ({ show, openLinksModal }) => {
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
      <Modal.Body>
        <Row>
          {!isDocumentSubmitted ? (
            <CustomCarousel handleDocumentSubmit={handleDocumentSubmit} />
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

AddDocumentSidePanel.propTypes = {
  show: PropTypes.bool.isRequired,
  openLinksModal: PropTypes.func.isRequired,
};
