import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import PropTypes from 'prop-types';

const DateRangePicker = ({ dateRange, setDateRange, handleAddFilter }) => {
  const [startDate, endDate] = dateRange;

  const handleChange = update => {
    console.log('here');
    if (update[0] && !update[1])
      handleAddFilter('startDate', `${update[0].toLocaleDateString()}`);
    if (update[0] && update[1])
      handleAddFilter('endDate', `${update[1].toLocaleDateString()}`);
    setDateRange(update);
  };

  return (
    <DatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      onChange={update => {
        setDateRange([]);
        handleChange(update);
      }}
      isClearable={true}
      placeholderText="Select Date"
    />
  );
};

export default DateRangePicker;

DateRangePicker.propTypes = {
  dateRange: PropTypes.Array.isRequired,
  setDateRange: PropTypes.func.isRequired,
  handleAddFilter: PropTypes.func,
};
