import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { DataList } from '../../components/DataList.jsx';
import {
  getDays,
  getMonths,
  getPastYears,
  isNotFutureDate,
} from '../../utils/Date.js';
import { useDocumentManagerContext } from '../MapView/contexts/DocumentManagerContext.js';
import './AddDocument.css';

export const CaroselPageOne = ({ elementData, mode, error, setError }) => {
  const { documentData, setDocumentData, docInfo, setDocInfo } =
    useDocumentManagerContext();
  const isModified = mode === 'modify';
  const labelIcon = isModified ? (
    <img src="/icons/editIcon.svg" alt="EditIcon" />
  ) : (
    <span style={{ color: 'red' }}>*</span>
  );
  const [selectedDate, setSelectedDate] = useState({
    year: '',
    month: null,
    day: null,
  });
  const [selectedStakeholder, setSelectedStakeholder] = useState('');
  const mapKeyToField = key => {
    if (key === 'year') return 'issuance_year';
    if (key === 'month') return 'issuance_month';
    if (key === 'day') return 'issuance_day';
    return key;
  };

  const handleDateChange = key => e => {
    const value = e.target.value;

    if (isModified) {
      setDocInfo(prev => {
        const mappedKey = mapKeyToField(key);
        const updatedDate = { ...prev, [mappedKey]: value };
        console.log(updatedDate);
        const { issuance_year, issuance_month, issuance_day } = updatedDate;
        console.log(
          `aa: ${issuance_day} bb: ${issuance_month} cc: ${issuance_year}`,
        );
        if (
          (mappedKey === 'issuance_day' && !issuance_month && value) ||
          (mappedKey === 'issuance_month' && !value && issuance_day)
        ) {
          setError('Please select a valid month before choosing a day.');
          return updatedDate;
        }

        if (
          issuance_year &&
          issuance_month &&
          !isNotFutureDate(issuance_year, issuance_month, issuance_day)
        ) {
          setError('The selected date cannot be in the future.');
          return updatedDate;
        }
        setError('');
        return updatedDate;
      });
    } else {
      const updatedDate = { ...selectedDate, [key]: value };
      setSelectedDate(prev => ({ ...prev, [key]: value }));
      if (
        (key === 'day' && !updatedDate.month && value) ||
        (key === 'month' && !value && updatedDate.day)
      ) {
        setError('Please select a valid month before choosing a day.');
        return updatedDate;
      }

      const { year, month, day } = updatedDate;
      if (year && month && !isNotFutureDate(year, month, day)) {
        setError('The selected date cannot be in the future.');
        return updatedDate;
      }

      setError('');
      // console.log({ key: key, value: value });
      // setDocumentData('issuanceDate', { key: key, value: value });
    }
  };

  useEffect(() => {
    Object.entries(selectedDate).forEach(([key, value]) => {
      setDocumentData('issuanceDate', { key, value });
    });
  }, [selectedDate]);

  const addStakeholder = () => {
    if (selectedStakeholder && isModified) {
      const newStakeholder = docInfo.stakeholder.find(
        s => s === selectedStakeholder,
      );
      const stakeholderToAdd = newStakeholder
        ? newStakeholder.stakeholder
        : selectedStakeholder;

      if (stakeholderToAdd && !docInfo.stakeholder.includes(stakeholderToAdd)) {
        setDocInfo(prev => ({
          ...prev,
          stakeholder: [...prev.stakeholder, stakeholderToAdd],
        }));
      }
    } else {
      const newStakeholder = elementData.stakeholders.find(
        s => s.stakeholder === selectedStakeholder,
      );
      const stakeholderToAdd = newStakeholder
        ? newStakeholder.stakeholder
        : selectedStakeholder;
      if (
        stakeholderToAdd &&
        !documentData.stakeholders.includes(stakeholderToAdd)
      ) {
        setDocumentData('stakeholders', [
          ...documentData.stakeholders,
          stakeholderToAdd,
        ]);
      }
    }
    setSelectedStakeholder('');
  };

  const removeStakeholder = stakeholderIdToRemove => {
    isModified
      ? setDocInfo(prev => ({
          ...prev,
          stakeholder: prev.stakeholder.filter(
            stakeholderId => stakeholderId !== stakeholderIdToRemove,
          ),
        }))
      : setDocumentData(
          'stakeholders',
          documentData.stakeholders.filter(
            stakeholderId => stakeholderId !== stakeholderIdToRemove,
          ),
        );
  };

  const displayStakeholders = stakeholders => {
    return (
      stakeholders &&
      stakeholders.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {stakeholders.map(stakeholder => {
            return (
              <span key={stakeholder} className="badge stakeholder-label">
                {stakeholder}
                <button
                  type="button"
                  className="remove-label-btn"
                  onClick={() => {
                    removeStakeholder(stakeholder);
                  }}
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )
    );
  };

  return (
    <Form>
      <Form.Group controlId="formGridTitle">
        <Form.Label column={true}>Title {labelIcon}</Form.Label>
        <Form.Control
          className="input-text text-edit-manage-document"
          placeholder="Enter title"
          required
          minLength={5}
          defaultValue={isModified ? docInfo.title : ''}
          onChange={e => {
            if (isModified) {
              setDocInfo(prev => ({ ...prev, title: e.target.value }));
            } else {
              setDocumentData('title', e.target.value);
            }
          }}
        />
      </Form.Group>
      <Form.Group controlId="formGridScale">
        <Form.Label className="mt-2" column={true}>
          Scale {labelIcon}
        </Form.Label>
        <DataList
          id="scales"
          placeholder="Enter a scale"
          list={elementData.scales.map(scale => scale.scale)}
          defaultValue={isModified ? docInfo.scale : ''}
          required
          onChange={e => {
            isModified
              ? setDocInfo(prev => ({ ...prev, scale: e.target.value }))
              : setDocumentData('scale', e.target.value);
          }}
        />
      </Form.Group>
      <Form.Group controlId="formGridDate">
        <Form.Label className="mt-2" column={true}>
          Issuance Date {labelIcon}
        </Form.Label>
        <Row>
          <Col>
            <Form.Select
              className="custom-input"
              required
              onChange={handleDateChange('year')}
              defaultValue={isModified ? docInfo.issuance_year : ''}
            >
              <option value="">Year *</option>
              {getPastYears().map(item => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Select
              className="custom-input"
              onChange={handleDateChange('month')}
              defaultValue={isModified ? docInfo.issuance_month : ''}
            >
              <option value="">Month</option>
              {getMonths().map(item => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Select
              className="custom-input"
              defaultValue={isModified ? docInfo.issuance_day : ''}
              onChange={handleDateChange('day')}
            >
              <option value="">Day</option>
              {getDays(
                isModified
                  ? docInfo.issuance_year
                  : documentData.issuanceDate.year,
                isModified
                  ? docInfo.issuance_month
                  : documentData.issuanceDate.month,
              ).map(item => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        <Row>
          {error && (
            <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>
          )}
        </Row>
      </Form.Group>
      <Form.Group controlId="formGridScale">
        <Form.Label column={true}>Stakeholders {labelIcon}</Form.Label>
        <Row>
          <Col md={10}>
            <DataList
              id="stakeholders"
              placeholder="Enter a stakeholder"
              list={elementData.stakeholders.map(
                stakeholder => stakeholder.stakeholder,
              )}
              value={selectedStakeholder}
              defaultValue={selectedStakeholder}
              onChange={e => {
                setSelectedStakeholder(e.target.value);
              }}
            />
          </Col>
          <Col md={2}>
            <Button
              className="d-flex justify-content-center"
              onClick={addStakeholder}
            >
              +
            </Button>
          </Col>

          {isModified
            ? displayStakeholders(docInfo.stakeholder)
            : displayStakeholders(documentData.stakeholders)}
        </Row>
      </Form.Group>
    </Form>
  );
};

CaroselPageOne.propTypes = {
  elementData: PropTypes.object.isRequired,
  mode: PropTypes.string,
  error: PropTypes.object,
  setError: PropTypes.func,
};
