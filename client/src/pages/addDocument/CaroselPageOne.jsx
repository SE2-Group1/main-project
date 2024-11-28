import { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { DataList } from '../../components/DataList.jsx';
import { getDays, getMonths, getPastYears } from '../../utils/Date.js';
import { useDocumentManagerContext } from '../MapView/contexts/DocumentManagerContext.js';
import './AddDocument.css';

export const CaroselPageOne = ({ elementData, mode }) => {
  const { documentData, setDocumentData, docInfo, setDocInfo } =
    useDocumentManagerContext();
  const isModified = mode === 'modify';
  const labelIcon = isModified ? (
    <img src="/icons/editIcon.svg" alt="EditIcon" />
  ) : (
    <span style={{ color: 'red' }}>*</span>
  );
  const [selectedStakeholder, setSelectedStakeholder] = useState('');
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
        setSelectedStakeholder('');
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
        !documentData.stakeholders.includes(stakeholderToAdd.stakeholder)
      ) {
        setDocumentData('stakeholders', [
          ...documentData.stakeholders,
          stakeholderToAdd,
        ]);
        setSelectedStakeholder('');
      }
    }
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
          pattern="1:[0-9]{1,6}"
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
              onChange={e => {
                isModified
                  ? setDocInfo(prev => ({
                      ...prev,
                      issuance_year: e.target.value,
                    }))
                  : setDocumentData('issuanceDate', {
                      key: 'year',
                      value: e.target.value,
                    });
              }}
            >
              {isModified ? (
                <option value={docInfo.issuance_year}>
                  {docInfo.issuance_year}
                </option>
              ) : (
                <option value="">Year</option>
              )}
              {getPastYears().map(item => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Select
              className="custom-input"
              defaultValue="Month"
              onChange={e => {
                isModified
                  ? setDocInfo(prev => ({
                      ...prev,
                      issuance_month: e.target.value,
                    }))
                  : setDocumentData('issuanceDate', {
                      key: 'month',
                      value: e.target.value,
                    });
              }}
            >
              {isModified ? (
                <option value={docInfo.issuance_month}>
                  {docInfo.issuance_month}
                </option>
              ) : (
                <option value="">Month</option>
              )}
              {getMonths().map(item => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Select
              className="custom-input"
              defaultValue="Day"
              onChange={e => {
                isModified
                  ? setDocInfo(prev => ({
                      ...prev,
                      issuance_day: e.target.value,
                    }))
                  : setDocumentData('issuanceDate', {
                      key: 'day',
                      value: e.target.value,
                    });
              }}
            >
              {isModified ? (
                <option value={docInfo.issuance_day}>
                  {docInfo.issuance_day}
                </option>
              ) : (
                <option value="">Day</option>
              )}
              {getDays().map(item => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Col>
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
  documentInfo: PropTypes.object,
  setDocumentInfo: PropTypes.func,
  mode: PropTypes.string,
};
