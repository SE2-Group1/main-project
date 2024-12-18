import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../../contexts/FeedbackContext';
import API from '../../../services/API';
import { getIconByLinkType } from '../../../utils/diagram';
import { getIconByType } from '../../../utils/map';
import './styles.css';

export const DiagramLegend = forwardRef(
  (
    {
      setNodes,
      setFilteredNodes,
      originalNodes,
      docsForConnections,
      setEdges,
      setFilteredEdges,
      originalEdges,
    },
    ref,
  ) => {
    const [docTypes, setDocTypes] = useState([]);
    const [linkTypes, setLinkTypes] = useState([]);
    const [filteredDocTypes, setFilteredDocTypes] = useState([]);
    const [filteredLinkTypes, setFilteredLinkTypes] = useState([]);
    const { showToast } = useFeedbackContext();

    useImperativeHandle(ref, () => ({
      resetFilters,
    }));
    useEffect(() => {
      const fetchData = async () => {
        try {
          const [docTypesResponse, linkTypesResponse] = await Promise.all([
            API.getTypes(),
            API.getLinkTypes(),
          ]);
          const docTypes = await docTypesResponse.map(type => type.type_name);
          const linkTypes = await linkTypesResponse.map(type => type.link_type);
          setDocTypes(docTypes);
          setLinkTypes(linkTypes);
          setFilteredDocTypes(
            docTypes.reduce((acc, type) => {
              acc[type] = true;
              return acc;
            }, {}),
          );
          setFilteredLinkTypes(
            linkTypes.reduce((acc, type) => {
              acc[type] = true;
              return acc;
            }, {}),
          );
        } catch {
          showToast('Failed to fetch diagram data', 'error');
        }
      };
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onNodeTypeClick = type => {
      if (Object.values(filteredDocTypes).every(val => val === true)) {
        setFilteredDocTypes(prev => {
          const newState = {};
          Object.keys(prev).forEach(key => {
            newState[key] = false;
          });
          newState[type] = true;
          return newState;
        });
      } else if (
        Object.values(filteredDocTypes).filter(val => val === false).length ===
          docTypes.length - 1 &&
        filteredDocTypes[type]
      ) {
        setFilteredDocTypes(prev => {
          const newState = {};
          Object.keys(prev).forEach(key => {
            newState[key] = true;
          });
          return newState;
        });
      } else {
        setFilteredDocTypes(prev => ({
          ...prev,
          [type]: !prev[type],
        }));
      }
    };

    const onLinkTypeClick = type => {
      if (Object.values(filteredLinkTypes).every(val => val === true)) {
        setFilteredLinkTypes(prev => {
          const newState = {};
          Object.keys(prev).forEach(key => {
            newState[key] = false;
          });
          newState[type] = true;
          return newState;
        });
      } else if (
        Object.values(filteredLinkTypes).filter(val => val === false).length ===
          linkTypes.length - 1 &&
        filteredLinkTypes[type]
      ) {
        setFilteredLinkTypes(prev => {
          const newState = {};
          Object.keys(prev).forEach(key => {
            newState[key] = true;
          });
          return newState;
        });
      } else {
        setFilteredLinkTypes(prev => ({
          ...prev,
          [type]: !prev[type],
        }));
      }
    };

    const resetFilters = () => {
      setFilteredDocTypes(prev => {
        const newState = {};
        Object.keys(prev).forEach(key => {
          newState[key] = true;
        });
        return newState;
      });
      setFilteredLinkTypes(prev => {
        const newState = {};
        Object.keys(prev).forEach(key => {
          newState[key] = true;
        });
        return newState;
      });
    };

    useEffect(
      () => {
        const nodes = originalNodes
          .filter(
            node =>
              filteredDocTypes[node.data.type] ||
              docsForConnections.doc1?.id === +node.id ||
              docsForConnections.doc2?.id === +node.id,
          )
          .map(node => ({
            ...node,
            selected:
              +node.id === docsForConnections.doc1?.id ||
              +node.id === docsForConnections.doc2?.id,
          }));
        setFilteredNodes(nodes);
        setNodes(nodes);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [filteredDocTypes, docsForConnections],
    );

    useEffect(
      () => {
        const edges = originalEdges.filter(
          edge => filteredLinkTypes[edge.type],
        );
        setFilteredEdges(edges);
        setEdges(edges);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [filteredLinkTypes, docsForConnections],
    );

    return (
      <div>
        <h5>Node types:</h5>
        {docTypes &&
          docTypes.map((type, index) => (
            <div
              key={index}
              className={`node-types ${filteredDocTypes[type] ? '' : 'not-selected'} d-flex align-items-center flex-no-wrap`}
              onClick={() => onNodeTypeClick(type)}
            >
              <img
                src={getIconByType(type)}
                height={25}
                width={25}
                className="me-2"
              />
              <span>{type}</span>
            </div>
          ))}
        {Object.values(filteredDocTypes).some(val => val === false) && (
          <a
            className="hyperlink mt-2"
            onClick={() =>
              setFilteredDocTypes(prev => {
                const newState = {};
                Object.keys(prev).forEach(key => {
                  newState[key] = true;
                });
                return newState;
              })
            }
          >
            Reset filter
          </a>
        )}
        <h5 className="mt-5">Connection types:</h5>
        {linkTypes &&
          linkTypes.map((type, index) => (
            <div
              key={index}
              className={`link-types ${filteredLinkTypes[type] ? '' : 'not-selected'} d-flex align-items-center flex-no-wrap`}
              onClick={() => onLinkTypeClick(type)}
            >
              <img src={getIconByLinkType(type)} className="me-2" />
              <span>{type}</span>
            </div>
          ))}
        {Object.values(filteredLinkTypes).some(val => val === false) && (
          <a
            className="hyperlink mt-2"
            onClick={() =>
              setFilteredLinkTypes(prev => {
                const newState = {};
                Object.keys(prev).forEach(key => {
                  newState[key] = true;
                });
                return newState;
              })
            }
          >
            Reset filter
          </a>
        )}
      </div>
    );
  },
);

DiagramLegend.propTypes = {
  setNodes: PropTypes.func.isRequired,
  setFilteredNodes: PropTypes.func.isRequired,
  originalNodes: PropTypes.array.isRequired,
  docsForConnections: PropTypes.object.isRequired,
  setEdges: PropTypes.func.isRequired,
  setFilteredEdges: PropTypes.func.isRequired,
  originalEdges: PropTypes.array.isRequired,
};

DiagramLegend.displayName = 'DiagramLegend';
