import { useState } from 'react';
import { Card, Col, Form, Modal, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../components/Button';

export const ResourcesModal = ({ mode, show, onHide, docId }) => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);

  console.log('docId:', docId);
  console.log('mode:', mode);

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

  const handleSubmit = () => {
    console.log('Submitting files:', files);
    /*if (files.length > 0) {
            handleSave(files); // Use your save logic here
            setFiles([]);
            onHide();
        }*/
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title className="document-title">
          {mode === 'edit' ? 'Edit Resources' : 'Add Resources'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Drag & Drop Area */}
        <div
          className={`upload-area text-center p-4 border rounded ${dragging ? 'bg-light' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
          <label
            htmlFor="fileInput"
            className="btn btn-outline-primary mt-2 linked-docs-title"
          >
            Browse File
          </label>
        </div>

        <div className="uploaded-files">
          {files &&
            files.map((file, index) => (
              <Card className="mb-2 p-2 mt-3 linked-docs-title" key={index}>
                <Row className="align-items-center">
                  {/* File Icon */}
                  <Col xs="auto" className="d-flex justify-content-start">
                    <i className="bi bi-file-earmark fs-3"></i>
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
