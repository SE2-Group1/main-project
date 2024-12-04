import { useMemo } from 'react';

import PropTypes from 'prop-types';

import { DocumentManagerContext } from '../contexts/DocumentManagerContext';

export const DocumentManagerProvider = ({
  children,
  documentData,
  setDocumentData,
  docInfo,
  setDocInfo,
}) => {
  const contextValue = useMemo(
    () => ({
      documentData,
      setDocumentData,
      docInfo,
      setDocInfo,
    }),
    [documentData, setDocumentData, docInfo, setDocInfo],
  );

  return (
    <DocumentManagerContext.Provider value={contextValue}>
      {children}
    </DocumentManagerContext.Provider>
  );
};

DocumentManagerProvider.propTypes = {
  docInfo: PropTypes.object,
  setDocInfo: PropTypes.func,
  children: PropTypes.node.isRequired,
  documentData: PropTypes.object.isRequired,
  setDocumentData: PropTypes.func.isRequired,
};
