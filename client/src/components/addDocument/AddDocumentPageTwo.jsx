import { Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { useDocumentManagerContext } from '../../pages/MapView/contexts/DocumentManagerContext.js';
import { AddDocumentInputText } from './AddDocumentInputText.jsx';
import { AddDocumentTextArea } from './AddDocumentTextArea.jsx';
import { DropDownAddDocument } from './DropDownAddDocument.jsx';

export const AddDocumentPageTwo = ({ dropDownListElements }) => {
  const { setDocumentData } = useDocumentManagerContext();
  const handleChange = key => e => {
    let value = e.target.value;
    // send the id of the selected language
    if (key === 'language') {
      value = dropDownListElements.languages.find(
        language => language.language_name === e.target.value,
      ).language_id;
    }
    setDocumentData(key, value);
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
  dropDownListElements: PropTypes.object,
};
