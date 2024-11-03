import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';

import './style.css';

const DocumentLinker = ({ onAddLink }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedDocs, setLinkedDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const linkTypes = ['', 'Type 1', 'Type 2', 'Type 3', 'Type 4'];
  const documents = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: `Title of fake-doc ${i + 1}`,
    stakeholders: [`Stakeholder ${i + 1}`, `Stakeholder ${i + 2}`],
    issuanceDate: '2024-11-01',
  }));

  const handleAddLink = () => {
    const hasInvalidLinkType = linkedDocs.some(doc => !doc.linkType);
    if (hasInvalidLinkType) {
      setErrorMessage('Specify link type for each selected document.');
      return;
    }

    setErrorMessage('');
    const updatedLinks = linkedDocs.map(linkedDoc => ({
      id: linkedDoc.id,
      linkType: linkedDoc.linkType,
    }));

    onAddLink(updatedLinks);
  };

  const handleAdd = doc => {
    if (!linkedDocs.some(linkedDoc => linkedDoc.id === doc.id)) {
      const newLinkedDocs = [...linkedDocs, { ...doc, linkType: '' }];
      setLinkedDocs(newLinkedDocs);
    }
  };

  const handleRemove = id => {
    const newLinkedDocs = linkedDocs.filter(doc => doc.id !== id);
    setLinkedDocs(newLinkedDocs);
  };

  const handleLinkTypeChange = (docId, newType) => {
    setLinkedDocs(
      linkedDocs.map(doc =>
        doc.id === docId ? { ...doc, linkType: newType } : doc,
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
    <div>
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
                <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{doc.id}</td>
                  <td>{doc.title}</td>
                  <td>{doc.stakeholders.join(', ')}</td>
                  <td>{doc.issuanceDate}</td>
                  <td>
                    <button
                      className="add-button rounded-btn"
                      onClick={() => handleAdd(doc)}
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
                    value={doc.linkType}
                    onChange={e => handleLinkTypeChange(doc.id, e.target.value)}
                    className="link-form-select link-type-select"
                  >
                    {linkTypes.map(type => (
                      <option key={type} value={type}>
                        {type || 'Select Link Type'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(doc.id)}
                    className="remove-btn"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              ))
            )}
          </div>
          {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleAddLink}
              className={`save-links-btn ${!linkedDocs.length ? 'disabled' : ''}`}
              disabled={!linkedDocs.length}
            >
              Save Links
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLinker;

DocumentLinker.propTypes = {
  onAddLink: PropTypes.func.isRequired, // Required function
};
