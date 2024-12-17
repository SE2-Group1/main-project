import { useEffect, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

import PropTypes from 'prop-types';

import API from '../services/API';
import DateRangePicker from './DateRangePicker';
import './style.css';
import filterIcon from '/icons/filter-icon.svg';
import resetIcon from '/icons/reset-icon.svg';

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
  const [dateRange, setDateRange] = useState([null, null]);

  const popupRef = useRef(null);
  const filterIconRef = useRef(null);

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

  const handleAddFilter = (field, value) => {
    if (!value) return;

    if (field === 'startDate' || field === 'endDate') {
      setSelectedFilters(prev => ({
        ...prev,
        [field]: [value],
      }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [field]: [...new Set([...prev[field], value])],
      }));
    }
  };

  const handleRemoveFilter = (field, value) => {
    if (field === 'dates') {
      setSelectedFilters(prev => ({
        ...prev,
        startDate: [],
        endDate: [],
      }));
      setDateRange([]);
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [field]: prev[field].filter(item => item !== value),
      }));
    }
  };

  const handleApplyFilters = () => {
    const applied = [];
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (key === 'startDate' || key === 'endDate') return;
      values.forEach(value => {
        applied.push(`${key.slice(0, -1)}: ${value}`);
      });
    });

    // Handle date filters
    if (dateRange[0] && dateRange[1]) {
      const from = dateRange[0].toLocaleDateString();
      const to = dateRange[1].toLocaleDateString();
      if (from !== to) {
        applied.push(`Date: ${from} - ${to}`);
      } else if (from === to) {
        applied.push(`Date: ${from}`);
      }
    }

    setAppliedFilters(applied);
    setShowFilterPopup(false);
  };

  const handleRemoveAppliedFilter = filter => {
    const [category] = filter.split(': ');

    const field = category.toLowerCase() + 's'; // Re-add "s" for plural key
    const value = filter.split(': ')[1];
    handleRemoveFilter(field, value);
    setAppliedFilters(appliedFilters.filter(item => item !== filter));
  };

  // Close the popup when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      // Check if the click is outside both the popup and the filter icon
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        filterIconRef.current &&
        !filterIconRef.current.contains(event.target)
      ) {
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

  const clearAllFilters = () => {
    setSelectedFilters({
      stakeholders: [],
      scales: [],
      types: [],
      languages: [],
      startDate: [],
      endDate: [],
    });
    setDateRange([null, null]);
    setAppliedFilters([]);
    setSearch('');
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <input
          type="text"
          className="form-control"
          style={{ width: '250px', height: '30px', borderRadius: '10px' }}
          placeholder={`Search by ${searchBy}`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <img
          src={filterIcon}
          alt="Filter"
          className="filter-icon"
          ref={filterIconRef} // Reference to the filter icon
          onClick={() => setShowFilterPopup(prev => !prev)} // Toggle popup visibility
        />
        {appliedFilters.length > 0 && (
          <img
            src={resetIcon}
            alt="Reset"
            className="filter-icon"
            onClick={clearAllFilters} // Clear all filters
          />
        )}
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
          <div className="filter-radio">
            <label style={{ marginBottom: '10px' }}>Search by:</label>
            <div>
              <label>
                <input
                  type="radio"
                  value="Title"
                  checked={searchBy === 'Title'}
                  onChange={e => setSearchBy(e.target.value)}
                />
                Title
              </label>
              <label style={{ marginLeft: '50px' }}>
                <input
                  type="radio"
                  value="Description"
                  checked={searchBy === 'Description'}
                  onChange={e => setSearchBy(e.target.value)}
                />
                Description
              </label>
            </div>
          </div>

          <hr />
          <div className="filter-fields">
            <div className="date-field">
              <label>Issue Date:</label>
              <DateRangePicker
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleAddFilter={handleAddFilter}
                handleRemoveAppliedFilter={handleRemoveAppliedFilter}
              ></DateRangePicker>
            </div>

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
};
