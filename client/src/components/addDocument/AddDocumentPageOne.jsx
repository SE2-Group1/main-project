import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { useDocumentManagerContext } from '../../pages/MapView/contexts/DocumentManagerContext.js';
import {
  getDays,
  getMonths,
  getPastYears,
  isNotFutureDate,
} from '../../utils/Date.js';
import { Button } from '../Button.jsx';
import { AddDocumentInputText } from './AddDocumentInputText.jsx';
import { DropDownAddDocument } from './DropDownAddDocument.jsx';

export const AddDocumentPageOne = ({
  dropDownListElements,
  error,
  setError,
}) => {
  const { documentData, setDocumentData } = useDocumentManagerContext();
  const [selectedStakeholder, setSelectedStakeholder] = useState('');
  const [issuanceDate, setIssuanceDate] = useState({
    year: '',
    month: null,
    day: null,
  });

  const addStakeholder = () => {
    if (
      selectedStakeholder &&
      !documentData.stakeholders.includes(selectedStakeholder)
    ) {
      setDocumentData('stakeholders', [
        ...documentData.stakeholders,
        selectedStakeholder,
      ]);
      setSelectedStakeholder('');
    }
  };
  const removeStakeholder = stakeholder => {
    setDocumentData(
      'stakeholders',
      documentData.stakeholders.filter(s => s !== stakeholder),
    );
  };

  const handleDateChange = key => e => {
    const value = e.target.value;

    setIssuanceDate(prev => {
      const updatedDate = { ...prev, [key]: value };
      const { year, month, day } = updatedDate;

      if (!year) {
        setError('Year is required.');
        return updatedDate;
      }

      // Validation checks
      if (
        (key === 'day' && !month && value) ||
        (key === 'month' && !value && day)
      ) {
        setError('Please select a valid month before choosing a day.');
        return updatedDate;
      }

      if (year && month && !isNotFutureDate(year, month, day)) {
        setError('The selected date cannot be in the future.');
        return updatedDate;
      }

      // Clear the error if everything is valid
      setError('');
      return updatedDate;
    });
  };

  useEffect(() => {
    Object.entries(issuanceDate).forEach(([key, value]) => {
      setDocumentData('issuanceDate', { key, value });
    });
  }, [issuanceDate]);

  const handleChange = key => e => {
    setDocumentData(key, e.target.value);
  };

  return (
    <form>
      <AddDocumentInputText
        labelText={'Title'}
        placeholder="Enter document title"
        type="text"
        minLength={5}
        required
        setDocumentInfoToAdd={setDocumentData}
        fieldToChange="title"
      />
      <DropDownAddDocument
        elementList={dropDownListElements.scales.map(scale => scale.scale)}
        dropDownName="Select a scale"
        labelText="Scale"
        required={true}
        handleChange={handleChange('scale')}
      />
      <div>
        <label className="label-form">Issuance Date</label>
        <Row>
          <Col>
            <DropDownAddDocument
              elementList={getPastYears()}
              dropDownName="Year"
              required
              exception
              handleChange={handleDateChange('year')}
            />
          </Col>
          <Col>
            <DropDownAddDocument
              elementList={getMonths()}
              dropDownName="Month"
              handleChange={handleDateChange('month')}
            />
          </Col>
          <Col>
            <DropDownAddDocument
              elementList={getDays(issuanceDate.year, issuanceDate.month)}
              dropDownName="Day"
              handleChange={handleDateChange('day')}
            />
          </Col>
        </Row>
        {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
      </div>
      <Row>
        <Col sm={10}>
          <DropDownAddDocument
            elementList={dropDownListElements.stakeholders.map(
              stakeholder => stakeholder.stakeholder,
            )}
            dropDownName="Select a stakeholder"
            labelText="Stakeholders"
            handleChange={e => setSelectedStakeholder(e.target.value)}
          />
        </Col>

        <Col sm={2} className="align-content-end">
          <Button
            className="d-flex justify-content-center"
            onClick={addStakeholder}
          >
            +
          </Button>
        </Col>
      </Row>
      <Row>
        {documentData.stakeholders && documentData.stakeholders.length > 0 && (
          <div className="mt-2 d-flex flex-wrap gap-2">
            {documentData.stakeholders.map(stakeholder => {
              return (
                <span key={stakeholder} className="badge stakeholder-label">
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
      </Row>
    </form>
  );
};

AddDocumentPageOne.propTypes = {
  isAdding: PropTypes.bool,
  dropDownListElements: PropTypes.object.isRequired,
  error: PropTypes.string.isRequired,
  setError: PropTypes.func.isRequired,
};
