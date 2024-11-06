import { useState } from 'react';
import { useEffect } from 'react';
import { Container } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';

import API from '../services/API.js';
import './style.css';

// On clicking "save links" button, this component will call saveLinks function
// saveLinks takes an array of connections and assigns it to connection field of document
// check Connection model
// [{id, linkType}, {....}]

const DocumentLinker = ({ saveLinks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedDocs, setLinkedDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [linkTypes, setLinkTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [documentsPromise, linktypesPromise] = await Promise.all([
        API.getAllDocuments(),
        API.getLinkTypes(),
      ]);
      setDocuments(await documentsPromise);
      setLinkTypes(await linktypesPromise);
    };

    fetchData();
  }, []);
  //const documents = [];

  const onSaveLinks = async () => {
    const hasInvalidLinkType = linkedDocs.some(doc => !doc.linkType);
    if (hasInvalidLinkType) {
      setErrorMessage('Specify link type for each selected document.');
      return;
    }

    setErrorMessage('');
    const updatedLinks = linkedDocs.map(linkedDoc => ({
      doc2: linkedDoc.id_file,
      linkType: linkedDoc.linkType,
    }));
    setConfirmMessage('Links saved successfully.');
    saveLinks(updatedLinks);
  };

  const handleSelect = doc => {
    if (!linkedDocs.some(linkedDoc => linkedDoc.id_file === doc.id_file)) {
      const newLinkedDocs = [...linkedDocs, { ...doc, linkType: '' }];
      setLinkedDocs(newLinkedDocs);
    }
  };

  const handleRemove = id => {
    const newLinkedDocs = linkedDocs.filter(doc => doc.id_file !== id);

    //if the removed item is last item of list we call saveLinks manually since the button is disabled
    if (newLinkedDocs.length == 0) {
      saveLinks([]);
    }

    setLinkedDocs(newLinkedDocs);
  };

  const handleLinkTypeChange = (docId, newType) => {
    setLinkedDocs(
      linkedDocs.map(doc =>
        doc.id_file === docId ? { ...doc, linkType: newType } : doc,
      ),
    );
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const docsPerPage = 10;
  const totalPages = Math.ceil(filteredDocs.length / docsPerPage);
  const currentDocs = filteredDocs.slice(
    (page - 1) * docsPerPage,
    page * docsPerPage,
  );

  return (
    <Container>
      <h2 className="document-title ">Link the New Document</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            placeholder="Search a title"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-control search-bar"
          />
        </div>
      </div>

      <div className="d-flex">
        {/* Left Section - List of Documents */}
        <div className="table-container">
          <table
            className="table document-table"
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Stakeholders</th>
                <th>Issuance Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentDocs.map(doc => (
                <tr
                  key={doc.id_file}
                  style={{ borderBottom: '1px solid #eee' }}
                >
                  <td>{doc.id_file}</td>
                  <td>{doc.title}</td>
                  <td className="text-center">
                    {doc.stakeholder.length ? doc.stakeholder : '-'}
                  </td>
                  <td>{doc.issuance_date}</td>
                  <td>
                    <button
                      className="add-button rounded-btn"
                      onClick={() => handleSelect(doc)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div
            className="pagination"
            style={{ textAlign: 'center', marginTop: '10px' }}
          >
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

        {/* Right Section - Documents Linked */}
        <div className="linked-docs-container">
          <h3 className="linked-docs-title">Documents To-Be Linked</h3>
          <div
            className="flex-grow-1"
            style={{ overflowY: 'auto', padding: '10px' }}
          >
            {linkedDocs.length === 0 ? (
              <div className="empty-state">
                <p>No document selected.</p>
              </div>
            ) : (
              linkedDocs.map(doc => (
                <div className="linked-doc-row" key={doc.id}>
                  <span
                    className="linked-doc-title"
                    style={{ flex: '1', paddingRight: '10px' }}
                  >
                    {doc.title}
                  </span>
                  <select
                    id="link"
                    name="link"
                    value={doc.linkType}
                    onChange={e =>
                      handleLinkTypeChange(doc.id_file, e.target.value)
                    }
                    className="link-form-select link-type-select"
                  >
                    <option value="">Select Link Type</option>
                    {linkTypes.map(type => (
                      <option key={type.linktype} value={type.linktype}>
                        {type.linktype}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(doc.id_file)}
                    className="remove-btn"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              ))
            )}
          </div>
          {errorMessage && (
            <p className="text-danger text-center mt-2">{errorMessage}</p>
          )}
          {confirmMessage && (
            <p className="text-success text-center mt-2">{confirmMessage}</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onSaveLinks}
              className={`save-links-btn ${!linkedDocs.length ? 'disabled' : ''}`}
              disabled={!linkedDocs.length}
            >
              Save Links
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default DocumentLinker;

DocumentLinker.propTypes = {
  saveLinks: PropTypes.func.isRequired, // Required function
};
