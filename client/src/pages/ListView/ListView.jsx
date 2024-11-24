import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Col,
  Container,
  FormControl,
  Modal,
  Row,
  Table,
} from 'react-bootstrap';
import { FaRegTrashCan } from 'react-icons/fa6';

import { Button } from '../../components/Button.jsx';
import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useUserContext } from '../../contexts/UserContext.js';
import API from '../../services/API';
import SidePanel from '../MapView/SidePanel';
// Import the SidePanel component
import './ListView.css';

const ListView = () => {
  const { user } = useUserContext(); // Use the user context to get the current user
  const { showToast } = useFeedbackContext(); // Use the feedback context for toast messages
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null); // State to track the selected document
  const documentsPerPage = 10;

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await API.getAllDocuments();
      const sortedDocuments = response.sort((a, b) =>
        a.title.localeCompare(b.title),
      ); // Sort documents alphabetically by title
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
        const updatedDocuments = documents.filter(
          doc => doc.id_file !== documentToDelete.id_file,
        );
        setDocuments(
          documents.filter(doc => doc.id_file !== documentToDelete.id_file),
        );
        setSelectedDocument(null);
        setShowDeleteModal(false);
        setDocumentToDelete(null);

        // Check if the deleted document was the last document on the current page
        const totalDocuments = updatedDocuments.length;
        const totalPages = Math.ceil(totalDocuments / documentsPerPage);
        if (currentPage >= totalPages) {
          setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
        }

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

  const handleRowClick = document => {
    setSelectedDocument(document);
  };

  const handleCloseSidePanel = () => {
    setSelectedDocument(null);
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
        <Card className="mb-4 fixed-dimension-card d-flex">
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
                  <tr
                    key={document.id_file}
                    onClick={() => handleRowClick(document)}
                  >
                    <td className="truncate">{document.title}</td>
                    <td className="truncate">{document.scale}</td>
                    <td>{document.type}</td>
                    <td className="small-column">
                      {document.language ? document.language : 'N.D.'}
                    </td>
                    <td>
                      {document.issuance_year}
                      {document.issuance_month
                        ? `-${document.issuance_month}`
                        : ''}
                      {document.issuance_day ? `-${document.issuance_day}` : ''}
                    </td>
                    {user ? (
                      <td
                        className="delete-column"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteClick(document);
                        }}
                      >
                        <FaRegTrashCan className="trash-icon" />
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
                className="pagination-btn2"
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
          <Button
            variant="cancel"
            className="me-3"
            onClick={handleDeleteCancel}
          >
            No
          </Button>
          <Button onClick={handleDeleteConfirm}>Yes</Button>
        </Modal.Footer>
      </Modal>

      {selectedDocument ? (
        <SidePanel
          selectedDocument={selectedDocument}
          onClose={handleCloseSidePanel}
          setIsModifyingGeoreference={() => {}}
          path={'list'}
        />
      ) : (
        <Row />
      )}
    </div>
  );
};

export default ListView;
