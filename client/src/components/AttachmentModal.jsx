import { useEffect, useState } from 'react';
import { Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { FaFileImage, FaFileVideo } from 'react-icons/fa';

import PropTypes from 'prop-types';

import { Button } from '../components/Button';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import API from '../services/API';

export const AttachmentModal = ({ mode, show, onHide, docId }) => {
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
          const attachments = await API.getDocumentAttachments(docId);
          setOldFiles(attachments);
          setAllFiles(attachments);
        } catch (error) {
          console.warn('Error fetching attachments:', error);
        }
      };
      fetchFiles();
    }
  }, [mode, show, docId]);

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

  const handleFileChange = e => {
    const newFile = e.target.files[0];
    if (!newFile) return;
    const isDuplicate = allFiles.some(file => file.name === newFile.name);
    if (isDuplicate) {
      showToast('This file has already been added.', 'warn');
    } else {
      setFiles([...files, newFile]);
      setAllFiles([...allFiles, newFile]);
    }
    e.target.value = null;
  };

  const handleRemoveFile = index => {
    const fileToRemove = allFiles[index];
    if (oldFiles.some(file => file.id === fileToRemove.id)) {
      setFilesToDelete(prev => [...prev, fileToRemove]);
    } else {
      setFiles(files.filter((file, i) => i !== files.indexOf(fileToRemove)));
    }
    setAllFiles(allFiles.filter((_, i) => i !== index));
    showToast('File removed successfully.', 'success');
  };

  const handleSubmit = async () => {
    try {
      if (filesToDelete.length > 0) {
        filesToDelete.forEach(async file => {
          await API.deleteAttachment(docId, file.id);
        });
      }
      if (files.length > 0) {
        await API.uploadAttachments(docId, files);
      }
      showToast('Attachments Uploaded', 'success');
      onHide();
    } catch (err) {
      console.error(err);
      showToast('Failed to upload Attachments. Try again.', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title className="document-title">
          {mode === 'edit' ? 'Edit Attachments' : 'Add Attachments'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
            accept=".png,.jpg,.mp4,.mov,"
            onChange={handleFileChange}
            style={{ display: 'none' }}
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
            maxHeight: '25vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            marginTop: '1rem',
          }}
        >
          {allFiles &&
            allFiles.map((file, index) => (
              <Card className="mb-2 p-2 mt-3 linked-docs-title" key={index}>
                <Row className="align-items-center">
                  <Col xs="auto" className="d-flex justify-content-start">
                    {(file.name.endsWith('.png') ||
                      file.name.endsWith('.jpg')) && (
                      <FaFileImage size={24} color="#28a745" />
                    )}
                    {(file.name.endsWith('.mp4') ||
                      file.name.endsWith('.mov')) && (
                      <FaFileVideo size={24} color="#ff2525" />
                    )}
                  </Col>
                  <Col className="d-flex justify-content-start">
                    <span className="text-truncate">{file.name}</span>
                  </Col>
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

AttachmentModal.propTypes = {
  mode: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  docId: PropTypes.number.isRequired,
};
