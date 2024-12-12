import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button';

export const OverlappingDocsModal = ({ isOpen, onHide }) => {
  const navigate = useNavigate();
  return (
    <Modal show={isOpen} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Overlapping Documents</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          There are overlapping documents on the map. Do you want to edit
          positions?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="cancel" onClick={onHide} className="me-3">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate('/diagramView/edit-positions')}
        >
          Edit Positions
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

OverlappingDocsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};
