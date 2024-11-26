import PropTypes from 'prop-types';

import { DocumentManagerContext } from '../contexts/DocumentManagerContext';

export const DocumentManagerProvider = ({
  children,
  documentData,
  setDocumentData,
}) => {
  return (
    <DocumentManagerContext.Provider value={{ documentData, setDocumentData }}>
      {children}
    </DocumentManagerContext.Provider>
  );
};

DocumentManagerProvider.propTypes = {
  children: PropTypes.node.isRequired,
  documentData: PropTypes.object.isRequired,
  setDocumentData: PropTypes.func.isRequired,
};
