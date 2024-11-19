import { useState } from 'react';

export const useDocumentInfos = initialValue => {
  const [documentInfosToAdd, setDocumentInfosToAdd] = useState(initialValue);

  const modifyDocumentInfosToAdd = (key, value) => {
    if (key === 'issuanceDate') {
      setDocumentInfosToAdd(prevInfos => ({
        ...prevInfos,
        issuanceDate: {
          ...prevInfos.issuanceDate,
          [value.key]: value.value,
        },
      }));
    } else {
      setDocumentInfosToAdd(prevInfos => ({
        ...prevInfos,
        [key]: value,
      }));
    }
  };

  return [documentInfosToAdd, modifyDocumentInfosToAdd];
};
