import { useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { getDays, getMonths, getPastYears } from '../../utils/Date.js';
import { AddDocumentInputText } from './AddDocumentInputText.jsx';
import { DropDownAddDocument } from './DropDownAddDocument.jsx';

export const AddDocumentPageOne = ({
  dropDownListElements,
  setDocumentInfoToAdd,
  documentInfoToAdd,
}) => {
  const [selectedStakeholder, setSelectedStakeholder] = useState('');

  const addStakeholder = () => {
    if (
      selectedStakeholder &&
      !documentInfoToAdd.stakeholders.includes(selectedStakeholder)
    ) {
      setDocumentInfoToAdd('stakeholders', [
        ...documentInfoToAdd.stakeholders,
        selectedStakeholder,
      ]);
      setSelectedStakeholder('');
    }
  };
  const removeStakeholder = stakeholder => {
    setDocumentInfoToAdd(
      'stakeholders',
      documentInfoToAdd.stakeholders.filter(s => s !== stakeholder),
    );
  };

  const handleDateChange = key => e => {
    setDocumentInfoToAdd('issuanceDate', { key: key, value: e.target.value });
  };
  const handleChange = key => e => {
    setDocumentInfoToAdd(key, e.target.value);
  };

  return (
    <form>
      <AddDocumentInputText
        labelText={'Title'}
        placeholder="Enter document title"
        type="text"
        minLength={5}
        required
        setDocumentInfoToAdd={setDocumentInfoToAdd}
        fieldToChange="title"
      />
      <DropDownAddDocument
        elementList={dropDownListElements.scales.map(scale => scale.scale)}
        dropDownName="Insert a scale"
        labelText="Scale"
        required={true}
        handleChange={handleChange('scale')}
      />
      <label className="label-form">Issuance Date</label>
      <Row>
        <Col>
          <DropDownAddDocument
            elementList={getPastYears()}
            dropDownName="Years"
            required
            exception
            handleChange={handleDateChange('year')}
          />
        </Col>
        <Col>
          <DropDownAddDocument
            elementList={getMonths()}
            dropDownName="Months"
            handleChange={handleDateChange('month')}
          />
        </Col>
        <Col>
          <DropDownAddDocument
            elementList={getDays()}
            dropDownName="Days"
            handleChange={handleDateChange('day')}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={10}>
          <DropDownAddDocument
            elementList={dropDownListElements.stakeholders.map(
              stakeholder => stakeholder.stakeholder,
            )}
            dropDownName="Select a stakerlder"
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
        {documentInfoToAdd.stakeholders &&
          documentInfoToAdd.stakeholders.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {documentInfoToAdd.stakeholders.map(stakeholder => {
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
  setDocumentInfoToAdd: PropTypes.func,
  documentInfoToAdd: PropTypes.object,
};
