import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { FaRegTrashCan } from 'react-icons/fa6';

import { Button } from '../../components/Button.jsx';
import { Filter } from '../../components/Filter.jsx';
import { LinkModal } from '../../components/LinkModal.jsx';
import { ResourcesModal } from '../../components/ResourcesModal.jsx';
import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useUserContext } from '../../contexts/UserContext.js';
import { useDebounceValue } from '../../hooks/useDebounceValue';
import API from '../../services/API';
import SidePanel from '../MapView/components/SidePanel.jsx';
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
    startDate: [],
    endDate: [],
  });
  const [filterByMunicipality, setFilterByMunicipality] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null); // State to track the selected document
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
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

  // Utility Functions
  const parseDocDate = doc => {
    return [
      doc.issuance_year,
      doc.issuance_month?.padStart(2, '0') || '',
      doc.issuance_day?.padStart(2, '0') || '',
    ]
      .filter(Boolean)
      .join('-');
  };

  const isExactDateMatch = (docDateAsDate, parsedStartDate) =>
    docDateAsDate
      .toISOString()
      .startsWith(parsedStartDate.toISOString().slice(0, 10));

  const isWithinDateRange = (docDateAsDate, parsedStartDate, parsedEndDate) => {
    return (
      (!parsedStartDate || docDateAsDate >= parsedStartDate) &&
      (!parsedEndDate || docDateAsDate <= parsedEndDate)
    );
  };

  const matchesDate = (doc, selectedFilters) => {
    const startDate = selectedFilters.startDate?.[0];
    const endDate = selectedFilters.endDate?.[0];
    if (!startDate && !endDate) return true;

    const docDate = parseDocDate(doc);
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const docDateAsDate = new Date(docDate);

    if (startDate === endDate) {
      return isExactDateMatch(docDateAsDate, parsedStartDate);
    }
    return isWithinDateRange(docDateAsDate, parsedStartDate, parsedEndDate);
  };

  const matchesFilter = (doc, selectedFilters, category, field) => {
    const selectedValues = selectedFilters[category];
    const docValue = doc[field];

    if (!selectedValues || selectedValues.length === 0) return true;
    if (Array.isArray(docValue)) {
      return docValue.some(value => selectedValues.includes(value));
    }
    return selectedValues.includes(docValue);
  };

  // Filtering Logic
  const applySearch = (docs, searchTerm, criteria) => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return docs;

    return docs.filter(doc => {
      if (criteria === 'Title') {
        return doc.title.toLowerCase().includes(searchLower);
      }
      if (criteria === 'Description') {
        return doc.desc?.toLowerCase().includes(searchLower);
      }
      return true;
    });
  };

  const applyFilters = (docs, selectedFilters, filterByMunicipality) => {
    let filteredDocs = docs.filter(doc => {
      return (
        matchesFilter(doc, selectedFilters, 'stakeholders', 'stakeholder') &&
        matchesFilter(doc, selectedFilters, 'scales', 'scale') &&
        matchesFilter(doc, selectedFilters, 'types', 'type') &&
        matchesFilter(doc, selectedFilters, 'languages', 'language') &&
        matchesDate(doc, selectedFilters)
      );
    });

    if (filterByMunicipality) {
      filteredDocs = filteredDocs.filter(doc => doc.id_area === 1);
    }

    return filteredDocs;
  };

  // useMemo Hook
  const filteredDocs = useMemo(() => {
    if (!documents) return [];

    let result = documents;
    result = applySearch(result, debounceSearch, searchCriteria);
    result = applyFilters(result, selectedFilters, filterByMunicipality);

    return result;
  }, [
    debounceSearch,
    searchCriteria,
    selectedFilters,
    documents,
    filterByMunicipality,
  ]);

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

  const fetchFullDocument = async docId => {
    try {
      const doc = await API.getDocument(docId);
      setSelectedDocument(doc);
      return doc;
    } catch (err) {
      console.warn(err);
      showToast('Failed to fetch document', 'error');
    }
  };

  // Handlers
  const handleCheckboxChange = () => {
    setFilterByMunicipality(prev => !prev);
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

  const handleShowLinksModal = () => {
    setShowLinksModal(true);
  };

  const handleShowResourcesModal = () => {
    setShowResourcesModal(true);
  };

  const handleCloseLinksModal = () => {
    fetchFullDocument(selectedDocument.id_file);
    setShowLinksModal(false);
  };

  const handleCloseResourcesModal = () => {
    fetchFullDocument(selectedDocument.id_file);
    setShowResourcesModal(false);
  };

  return (
    <div className="list-view-container d-flex">
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Card className="mb-4 fixed-dimension-card d-flex">
          <Card.Body className="table-card-body">
            <Row className="mb-1">
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
            <Row className="mb-2">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="Municipality Area"
                  checked={filterByMunicipality}
                  onChange={handleCheckboxChange}
                />
              </Col>
            </Row>
            <div className="table-container">
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
                        {document.issuance_month &&
                          `-${document.issuance_month}`}
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
            </div>
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
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
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
      {selectedDocument ? (
        <SidePanel
          docInfo={selectedDocument}
          onClose={handleCloseSidePanel}
          handleShowLinksModal={handleShowLinksModal}
          handleShowResourcesModal={handleShowResourcesModal}
        />
      ) : null}
      {showLinksModal && selectedDocument ? (
        <LinkModal
          show={showLinksModal}
          onHide={handleCloseLinksModal}
          docId={selectedDocument.id_file}
          mode={'edit'}
        />
      ) : null}
      {showResourcesModal && selectedDocument ? (
        <ResourcesModal
          show={showResourcesModal}
          onHide={handleCloseResourcesModal}
          docId={selectedDocument.id_file}
          mode={'edit'}
        />
      ) : null}{' '}
      (
      <Row />)
    </div>
  );
};

export default ListView;
