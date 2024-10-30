import { useEffect, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import Document from '../models/Document';
import API from '../services/API.js';
import './style.css';

// API FUNCTION
// import { submitDocument } from './API';

const DocumentForm = () => {
  const [formData, setFormData] = useState(new Document());
  const [dateError, setDateError] = useState('');
  const [stakeholders, setStakeholders] = useState([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState('');

  useEffect(() => {
    const fetchStakeholders = async () => {
      const response = await API.getStakeholders();
      const responseBody = await response.json();
      setStakeholders(responseBody.text);
    };
    fetchStakeholders();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'year' || name === 'month' || name === 'day') {
      setFormData(prev => ({
        ...prev,
        issuanceDate: {
          ...prev.issuanceDate,
          [name]: value,
        },
      }));
    } else if (name === 'stakeholders') {
      setSelectedStakeholder(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addStakeholder = () => {
    if (selectedStakeholder) {
      const newStakeholder = stakeholders.find(
        s => s.id === parseInt(selectedStakeholder),
      );
      if (
        newStakeholder &&
        !formData.stakeholders.includes(newStakeholder.name)
      ) {
        setFormData(prev => ({
          ...prev,
          stakeholders: [...prev.stakeholders, newStakeholder.name],
        }));
        setSelectedStakeholder('');
      }
    }
  };

  const removeStakeholder = stakeholderToRemove => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter(
        stakeholder => stakeholder !== stakeholderToRemove,
      ),
    }));
  };

  const formatDate = ({ year, month, day }) => {
    const y = year.padStart(4, '0');
    const m = (month || '01').padStart(2, '0');
    const d = (day || '01').padStart(2, '0');
    return `${y}:${m}:${d}`;
  };

  const validateIssuanceDate = () => {
    const { year, month, day } = formData.issuanceDate;
    if (!year && (month || day)) {
      setDateError('Please select a year first.');
      return false;
    }
    if (year && !month && day) {
      setDateError('Please select a month if you want to include a day.');
      return false;
    }

    if (year) {
      const formattedDate = formatDate({ year, month, day });
      const enteredDate = new Date(`${year}-${month || '01'}-${day || '01'}`);
      const currentDate = new Date();

      if (enteredDate > currentDate) {
        setDateError('Issuance date cannot be in the future.');
        return false;
      }

      setDateError('');
      return formattedDate;
    }
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const issuanceDate = validateIssuanceDate();
    if (issuanceDate === false) return;

    const documentData = { ...formData, issuanceDate };

    console.log(documentData);
    try {
      const response = await API.uploadDocument({
        title: documentData.title,
        stakeholders: documentData.stakeholders,
        scale: documentData.scale,
        issuanceDate: documentData.issuanceDate,
        type: documentData.type,
        language: documentData.language,
        desc: documentData.description,
      });
      console.log('Document submitted:', response);
    } catch (error) {
      console.error('Error submitting document:', error);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="container my-4 d-flex justify-content-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow"
        style={{ maxWidth: '600px', width: '100%' }}
      >
        <h2 className="document-title">Add New Document</h2>

        <div className="form-group mb-3">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            className="form-control custom-input"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="stakeholders">Stakeholders</label>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select custom-input"
              id="stakeholders"
              name="stakeholders"
              value={selectedStakeholder}
              onChange={handleChange}
            >
              <option value="">Select a stakeholder</option>
              {stakeholders.map(stakeholder => (
                <option key={stakeholder.id} value={stakeholder.id}>
                  {stakeholder.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-custom"
              onClick={addStakeholder}
            >
              +
            </button>
          </div>

          {formData.stakeholders && formData.stakeholders.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {formData.stakeholders.map((stakeholder, index) => (
                <span key={index} className="badge stakeholder-label">
                  {stakeholder}
                  <button
                    type="button"
                    className="remove-label-btn"
                    onClick={() => removeStakeholder(stakeholder)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="scale">Scale</label>
          <input
            type="text"
            className="form-control custom-input"
            id="scale"
            name="scale"
            value={formData.scale}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-3">
          <label>Issuance Date</label>
          <div className="d-flex gap-2">
            <select
              className="form-select custom-input"
              name="year"
              value={formData.issuanceDate.year}
              onChange={handleChange}
            >
              <option value="">Year</option>
              {[...Array(51)].map((_, i) => (
                <option key={i} value={currentYear - i}>
                  {currentYear - i}
                </option>
              ))}
            </select>

            <select
              className="form-select custom-input"
              name="month"
              value={formData.issuanceDate.month}
              onChange={handleChange}
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              className="form-select custom-input"
              name="day"
              value={formData.issuanceDate.day}
              onChange={handleChange}
            >
              <option value="">Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          {dateError && <div className="text-danger mt-1">{dateError}</div>}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="type">Type</label>
          <input
            type="text"
            className="form-control custom-input"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="language">Language</label>
          <input
            type="text"
            className="form-control custom-input"
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control custom-input"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="d-grid">
          <button type="submit" className="btn btn-custom">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;
