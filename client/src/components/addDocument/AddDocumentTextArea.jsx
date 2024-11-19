import PropTypes from 'prop-types';

import { TextArea } from '../TextArea.jsx';
import './style.css';

export const AddDocumentTextArea = ({
  labelText,
  textAreaStyle,
  labelStyle,
  placeholder,
  required,
  setDocumentInfoToAdd,
  fieldToChange,
  rows,
  cols,
}) => {
  const handleChange = e => {
    setDocumentInfoToAdd(fieldToChange, e.target.value);
  };

  return (
    <div>
      <label className="d-flex label-form" style={labelStyle}>
        {labelText}
        {required && (
          <span className="help-inline" style={{ color: 'red' }}>
            *
          </span>
        )}
      </label>
      <TextArea
        placeholder={placeholder}
        required={required}
        handleChange={e => handleChange(e)}
        style={{
          width: '100%',
          height: '120px',
          marginTop: '0px',
          borderRadius: '10px',
          ...textAreaStyle,
        }}
        rows={rows}
        cols={cols}
      />
    </div>
  );
};

AddDocumentTextArea.propTypes = {
  labelText: PropTypes.string.isRequired,
  textAreaStyle: PropTypes.object,
  labelStyle: PropTypes.object,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  setDocumentInfoToAdd: PropTypes.func.isRequired,
  fieldToChange: PropTypes.string.isRequired,
  rows: PropTypes.number,
  cols: PropTypes.number,
};
