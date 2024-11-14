import React from 'react';

export const FeedbackContext = React.createContext(undefined);
export const useFeedbackContext = () => {
  const context = React.useContext(FeedbackContext);
  if (!context) {
    throw new Error(
      'useFeedbackContext must be used within a FeedbackProvider',
    );
  }
  return context;
};
