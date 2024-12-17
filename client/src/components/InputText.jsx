import PropTypes from 'prop-types';

export const InputText = ({
  type,
  style,
  min,
  minLength,
  value,
  handleChange,
  placeholder,
  required,
  pattern,
  error,
  className,
  disabled,
}) => {
  return (
    <input
      className={`input-text ${className || ''}`}
      type={type}
      style={{
        ...style,
        border: error ? '1px solid #EF4444' : '1px solid #CECECE',
      }}
      min={min}
      minLength={minLength}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      pattern={pattern}
      disabled={disabled}
    />
  );
};

InputText.propTypes = {
  type: PropTypes.string,
  style: PropTypes.object,
  min: PropTypes.number,
  minLength: PropTypes.number,
  handleChange: PropTypes.func,
  value: PropTypes.any,
  placeholder: PropTypes.string,
  pattern: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};
