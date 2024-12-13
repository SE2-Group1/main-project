import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Container, Modal, Row, Table } from 'react-bootstrap';
import { FaRegTrashCan } from 'react-icons/fa6';

import { Button } from '../../components/Button.jsx';
import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useUserContext } from '../../contexts/UserContext.js';
import { useDebounceValue } from '../../hooks/useDebounceValue';
import API from '../../services/API';
import SidePanel from '../MapView/components/SidePanel.jsx';
import { Filter } from './Filter.jsx';
import './ListView.css';

const ListView = () => {
  // Contexts
  const { user } = useUserContext();
  const { showToast } = useFeedbackContext();

  // State management
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('Title');
  const [selectedFilters, setSelectedFilters] = useState({
    stakeholders: [],
    scales: [],
    types: [],
    languages: [],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Pagination
  const documentsPerPage = 10;
  const debounceSearch = useDebounceValue(search, 400);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await API.getAllDocuments();
      setDocuments(
        response.sort((a, b) => a.title.localeCompare(b.title)), // Alphabetical sorting
      );
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Document filtering logic
  const filteredDocs = useMemo(() => {
    if (!documents) return [];

    // Step 1: Search Logic
    const applySearch = docs => {
      const searchLower = debounceSearch.trim().toLowerCase();

      if (!searchLower) return docs; // No search term, return all docs

      return docs.filter(doc => {
        if (searchCriteria === 'Title') {
          return doc.title.toLowerCase().includes(searchLower);
        }
        if (searchCriteria === 'Description') {
          return doc.desc?.toLowerCase().includes(searchLower);
        }
        return true; // Default: Include all
      });
    };

    // Step 2: Filter Logic
    const applyFilters = docs => {
      return docs.filter(doc => {
        // Helper function to check a single filter
        const matchesFilter = (category, field) => {
          const selectedValues = selectedFilters[category];
          const docValue = doc[field]; // This can be a string, array, or undefined

          if (!selectedValues || selectedValues.length === 0) return true; // No filters applied for this category

          // Check if the document field is an array
          if (Array.isArray(docValue)) {
            return docValue.some(value => selectedValues.includes(value)); // Overlap exists
          }

          // Handle scalar fields (string, number, etc.)
          return selectedValues.includes(docValue);
        };

        // Check all categories
        return (
          matchesFilter('stakeholders', 'stakeholder') &&
          matchesFilter('scales', 'scale') &&
          matchesFilter('types', 'type') &&
          matchesFilter('languages', 'language')
        );
      });
    };

    // Step 3: Pipeline Execution
    let result = documents;
    result = applySearch(result);
    result = applyFilters(result);

    return result;
  }, [debounceSearch, searchCriteria, selectedFilters, documents]);

  // Pagination logic
  const offset = currentPage * documentsPerPage;
  const currentDocuments = filteredDocs.slice(
    offset,
    offset + documentsPerPage,
  );

  // Handlers
  const handlePageChange = direction => {
    setCurrentPage(prevPage => {
      const totalPages = Math.ceil(filteredDocs.length / documentsPerPage);
      return direction === 'next'
        ? Math.min(prevPage + 1, totalPages - 1)
        : Math.max(prevPage - 1, 0);
    });
  };

  const handleDeleteClick = document => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    try {
      await API.deleteDocument(documentToDelete.id_file);
      const updatedDocuments = documents.filter(
        doc => doc.id_file !== documentToDelete.id_file,
      );
      setDocuments(updatedDocuments);
      setDocumentToDelete(null);
      setSelectedDocument(null);
      setShowDeleteModal(false);

      // Adjust current page if necessary
      if (
        currentPage >= Math.ceil(updatedDocuments.length / documentsPerPage)
      ) {
        setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
      }

      showToast('Document deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast('Failed to delete document. Try again.', 'error');
    }
  };

  const handleRowClick = document => {
    setSelectedDocument(document);
  };

  const handleCloseSidePanel = () => {
    setSelectedDocument(null);
  };

  return (
    <div className="list-view-container d-flex">
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Card className="mb-4 fixed-dimension-card d-flex">
          <Card.Body>
            <Row className="mb-3">
              <Col>
                <Filter
                  search={search}
                  setSearch={setSearch}
                  searchBy={searchCriteria}
                  setSearchBy={setSearchCriteria}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                />
              </Col>
            </Row>
            <Table striped bordered hover className="document-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th className="scale-column">Scale</th>
                  <th className="type-column">Type</th>
                  <th className="small-column">Language</th>
                  <th className="issuance-date-column">Issuance Date</th>
                  {user && <th className="delete-column"></th>}
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
                      {document.language || 'N.D.'}
                    </td>
                    <td>
                      {document.issuance_year}
                      {document.issuance_month && `-${document.issuance_month}`}
                      {document.issuance_day && `-${document.issuance_day}`}
                    </td>
                    {user && (
                      <td
                        className="delete-column"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteClick(document);
                        }}
                      >
                        <FaRegTrashCan className="trash-icon" />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer className="card-footer">
            <div className="pagination">
              <Button
                className="pagination-btn"
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 0}
              >
                {'<'}
              </Button>
              <span className="page-info d-flex align-items-center">
                Page {currentPage + 1} of{' '}
                {Math.ceil(filteredDocs.length / documentsPerPage)}
              </span>
              <Button
                className="pagination-btn"
                onClick={() => handlePageChange('next')}
                disabled={
                  currentPage ===
                  Math.ceil(filteredDocs.length / documentsPerPage) - 1
                }
              >
                {'>'}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Container>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this document?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="cancel"
            className="me-3"
            onClick={() => setShowDeleteModal(false)}
          >
            No
          </Button>
          <Button onClick={handleDeleteConfirm}>Yes</Button>
        </Modal.Footer>
      </Modal>

      {selectedDocument && (
        <SidePanel docInfo={selectedDocument} onClose={handleCloseSidePanel} />
      )}
    </div>
  );
};

export default ListView;
