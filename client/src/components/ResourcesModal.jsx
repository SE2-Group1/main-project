import { useState } from 'react';
import { Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { FaFilePdf } from 'react-icons/fa6';
import { FaFileWord } from 'react-icons/fa6';
import { FaFileImage } from 'react-icons/fa6';

import PropTypes from 'prop-types';

import { Button } from '../components/Button';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import API from '../services/API';

export const ResourcesModal = ({ mode, show, onHide, docId }) => {
  const { showToast } = useFeedbackContext();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);

  // Handle drag events
  const handleDragOver = e => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log(e.dataTransfer);
      setFiles([...files, e.dataTransfer.files[0]]); // Handle the first dropped file
      e.dataTransfer.clearData();
    }
  };
  // Handle file addition
  const handleFileChange = e => {
    const newFiles = Array.from(e.target.files);
    console.log(e.target);
    setFiles([...files, ...newFiles]);
  };

  // Handle file removal
  const handleRemoveFile = index => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      await API.uploadResources(docId, files);
      showToast('Resources Uploaded', 'success');
      onHide();
    } catch (err) {
      console.error(err);
      showToast('Failed to upload Resources. Try again.', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title className="document-title">
          {mode === 'edit' ? 'Edit Resources' : 'Add Resources'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: '40vh' }}>
        {/* Drag & Drop Area */}
        <div
          className={`upload-area d-flex flex-column justify-content-center align-items-center text-center p-4 border rounded ${dragging ? 'bg-light' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ minHeight: '40vh' }}
        >
          <p className="mb-1">
            <i className="bi bi-file-earmark-plus fs-2"></i>
          </p>
          <p>
            {dragging
              ? 'Drop your file here'
              : 'Drag & Drop or Click to Upload'}
          </p>
          <Form.Control
            type="file"
            accept=".pdf,.docx,.png,.PNG"
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hidden input for click-to-upload
            id="fileInput"
          />
          <div className="d-flex justify-content-center">
            <Button
              variant="primary"
              onClick={() => document.getElementById('fileInput').click()}
            >
              Browse Files
            </Button>
          </div>
        </div>

        <div
          className="uploaded-files"
          style={{ overflow: 'auto', overflowX: 'hidden' }}
        >
          {files &&
            files.map((file, index) => (
              <Card className="mb-2 p-2 mt-3 linked-docs-title" key={index}>
                <Row className="align-items-center">
                  {/* File Icon */}
                  <Col xs="auto" className="d-flex justify-content-start">
                    {file.name.endsWith('.pdf') && (
                      <FaFilePdf size={24} color="#ff2525" />
                    )}
                    {file.name.endsWith('.docx') && (
                      <FaFileWord size={24} color="#258bff" />
                    )}
                    {file.name.endsWith('.png') && (
                      <FaFileImage size={24} color="#eab543" />
                    )}
                    {file.name.endsWith('.PNG') && (
                      <FaFileImage size={24} color="#eab543" />
                    )}
                  </Col>

                  {/* File Name */}
                  <Col className="d-flex justify-content-start">
                    <span className="text-truncate">{file.name}</span>
                  </Col>

                  {/* Remove Button */}
                  <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                      variant="cancel"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      X
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="cancel" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ResourcesModal.propTypes = {
  mode: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  docId: PropTypes.number.isRequired,
};
