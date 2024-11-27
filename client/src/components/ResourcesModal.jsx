import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import PropTypes from 'prop-types';

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
      setFiles([...files, ...e.dataTransfer.files[0]]); // Handle the first dropped file
      e.dataTransfer.clearData();
    }
  };
  // Handle file addition
  const handleFileChange = e => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  // Handle file removal
  /*const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };*/

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
        <Modal.Title>Add Resource</Modal.Title>
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
          <label htmlFor="fileInput" className="btn btn-outline-primary mt-2">
            Browse File
          </label>
        </div>

        {/* Uploaded Files List 
                <div className="uploaded-files">
                    {files.map((file, index) => (
                        <Card className="mb-2 d-flex align-items-center p-2" key={index}>
                            <Row className="w-100">
                                <Col xs={1} className="d-flex align-items-center">
                                    <i className="bi bi-file-earmark fs-3"></i>
                                </Col>
                                <Col xs={9} className="d-flex align-items-center">
                                    <span>{file.name}</span>
                                </Col>
                                <Col xs={2} className="text-end">
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleRemoveFile(index)}
                                    >
                                        <i className="bi bi-x"></i>
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </div>*/}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
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
