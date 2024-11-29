import React from 'react';

export const DocumentManagerContext = React.createContext(undefined);
export const useDocumentManagerContext = () => {
  const context = React.useContext(DocumentManagerContext);
  if (!context) {
    throw new Error(
      'useDocumentManagerContext must be used within a DocumentManagerProvider',
    );
  }
  return context;
};
