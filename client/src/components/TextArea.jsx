import PropTypes from 'prop-types';

export const TextArea = ({
  style,
  value,
  handleChange,
  placeholder,
  required,
  error,
  rows,
  cols,
  className,
}) => {
  return (
    <textarea
      className={`textarea ${className}`}
      style={{
        ...style,
        border: error ? '1px solid #EF4444' : '1px solid #CECECE',
        resize: 'none',
        padding: '7px',
      }}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      cols={cols}
    ></textarea>
  );
};

TextArea.propTypes = {
  style: PropTypes.object,
  value: PropTypes.any,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
  rows: PropTypes.number,
  cols: PropTypes.number,
  className: PropTypes.string,
};

TextArea.defaultProps = {
  rows: 5,
  cols: 30,
  error: false,
  required: false,
  className: '',
};
