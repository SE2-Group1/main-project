import PropTypes from 'prop-types';

import './style.css';

/**
 * exception: is a boolean used when it is not required to display the red dot, even if the field is mandatory
 */
export const DropDownAddDocument = ({
  elementList,
  dropDownName,
  labelText,
  required,
  exception,
  handleChange,
}) => {
  return (
    <div className="dropdown-add-document">
      <label className={`label-form ${!labelText ? 'visually-hidden' : ''} `}>
        {labelText}
        {required && !exception && (
          <span className="help-inline" style={{ color: 'red' }}>
            *
          </span>
        )}
      </label>
      <select
        className="form-select custom-input add-document-input"
        id="DropDownButton"
        name={dropDownName}
        defaultValue=""
        required={required}
        onChange={handleChange}
      >
        <option value="">{dropDownName}</option>
        {elementList.map(element => (
          <option key={element} value={element}>
            {element}
          </option>
        ))}
      </select>
    </div>
  );
};

DropDownAddDocument.propTypes = {
  elementList: PropTypes.arrayOf(PropTypes.string).isRequired,
  dropDownName: PropTypes.string.isRequired,
  labelText: PropTypes.string,
  required: PropTypes.bool,
  exception: PropTypes.bool,
  handleChange: PropTypes.func.isRequired,
};
