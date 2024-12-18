import { useEffect, useState } from 'react';
import { Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { FaFileExcel, FaFilePdf, FaFileWord } from 'react-icons/fa6';

import PropTypes from 'prop-types';

import { Button } from '../components/Button';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import API from '../services/API';

export const ResourcesModal = ({ mode, show, onHide, docId }) => {
  const { showToast } = useFeedbackContext();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [oldFiles, setOldFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);

  useEffect(() => {
    if (show) {
      const fetchFiles = async () => {
        try {
          const resources = await API.getDocumentResources(docId);
          setOldFiles(resources);
          setAllFiles(resources);
        } catch (error) {
          console.warn('Error fetching resources:', error);
        }
      };
      fetchFiles();
    }
  }, [mode, show, docId]);

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
      const newFile = e.dataTransfer.files[0];

      // Check for duplicate file
      const isDuplicate = allFiles.some(file => file.name === newFile.name);
      if (isDuplicate) {
        showToast('This file has already been added.', 'warn');
      } else {
        setFiles([...files, newFile]);
        setAllFiles([...allFiles, newFile]);
      }

      e.dataTransfer.clearData();
    }
  };

  // Handle file addition
  const handleFileChange = e => {
    const newFile = e.target.files[0]; // Get the first file only

    if (!newFile) return; // If no file was selected, exit the function

    // Check for duplicates
    const isDuplicate = allFiles.some(file => file.name === newFile.name);

    if (isDuplicate) {
      showToast('This file has already been added.', 'warn');
    } else {
      // Add the new file if it's not a duplicate
      setFiles([...files, newFile]);
      setAllFiles([...allFiles, newFile]);
    }

    e.target.value = null; // Reset the input field
  };

  // Handle file removal
  const handleRemoveFile = index => {
    const fileToRemove = allFiles[index];

    // Check if the file is from oldFiles
    if (oldFiles.some(file => file.id === fileToRemove.id)) {
      setFilesToDelete(prev => [...prev, fileToRemove]);
    } else {
      // Otherwise, it's a newly added file
      setFiles(files.filter((file, i) => i !== files.indexOf(fileToRemove)));
    }
    // Update the combined list
    setAllFiles(allFiles.filter((_, i) => i !== index));
    showToast('File removed successfully.', 'success');
  };

  const handleSubmit = async () => {
    try {
      if (filesToDelete.length > 0) {
        filesToDelete.forEach(async file => {
          await API.deleteResource(docId, file.id);
        });
      }
      if (files.length > 0) {
        await API.uploadResources(docId, files);
      }
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
      <Modal.Body>
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
            accept=".pdf,.docx,.doc,.xls,.xlsx"
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
          style={{
            maxHeight: '25vh', // Adjust height for the scrollable section
            overflowY: 'auto',
            overflowX: 'hidden',
            marginTop: '1rem',
          }}
        >
          {allFiles &&
            allFiles.map((file, index) => (
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
                    {file.name.endsWith('.doc') && (
                      <FaFileWord size={24} color="#258bff" />
                    )}
                    {file.name.endsWith('.xls') && (
                      <FaFileExcel size={24} color="#28a745" />
                    )}
                    {file.name.endsWith('.xlsx') && (
                      <FaFileExcel size={24} color="#28a745" />
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
