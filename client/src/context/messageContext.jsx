import { createContext, useContext, useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';

// Create the context
const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const timeoutRef = useRef(null); // Keep track of the timeout

  const showMessage = (msg, type) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the new message
    setMessage({ msg, type });

    // Set a new timeout to clear the message after 5 seconds
    timeoutRef.current = setTimeout(() => {
      clearMessage();
    }, 5000);
  };

  const clearMessage = () => {
    setMessage(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear the timeout if clearMessage is called manually
    }
  };

  // Clean up the timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <MessageContext.Provider value={{ message, showMessage, clearMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

// PropTypes validation for MessageProvider
MessageProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate the children prop
};

// Custom hook to use the MessageContext
export const useMessageContext = () => {
  return useContext(MessageContext);
};

export default MessageContext;
