import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import PropTypes from 'prop-types';

const DateRangePicker = ({
  dateRange,
  setDateRange,
  handleAddFilter,
  handleRemoveAppliedFilter,
}) => {
  const [startDate, endDate] = dateRange;

  const handleChange = update => {
    // Check if user has typed a date
    const [newStartDate, newEndDate] = update;

    if (newStartDate && newEndDate) {
      // If both dates are valid, apply the filter
      handleAddFilter('startDate', `${newStartDate.toLocaleDateString()}`);
      handleAddFilter('endDate', `${newEndDate.toLocaleDateString()}`);
    } else if (newStartDate && !newEndDate) {
      handleAddFilter('startDate', `${newStartDate.toLocaleDateString()}`);
    } else if (!newStartDate && !newEndDate) {
      handleRemoveAppliedFilter('Date');
    }

    // Update the date range state
    setDateRange(update);
  };

  const handleDateChange = update => {
    setDateRange([]);
    handleChange(update);
  };

  return (
    <DatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      onChange={handleDateChange}
      isClearable={true}
      placeholderText="Select Date"
      dateFormat="MM/dd/yyyy" // Optional: Define the date format to help users
    />
  );
};

export default DateRangePicker;

DateRangePicker.propTypes = {
  dateRange: PropTypes.array.isRequired,
  setDateRange: PropTypes.func.isRequired,
  handleAddFilter: PropTypes.func,
  handleRemoveAppliedFilter: PropTypes.func,
};
