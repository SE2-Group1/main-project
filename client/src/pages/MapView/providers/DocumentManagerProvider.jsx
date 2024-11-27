import PropTypes from 'prop-types';

import { DocumentManagerContext } from '../contexts/DocumentManagerContext';

export const DocumentManagerProvider = ({
  children,
  documentData,
  setDocumentData,
  docInfo,
  setDocInfo,
}) => {
  return (
    <DocumentManagerContext.Provider
      value={{ documentData, setDocumentData, docInfo, setDocInfo }}
    >
      {children}
    </DocumentManagerContext.Provider>
  );
};

DocumentManagerProvider.propTypes = {
  docInfo: PropTypes.object,
  setDocInfo: PropTypes.func,
  children: PropTypes.node.isRequired,
  documentData: PropTypes.object,
  setDocumentData: PropTypes.func,
};
