import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  FormControl,
  Modal,
  Row,
  Table,
} from 'react-bootstrap';
import { FaRegTrashCan } from 'react-icons/fa6';

import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useUserContext } from '../../contexts/UserContext.js';
import API from '../../services/API';
import './ListView.css';

// Import the CSS file

const ListView = () => {
  const { user } = useUserContext(); // Use the user context to get the current user
  const { showToast } = useFeedbackContext(); // Use the feedback context for toast messages
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const documentsPerPage = 10;

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await API.getAllDocuments();
      const sortedDocuments = response.sort((a, b) => a.id_file - b.id_file); // Sort documents in increasing ID order
      setDocuments(sortedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage =>
      Math.min(
        prevPage + 1,
        Math.ceil(filteredDocuments.length / documentsPerPage) - 1,
      ),
    );
  };

  const handleDeleteClick = document => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      try {
        await API.deleteDocument(documentToDelete.id_file);
        setDocuments(
          documents.filter(doc => doc.id_file !== documentToDelete.id_file),
        );
        setShowDeleteModal(false);
        setDocumentToDelete(null);
        showToast('Document deleted successfully', 'success'); // Show success toast
      } catch (error) {
        console.error('Error deleting document:', error);
        showToast('Failed to delete document. Try again.', 'error'); // Show error toast
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const offset = currentPage * documentsPerPage;
  const filteredDocuments = documents.filter(document =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const currentDocuments = filteredDocuments.slice(
    offset,
    offset + documentsPerPage,
  );

  return (
    <div className="list-view-container d-flex">
      <Container>
        <Card className="mb-4 fixed-dimension-card">
          <Card.Body>
            <Row className="mb-3">
              <Col>
                <FormControl
                  type="text"
                  placeholder="Search by title"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-bar"
                />
              </Col>
            </Row>
            <Table striped bordered hover className="document-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Scale</th>
                  <th className="small-column">Type</th>
                  <th className="small-column">Language</th>
                  <th>Issuance Date</th>
                  {user ? <th className="delete-column"></th> : null}
                </tr>
              </thead>
              <tbody>
                {currentDocuments.map(document => (
                  <tr key={document.id_file}>
                    <td className="truncate">{document.title}</td>
                    <td className="truncate">{document.scale}</td>
                    <td>{document.type}</td>
                    <td className="small-column">{document.language}</td>
                    <td>
                      {document.issuance_year}
                      {document.issuance_month
                        ? `-${document.issuance_month}`
                        : ''}
                      {document.issuance_day ? `-${document.issuance_day}` : ''}
                    </td>
                    {user ? (
                      <td className="delete-column">
                        <FaRegTrashCan
                          className="trash-icon"
                          onClick={() => handleDeleteClick(document)}
                        />
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer>
            <div className="pagination">
              <Button
                className="pagination-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                {'<'}
              </Button>
              <span className="page-info">
                Page {currentPage + 1} of{' '}
                {Math.ceil(filteredDocuments.length / documentsPerPage)}
              </span>
              <Button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={
                  currentPage ===
                  Math.ceil(filteredDocuments.length / documentsPerPage) - 1
                }
              >
                {'>'}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Container>

      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this document?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            No
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListView;
