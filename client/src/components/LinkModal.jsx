import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../contexts/FeedbackContext';
import { useDebounceValue } from '../hooks/useDebounceValue';
import API from '../services/API';
import { prioritizeDocsByLinkCount } from '../utils/docs';
import { Button } from './Button';
import { CtaButton } from './CtaButton';
import { SearchBar } from './SearchBar';

export const LinkModal = ({ mode, show, onHide, docId }) => {
  const { showToast } = useFeedbackContext();
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounceValue(search, 400);
  const [page, setPage] = useState(1);
  const [documents, setDocuments] = useState([]);
  const [linkTypes, setLinkTypes] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editedDocument, setEditedDocument] = useState(null);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (show) {
      const spinnerTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 300);
      const [documents, linkTypes, document] = await Promise.all([
        API.getAllDocuments(),
        API.getLinkTypes(),
        API.getDocument(docId),
      ]);
      // Skip the current document and sort the rest by link count
      const sortedDocs = documents
        ? documents
            .filter(doc => doc.id_file !== docId)
            .sort((a, b) => prioritizeDocsByLinkCount(docId, a, b))
        : [];
      clearTimeout(spinnerTimeout);
      setDocuments(sortedDocs);
      setLinkTypes(linkTypes);
      setEditedDocument(document);
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [docId, show]);

  // Fetch data at the beginning
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update links when selectedDoc or linkTypes change
  useEffect(() => {
    if (!selectedDoc || !linkTypes) return;
    const docLinks = selectedDoc.links
      .filter(link => link.docId === docId)
      .map(conn => {
        return { type: conn.link_type, checked: true };
      });
    const allLinks = linkTypes
      .map(linkType => {
        const existingLink = docLinks.find(
          conn => conn.type === linkType.link_type,
        );
        return existingLink || { type: linkType.link_type, checked: false };
      })
      .sort((a, b) => a.type.localeCompare(b.type));
    setLinks(allLinks);
  }, [selectedDoc, docId, linkTypes]);

  const handleChangeLinks = useCallback(
    e => {
      const linkType = e.target.id;
      const isChecked = e.target.checked;
      const updatedLinks = links.map(conn =>
        conn.type === linkType ? { ...conn, checked: isChecked } : conn,
      );
      setLinks(updatedLinks);
    },
    [links],
  );

  const saveLinks = useCallback(async () => {
    const newLinks = links.map(conn => ({
      type: conn.type,
      isValid: conn.checked,
    }));
    try {
      await API.uploadDocumentLinks({
        doc1: docId,
        doc2: selectedDoc.id_file,
        links: newLinks,
      });
      showToast('Links saved', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save links. Try again.', 'error');
    } finally {
      setSelectedDoc(null);
      setLinks([]);
    }
  }, [links, docId, selectedDoc, showToast, fetchData]);

  const filteredDocs = useMemo(
    () =>
      documents.filter(doc =>
        doc.title.toLowerCase().includes(debounceSearch.toLowerCase()),
      ),
    [debounceSearch, documents],
  );

  const docsPerPage = 5;
  const totalPages = useMemo(
    () => Math.ceil(filteredDocs.length / docsPerPage),
    [filteredDocs, docsPerPage],
  );
  const currentDocs = useMemo(
    () => filteredDocs.slice((page - 1) * docsPerPage, page * docsPerPage),
    [filteredDocs, docsPerPage, page],
  );

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        backdrop="static"
        keyboard={false}
        dialogClassName="modal-links"
      >
        <Modal.Header closeButton>
          <div className="document-title">
            {mode === 'edit' ? 'Edit links' : 'Add links'}
          </div>
        </Modal.Header>
        <Modal.Body style={{ minHeight: '60vh' }}>
          {!isLoading && documents.length > 0 && (
            <Row className="mb-3">
              <div className="col-md-4">
                <SearchBar search={search} setSearch={setSearch} />
              </div>
            </Row>
          )}
          <Row className="d-flex">
            {/* Left Section - List of Documents */}
            {!isLoading ? (
              documents.length > 0 ? (
                <Col className="d-flex flex-grow-1">
                  <div className="table-container">
                    <table className="table document-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th className="small-column">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDocs.map(doc => (
                          <tr
                            key={doc.id_file}
                            style={{ borderBottom: '1px solid #eee' }}
                          >
                            <td
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '150px',
                              }}
                            >
                              {doc.title}
                            </td>
                            <td>
                              <button
                                className="rounded-btn"
                                onClick={() => setSelectedDoc(doc)}
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Pagination */}
                    <div className="pagination mt-3">
                      <button
                        className="pagination-btn"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        {'<'}
                      </button>
                      <span style={{ margin: '0 10px' }}>
                        {page} of {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        {'>'}
                      </button>
                    </div>
                  </div>
                </Col>
              ) : hasLoaded ? (
                <Col className="d-flex justify-content-center">
                  <p>No documents found</p>
                </Col>
              ) : (
                <Col className="d-flex justify-content-center align-items-center">
                  <Spinner animation="border" variant="secondary" />
                </Col>
              )
            ) : (
              <Col className="d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="secondary" />
              </Col>
            )}
            {/* Right Section - Documents Linked */}
            <Col>
              <Card className="p-3">
                <h3 className="linked-docs-title">
                  {editedDocument
                    ? `${editedDocument.title.toUpperCase()} ⭤ `
                    : ''}
                  {selectedDoc
                    ? selectedDoc.title.toUpperCase()
                    : 'No document selected'}
                </h3>
                <div style={{ overflowY: 'auto', padding: '10px' }}>
                  {links.map((conn, idx) => (
                    <Form.Check
                      className="mb-3 custom-switch"
                      key={idx}
                      type="switch"
                      checked={conn.checked}
                      onChange={handleChangeLinks}
                      id={conn.type}
                      label={conn.type}
                      style={{ fontSize: '1.25rem' }}
                    />
                  ))}
                </div>
                <div className="d-flex justify-content-center">
                  <CtaButton onClick={saveLinks} disabled={!links.length}>
                    Save Links
                  </CtaButton>
                </div>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

LinkModal.propTypes = {
  mode: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  docId: PropTypes.number.isRequired,
};
