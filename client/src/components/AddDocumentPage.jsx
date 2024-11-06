import { useState } from 'react';

import PropTypes from 'prop-types';

import Document from '../models/Document';
import API from '../services/API.js';
import DocumentForm from './DocumentForm';
import DocumentLinker from './DocumentLinker';

const AddDocument = ({ user }) => {
  const [step, setStep] = useState(1);
  const [documentData, setDocumentData] = useState(new Document());

  useState(() => {
    console.log('User:', user);
  }, [user]);

  const handleNext = () => setStep(2);

  const handleAddLink = newLinks => {
    setDocumentData(prev => ({
      ...prev,
      connections: newLinks,
    }));
  };

  const handleSubmit = async () => {
    console.log('Submitting document:', documentData);
    console.log(
      'issuanceDate:',
      documentData.issuanceDate.year +
        '-' +
        documentData.issuanceDate.month +
        '-' +
        documentData.issuanceDate.day,
    );
    console.log('User:', user);
    try {
      const response = await API.uploadDocument({
        title: documentData.title,
        desc: documentData.description,
        scale: documentData.scale,
        issuance_date:
          documentData.issuanceDate.year +
          '-' +
          documentData.issuanceDate.month +
          '-' +
          documentData.issuanceDate.day,
        type: documentData.type,
        language: documentData.language,
        link: null,
        pages: documentData.pages,
        stakeholders: documentData.stakeholders,
        connections: documentData.connections, //contains array of doc2id and linktype
      });
      console.log('Document submitted successfully:', response);
    } catch (error) {
      console.error('Error submitting document:', error);
    }
  };

  return (
    <div className="add-page-body">
      <div className="container p-4 rounded shadow">
        {step === 1 && (
          <DocumentForm
            formData={documentData}
            setDocumentData={setDocumentData}
            onNext={handleNext}
          />
        )}
        {/* {step === 1 && (
          <div className="btn-container">
            <button onClick={handleSubmit} className="btn btn-custom">
              Next
            </button>
          </div>
        )} */}
        {step === 2 && <DocumentLinker saveLinks={handleAddLink} />}
        {step === 2 && (
          <div
            className="btn-container d-flex justify-content-end"
            style={{ paddingRight: '20px' }}
          >
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-custom"
              style={{
                backgroundColor: '#6c757d',
                color: '#fff',
                padding: '10px 20px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-custom"
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

AddDocument.propTypes = {
  user: PropTypes.object,
};

export default AddDocument;
