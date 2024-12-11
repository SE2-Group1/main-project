import { useEffect, useState } from 'react';

import { useFeedbackContext } from '../../../contexts/FeedbackContext';
import API from '../../../services/API';
import { getIconByLinkType } from '../../../utils/diagram';
import { getIconByType } from '../../../utils/map';

export const DiagramLegend = () => {
  const [docTypes, setDocTypes] = useState([]);
  const [linkTypes, setLinkTypes] = useState([]);
  const { showToast } = useFeedbackContext();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docTypesResponse, linkTypesResponse] = await Promise.all([
          API.getTypes(),
          API.getLinkTypes(),
        ]);
        setDocTypes(await docTypesResponse.map(type => type.type_name));
        setLinkTypes(await linkTypesResponse.map(type => type.link_type));
      } catch {
        showToast('Failed to fetch diagram data', 'error');
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h5>Node types:</h5>
      {docTypes &&
        docTypes.map((type, index) => (
          <div key={index} className="d-flex align-items-center flex-no-wrap">
            <img
              src={getIconByType(type)}
              height={25}
              width={25}
              className="me-2"
            />
            <span>{type}</span>
          </div>
        ))}
      <h5 className="mt-5">Connection types:</h5>
      {linkTypes &&
        linkTypes.map((type, index) => (
          <div key={index} className="d-flex align-items-center flex-no-wrap">
            <img src={getIconByLinkType(type)} className="me-2" />
            <span>{type}</span>
          </div>
        ))}
    </div>
  );
};
