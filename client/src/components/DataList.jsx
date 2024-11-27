import PropTypes from 'prop-types';

export const DataList = ({
  list,
  placeholder,
  required,
  id,
  pattern,
  onChange,
  defaultValue,
}) => {
  return (
    <>
      <input
        className="Datalist"
        type="text"
        list={id}
        placeholder={placeholder}
        pattern={pattern}
        required={required}
        onChange={onChange}
        defaultValue={defaultValue}
      />
      <datalist id={id}>
        {list.map(element => (
          <option key={element} value={element}>
            {element}
          </option>
        ))}
      </datalist>
    </>
  );
};

DataList.propTypes = {
  list: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  id: PropTypes.string,
  pattern: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
};
