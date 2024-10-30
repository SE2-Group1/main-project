import { useEffect, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import Document from '../models/Document';
import API from '../services/API.js';
import './style.css';

const DocumentForm = () => {
  const [formData, setFormData] = useState(new Document());
  const [dateError, setDateError] = useState('');
  const [stakeholders, setStakeholders] = useState([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState('');
  const [scales, setScales] = useState([]);
  const [types, setTypes] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [
        stakeholdersResponse,
        scalesResponse,
        typesResponse,
        languagesResponse,
      ] = await Promise.all([
        API.getStakeholders(),
        API.getScales(),
        API.getTypes(),
        API.getLanguages(), // Assume API.getLanguages() fetches available languages
      ]);

      setStakeholders(await stakeholdersResponse.text);
      setScales(await scalesResponse.text);
      setTypes(await typesResponse.text);
      setLanguages(await languagesResponse.text);
    };

    fetchData();
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
        !formData.stakeholders.includes(newStakeholder.id)
      ) {
        setFormData(prev => ({
          ...prev,
          stakeholders: [...prev.stakeholders, newStakeholder.id],
        }));
        setSelectedStakeholder('');
      }
    }
  };

  const removeStakeholder = stakeholderIdToRemove => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter(
        stakeholderId => stakeholderId !== stakeholderIdToRemove,
      ),
    }));
  };

  const validateIssuanceDate = () => {
    const { year, month, day } = formData.issuanceDate;

    if (!year || !/^\d{4}$/.test(year)) {
      setDateError('Please enter a valid four-digit year.');
      return false;
    }

    if (month && day && new Date(`${year}-${month}-${day}`) > new Date()) {
      setDateError('Issuance date cannot be in the future.');
      return false;
    }

    setDateError('');
    return new Date(`${year}-${month || '01'}-${day || '01'}`);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const issuanceDate = validateIssuanceDate();
    if (issuanceDate === false) return;

    const documentData = { ...formData, issuanceDate };
    console.log('Document submitted:', documentData);
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

  return (
    <div className="container my-4 d-flex justify-content-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow"
        style={{ maxWidth: '600px', width: '100%' }}
      >
        <h2 className="document-title">Add New Document</h2>

        <div className="form-group mb-3">
          <label htmlFor="title">
            Title<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control custom-input"
            id="title"
            name="title"
            placeholder="Enter document title"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={5} // Minimum length requirement
            maxLength={200} // Maximum length requirement
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
              {formData.stakeholders.map(stakeholderId => {
                const stakeholder = stakeholders.find(
                  s => s.id === stakeholderId,
                );
                return (
                  <span key={stakeholderId} className="badge stakeholder-label">
                    {stakeholder?.name}
                    <button
                      type="button"
                      className="remove-label-btn"
                      onClick={() => removeStakeholder(stakeholderId)}
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="scale">
            Scale<span className="text-danger">*</span>
          </label>
          <select
            className="form-select custom-input"
            id="scale"
            name="scale"
            value={formData.scale}
            onChange={handleChange}
            required
          >
            <option value="">Select a scale</option>
            {scales.map(scale => (
              <option key={scale.id} value={scale.id}>
                {scale.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-3">
          <label>
            Issuance Date<span className="text-danger">*</span>
          </label>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control custom-input"
              placeholder="Year"
              name="year"
              value={formData.issuanceDate.year}
              onChange={handleChange}
              inputMode="numeric" // Allows only numeric input
              required
            />

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
          <label htmlFor="type">
            Type<span className="text-danger">*</span>
          </label>
          <select
            className="form-select custom-input"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select a type</option>
            {types.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-3">
          <label htmlFor="language">Language</label>
          <select
            className="form-select custom-input"
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
          >
            <option value="">Select a language</option>
            {languages.map(language => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-3">
          <label htmlFor="pages">Pages</label>
          <input
            type="number"
            className="form-control custom-input"
            id="pages"
            name="pages"
            placeholder="Enter number of pages"
            value={formData.pages || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="description">
            Description<span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control custom-input"
            id="description"
            name="description"
            rows="4"
            placeholder="Enter a description of the document"
            value={formData.description}
            onChange={handleChange}
            required
            minLength={10} // Minimum length requirement
            maxLength={1000} // Maximum length requirement
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
