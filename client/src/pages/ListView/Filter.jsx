import { useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';

import API from '../../services/API';
import './ListView.css';
import filterIcon from '/icons/filterList.svg';

export const Filter = ({
  search,
  setSearch,
  selectedFilters,
  setSelectedFilters,
  searchBy,
  setSearchBy,
}) => {
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [stakeholders, setStakeholders] = useState([]);
  const [scales, setScales] = useState([]);
  const [types, setTypes] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState([]);

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
    console.log(languages);
  }, []);

  const handleAddFilter = (field, value) => {
    if (!value) return;
    setSelectedFilters(prev => ({
      ...prev,
      [field]: [...new Set([...prev[field], value])],
    }));
  };

  const handleRemoveFilter = (field, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value),
    }));
  };

  const handleApplyFilters = () => {
    const applied = [];
    Object.entries(selectedFilters).forEach(([key, values]) => {
      values.forEach(value => {
        applied.push(`${key.slice(0, -1)}: ${value}`); // e.g., "stakeholder: LKAB"
      });
    });
    setAppliedFilters(applied);
    setShowFilterPopup(false);
  };

  const handleRemoveAppliedFilter = filter => {
    const [category, value] = filter.split(': ');
    handleRemoveFilter(category + 's', value); // Re-add the "s" for plural key
    setAppliedFilters(appliedFilters.filter(item => item !== filter));
  };

  const popupRef = useRef(null);

  // Close the popup when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowFilterPopup(false);
        handleApplyFilters(); // Apply filters when the popup closes
      }
    };

    if (showFilterPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterPopup, setShowFilterPopup, handleApplyFilters]);

  return (
    <div className="search-bar-container">
      <div className="form-control search-bar-table">
        <input
          type="text"
          style={{ width: '250px', height: '30px', borderRadius: '10px' }}
          placeholder={`Search by ${searchBy}`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <img
          src={filterIcon}
          alt="Filter"
          className="filter-icon"
          onClick={() => setShowFilterPopup(!showFilterPopup)}
        />
      </div>

      {appliedFilters.length > 0 && (
        <div className="applied-filters">
          {appliedFilters.map((filter, index) => (
            <div className="badge stakeholder-label" key={index}>
              {filter}
              <button
                type="button"
                className="remove-label-btn"
                onClick={() => handleRemoveAppliedFilter(filter)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {showFilterPopup && (
        <div className="filter-popup" ref={popupRef}>
          <div className="filter-field" style={{ marginBottom: '12px' }}>
            <label>Search by:</label>
            <select
              value={searchBy}
              onChange={e => setSearchBy(e.target.value)}
            >
              <option value="Title">Title</option>
              <option value="Description">Description</option>
            </select>
          </div>
          <hr />
          <div className="filter-fields">
            {/** Stakeholders */}
            <div className="filter-field">
              <label>Stakeholder:</label>
              <select id="stakeholders">
                <option value="">Select</option>
                {stakeholders.map((item, index) => (
                  <option key={index} value={item.stakeholder}>
                    {item.stakeholder}
                  </option>
                ))}
              </select>
              <button
                className="filter-btn"
                onClick={() =>
                  handleAddFilter(
                    'stakeholders',
                    document.getElementById('stakeholders').value,
                  )
                }
              >
                +
              </button>
            </div>
            <div className="selected-filters">
              {selectedFilters.stakeholders.map((item, index) => (
                <div className="badge stakeholder-label" key={index}>
                  {item}
                  <button
                    type="button"
                    className="remove-label-btn"
                    onClick={() => handleRemoveFilter('stakeholders', item)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/** Scales */}
            <div className="filter-field">
              <label>Scales:</label>
              <select id="scales">
                <option value="">Select</option>
                {scales.map((item, index) => (
                  <option key={index} value={item.scale}>
                    {item.scale}
                  </option>
                ))}
              </select>
              <button
                className="filter-btn"
                onClick={() =>
                  handleAddFilter(
                    'scales',
                    document.getElementById('scales').value,
                  )
                }
              >
                +
              </button>
            </div>
            <div className="selected-filters">
              {selectedFilters.scales.map((item, index) => (
                <div className="badge stakeholder-label" key={index}>
                  {item}
                  <button
                    type="button"
                    className="remove-label-btn"
                    onClick={() => handleRemoveFilter('scales', item)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/** Types */}
            <div className="filter-field">
              <label>Types:</label>
              <select id="types">
                <option value="">Select</option>
                {types.map((item, index) => (
                  <option key={index} value={item.type_name}>
                    {item.type_name}
                  </option>
                ))}
              </select>
              <button
                className="filter-btn"
                onClick={() =>
                  handleAddFilter(
                    'types',
                    document.getElementById('types').value,
                  )
                }
              >
                +
              </button>
            </div>
            <div className="selected-filters">
              {selectedFilters.types.map((item, index) => (
                <div className="badge stakeholder-label" key={index}>
                  {item}
                  <button
                    type="button"
                    className="remove-label-btn"
                    onClick={() => handleRemoveFilter('types', item)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/** Languages */}
            <div className="filter-field">
              <label>Languages:</label>
              <select id="languages">
                <option value="">Select</option>
                {languages.map((item, index) => (
                  <option key={index} value={item.language_id.trim()}>
                    {item.language_name.trim()}
                  </option>
                ))}
              </select>
              <button
                className="filter-btn"
                onClick={() =>
                  handleAddFilter(
                    'languages',
                    document.getElementById('languages').value,
                  )
                }
              >
                +
              </button>
            </div>
            <div className="selected-filters">
              {selectedFilters.languages.map((item, index) => (
                <div className="badge stakeholder-label" key={index}>
                  {item}
                  <button
                    type="button"
                    className="remove-label-btn"
                    onClick={() => handleRemoveFilter('languages', item)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Filter.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  selectedFilters: PropTypes.object.isRequired,
  setSelectedFilters: PropTypes.func.isRequired,
  searchBy: PropTypes.string.isRequired,
  setSearchBy: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired,
};
