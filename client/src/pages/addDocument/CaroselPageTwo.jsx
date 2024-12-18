import { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { DataList } from '../../components/DataList.jsx';
import { useDocumentManagerContext } from '../MapView/contexts/DocumentManagerContext.js';
import './style.css';

export const CaroselPageTwo = ({ elementData, mode }) => {
  const { setDocumentData, docInfo, setDocInfo } = useDocumentManagerContext();
  const [language, setLanguage] = useState('');
  const isModified = mode === 'modify';
  const labelIcon = isModified ? (
    <img src="/icons/editIcon.svg" alt="EditIcon" />
  ) : (
    <span style={{ color: 'red' }}>*</span>
  );
  const pencilIcon = isModified && (
    <img src="/icons/editIcon.svg" alt="EditIcon" />
  );

  if (docInfo === null && isModified) return null;
  return (
    <Form>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label column={true}>Type {labelIcon}</Form.Label>
            <DataList
              id="types"
              placeholder="Enter a type"
              list={elementData.types.map(type => type.type_name)}
              defaultValue={isModified ? docInfo.type : ''}
              required
              onChange={e => {
                isModified
                  ? setDocInfo(prev => ({ ...prev, type: e.target.value }))
                  : setDocumentData('type', e.target.value);
              }}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Label column={true}>Language {pencilIcon}</Form.Label>
          <Form.Select
            className="custom-input"
            value={isModified ? docInfo.language : language}
            onChange={e => {
              if (isModified) {
                setDocInfo(prev => ({
                  ...prev,
                  language: e.target.value,
                }));
              } else {
                setLanguage(e.target.value);
                setDocumentData('language', e.target.value);
              }
            }}
          >
            <option value="">Language</option>
            {elementData.languages.map(item => (
              <option key={item.language_id} value={item.language_name}>
                {item.language_name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="formGridAddress2">
        <Form.Label className="mt-2" column={true}>
          Description{labelIcon}
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          style={{ resize: 'none', height: '100%' }}
          defaultValue={isModified ? docInfo.desc : ''}
          className="input-text text-edit-manage-document"
          placeholder="Enter a description of the document"
          minLength={10}
          onChange={e => {
            isModified
              ? setDocInfo(prev => ({
                  ...prev,
                  desc: e.target.value,
                }))
              : setDocumentData('description', e.target.value);
          }}
          required
        />
      </Form.Group>
    </Form>
  );
};

CaroselPageTwo.propTypes = {
  elementData: PropTypes.object.isRequired,
  mode: PropTypes.string,
};
