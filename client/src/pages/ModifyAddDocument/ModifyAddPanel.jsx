import { useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { CarouselForm } from '../../components/addDocument/CustomCarousel.jsx';

export const ModifyAddPanel = ({ show }) => {
  const [isDocumentSubmitted] = useState(false);
  const navigate = useNavigate();
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
            <CarouselForm
              documentInfoToAdd={{}}
              setDocumentInfoToAdd={() => {}}
              handleDocumentSubmit={() => {}}
            />
          ) : (
            <div>
              <h3>Document uploaded.</h3>
              <p>Do you want to add links to the document?</p>
              <Row>
                <Col md="6">
                  <Button
                    onClick={() => {
                      //openLinksModal(docId)
                    }}
                  >
                    Yes
                  </Button>
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

ModifyAddPanel.propTypes = {
  show: PropTypes.bool.isRequired,
  openLinksModal: PropTypes.func.isRequired,
};
