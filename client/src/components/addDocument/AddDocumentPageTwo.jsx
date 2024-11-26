import { Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { useDocumentManagerContext } from '../../pages/MapView/contexts/DocumentManagerContext.js';
import { AddDocumentInputText } from './AddDocumentInputText.jsx';
import { AddDocumentTextArea } from './AddDocumentTextArea.jsx';
import { DropDownAddDocument } from './DropDownAddDocument.jsx';

export const AddDocumentPageTwo = ({ dropDownListElements }) => {
  const { setDocumentData } = useDocumentManagerContext();
  const handleChange = key => e => {
    setDocumentData(key, e.target.value);
  };

  return (
    <form>
      <Row>
        <Col>
          <DropDownAddDocument
            elementList={dropDownListElements.types.map(type => type.type_name)}
            dropDownName="Select a type"
            labelText="Type"
            required
            handleChange={handleChange('type')}
          />
        </Col>
        <Col>
          <DropDownAddDocument
            elementList={dropDownListElements.languages.map(
              language => language.language_name,
            )}
            dropDownName="Select a language"
            labelText="Language"
            handleChange={handleChange('language')}
          />
        </Col>
      </Row>
      <AddDocumentInputText
        min={0}
        labelText="Pages"
        placeholder="Enter number of pages"
        type="text"
        setDocumentInfoToAdd={setDocumentData}
        fieldToChange="pages"
        pattern="[0-9]+(-[0-9]+)?"
      />
      <AddDocumentTextArea
        labelText="Description"
        placeholder="Enter a description of the document"
        setDocumentInfoToAdd={setDocumentData}
        fieldToChange="description"
        required
      />
    </form>
  );
};

AddDocumentPageTwo.propTypes = {
  isAdding: PropTypes.bool,
  dropDownListElements: PropTypes.object,
  setDocumentInfoToAdd: PropTypes.func,
};
