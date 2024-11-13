import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PropTypes from 'prop-types';

import { FeedbackContext } from '../contexts/FeedbackContext';

export const FeedbackProvider = ({ children }) => {
  const showToast = (message, type) => {
    if (type === 'error') {
      toast.error(message);
    } else if (type === 'success') {
      toast.success(message);
    } else if (type === 'warn') {
      toast.warn(message);
    }
  };

  return (
    <FeedbackContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </FeedbackContext.Provider>
  );
};

FeedbackProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
