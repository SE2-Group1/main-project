import PropTypes from 'prop-types';

import { InputText } from '../InputText.jsx';
import './style.css';

export const AddDocumentInputText = ({
  labelText,
  inputTextStyle,
  labelStyle,
  placeholder,
  type,
  min,
  minLength,
  required,
  setDocumentInfoToAdd,
  fieldToChange,
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
      <InputText
        type={type}
        placeholder={placeholder}
        min={min}
        minLength={minLength}
        required={required}
        handleChange={e => handleChange(e)}
        style={{
          width: '100%',
          height: '40px',
          marginTop: '0px',
          borderRadius: '10px',
          ...inputTextStyle,
        }}
      />
    </div>
  );
};

AddDocumentInputText.propTypes = {
  labelText: PropTypes.string.isRequired,
  inputTextStyle: PropTypes.object,
  labelStyle: PropTypes.object,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  min: PropTypes.number,
  minLength: PropTypes.number,
  required: PropTypes.bool,
  setDocumentInfoToAdd: PropTypes.func.isRequired,
  fieldToChange: PropTypes.string.isRequired,
};
