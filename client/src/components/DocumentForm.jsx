import { useEffect, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';

import API from '../services/API.js';
import './style.css';

const DocumentForm = ({ formData, setDocumentData, onNext }) => {
  const [dateError, setDateError] = useState('');
  const [stakeholders, setStakeholders] = useState([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState('');
  const [scales, setScales] = useState([]);
  const [types, setTypes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [pagesError, setPagesError] = useState('');

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
        API.getLanguages(),
      ]);

      setStakeholders(await stakeholdersResponse);
      setScales(await scalesResponse);
      setTypes(await typesResponse);
      setLanguages(await languagesResponse);
    };

    fetchData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'year' || name === 'month' || name === 'day') {
      setDocumentData(prev => ({
        ...prev,
        issuanceDate: { ...prev.issuanceDate, [name]: value },
      }));
    } else if (name === 'stakeholders') {
      addStakeholder(value);
      setSelectedStakeholder(value);
    } else {
      setDocumentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addStakeholder = () => {
    if (selectedStakeholder) {
      const newStakeholder = stakeholders.find(
        s => s.stakeholder === selectedStakeholder,
      );
      if (
        newStakeholder &&
        !formData.stakeholders.includes(newStakeholder.stakeholder)
      ) {
        setDocumentData(prev => ({
          ...prev,
          stakeholders: [...prev.stakeholders, newStakeholder.stakeholder],
        }));
        setSelectedStakeholder('');
      }
    }
  };

  const removeStakeholder = stakeholderIdToRemove => {
    setDocumentData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter(
        stakeholderId => stakeholderId !== stakeholderIdToRemove,
      ),
    }));
  };

  const validateIssuanceDate = () => {
    const { year, month, day } = formData.issuanceDate;

    // Check if the year is valid (a four-digit number)
    if (!year || !/^\d{4}$/.test(year)) {
      setDateError('Please enter a valid four-digit year.');
      return false;
    }

    // Check if the month is valid (1-12)
    if (month && (month < 1 || month > 12)) {
      setDateError('Please select a valid month.');
      return false;
    }

    // Check if the day is valid for the given month and year
    if (day && month) {
      const lastDay = new Date(year, month, 0).getDate(); // Get the last day of the month
      if (day < 1 || day > lastDay) {
        setDateError(`The selected month only has ${lastDay} days.`);
        return false;
      }
    }

    // Check if the full date (year, month, day) is not in the future
    const fullDate = new Date(`${year}-${month || '01'}-${day || '01'}`);
    if (fullDate > new Date()) {
      setDateError('Issuance date cannot be in the future.');
      return false;
    }

    setDateError('');
    return fullDate;
  };

  const validatePages = () => {
    const pagesPattern = /^\d+(-\d+)?$/;

    if (formData.pages && !pagesPattern.test(formData.pages)) {
      setPagesError(
        'Invalid format. Use a single number or a range like "5-7".',
      );
      return false;
    }
    setPagesError('');
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const issuanceDate = validateIssuanceDate();
    const isPagesValid = validatePages();
    if (issuanceDate === false || !isPagesValid) return;

    onNext();
  };

  return (
    <div>
      <h2 className="document-title">Add New Document</h2>

      <div className="container  justify-content-center  bg-white p-4 rounded ">
        <form
          onSubmit={handleSubmit}
          className="d-flex flex-wrap"
          style={{ maxWidth: '100%' }}
        >
          <div className="row" style={{ width: '100%' }}>
            {/* Left Column */}
            <div className="col-md-6 " style={{ paddingRight: '40px' }}>
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
                  minLength={5}
                  maxLength={200}
                />
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
                    <option key={scale.scale} value={scale.scale}>
                      {scale.scale}
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
                    inputMode="numeric"
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
                        {new Date(0, i).toLocaleString('default', {
                          month: 'long',
                        })}
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
                {dateError && (
                  <div className="text-danger mt-1">{dateError}</div>
                )}
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
                      <option
                        key={stakeholder.stakeholder}
                        value={stakeholder.stakeholder}
                      >
                        {stakeholder.stakeholder}
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
                    {formData.stakeholders.map(stakeholder => {
                      return (
                        <span
                          key={stakeholder}
                          className="badge stakeholder-label"
                        >
                          {stakeholder}
                          <button
                            type="button"
                            className="remove-label-btn"
                            onClick={() => removeStakeholder(stakeholder)}
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6" style={{ paddingLeft: '40px' }}>
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
                    <option key={type.type_name} value={type.type_name}>
                      {type.type_name}
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
                    <option
                      key={language.language_id}
                      value={language.language_id}
                    >
                      {language.language_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="pages">Pages</label>
                <input
                  type="text"
                  className="form-control custom-input"
                  id="pages"
                  name="pages"
                  placeholder="Enter number of pages"
                  value={formData.pages || ''}
                  onChange={handleChange}
                />
                {pagesError && (
                  <div className="text-danger mt-1">{pagesError}</div>
                )}
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
                  minLength={10}
                  maxLength={1000}
                />
              </div>
              <div className="submit-button-container">
                <button type="submit" className="btn btn-custom">
                  Next
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;

DocumentForm.propTypes = {
  formData: PropTypes.instanceOf(Document).isRequired, // An instance of Document (required)
  setDocumentData: PropTypes.func.isRequired, // Function to update document data (required)
  onNext: PropTypes.func.isRequired, // Function for next action (required)
};
