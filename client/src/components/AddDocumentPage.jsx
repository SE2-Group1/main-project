import { useState } from 'react';

import Document from '../models/Document';
import API from '../services/API.js';
import DocumentForm from './DocumentForm';
import DocumentLinker from './DocumentLinker';

const AddDocument = () => {
  const [step, setStep] = useState(1);
  const [documentData, setDocumentData] = useState(new Document());

  const handleNext = () => setStep(2);

  const handleAddLink = newLinks => {
    setDocumentData(prev => ({
      ...prev,
      connections: newLinks,
    }));
  };

  const handleSubmit = async () => {
    console.log('Submitting document:', documentData);
    try {
      const response = await API.uploadDocument({
        title: documentData.title,
        stakeholders: documentData.stakeholders,
        scale: documentData.scale,
        issuanceDate: documentData.issuanceDate,
        type: documentData.type,
        language: documentData.language,
        desc: documentData.description,
        connections: documentData.connections,
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

export default AddDocument;
