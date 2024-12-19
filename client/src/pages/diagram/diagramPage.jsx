import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../contexts/FeedbackContext';
import { useUserContext } from '../../contexts/UserContext';
import API from '../../services/API';
import { mapToNodes, sortScales } from '../../utils/diagram';
import SidePanel from '../MapView/components/SidePanel';
import { ConnectionsModal } from './components/ConnectionsModal';
import {
  CollateralConsequenceEdge,
  DirectConsequenceEdge,
  ProjectionEdge,
  UpdateEdge,
} from './components/CustomEdge';
import CustomNode from './components/CustomNode';
import { DiagramLegend } from './components/DiagramLegend';
import { EditButtons } from './components/EditButtons';
import { Label } from './components/Label';
import { OverlappingDocsModal } from './components/OverlappingDocsModal';

const nodeTypes = {
  custom: CustomNode,
};

const nodeEdges = {
  'direct consequence': DirectConsequenceEdge,
  'collateral consequence': CollateralConsequenceEdge,
  projection: ProjectionEdge,
  update: UpdateEdge,
};

const defaultZoom = 0.5;
const xGrid = 700;
const yGrid = 300;

// default viewport (scale 0.5)
const defaultViewport = {
  x: 100,
  y: 100,
  zoom: defaultZoom,
};

export const DiagramPage = ({ mode }) => {
  const { showToast } = useFeedbackContext();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { docId } = useParams();
  const { setViewport, setCenter, getIntersectingNodes } = useReactFlow();
  const isViewMode = mode === 'view' ? true : false;
  const isEditingPositions = mode === 'edit-positions' ? true : false;
  const isEditingConnections = mode === 'edit-connections' ? true : false;
  const [scales, setScales] = useState([]);
  const [years, setYears] = useState([]);
  const [originalNodes, setOriginalNodes] = useState([]);
  const [originalEdges, setOriginalEdges] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [filteredEdges, setFilteredEdges] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const [updatedNodesPositions, setUpdatedNodesPositions] = useState([]);
  const [maxX, setMaxX] = useState(10000);
  const [maxY, setMaxY] = useState(10000);
  const [isIntersectionModalOpen, setIsIntersectionModalOpen] = useState(false);
  const [docsForConnections, setDocsForConnections] = useState({
    doc1: null,
    doc2: null,
  });
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const diagramLegendRef = useRef();
  const location = useLocation();
  const { docId: firstDocId, title: firstDocTitle } = location?.state || {};

  useEffect(() => {
    if (isEditingConnections && firstDocId && firstDocTitle) {
      setDocsForConnections({
        doc1: { id: firstDocId, title: firstDocTitle },
        doc2: null,
      });
    }
  }, [isEditingConnections, firstDocId, firstDocTitle, setNodes]);

  useEffect(() => {
    // show modal if there are overlapping nodes
    if (!user || !nodes || isEditingPositions || docId || selectedDocId) return;
    const intersections = nodes.filter(n => n.className === 'highlight2');
    if (intersections.length) {
      setIsIntersectionModalOpen(true);
    }
  }, [user, nodes, isEditingPositions, docId, selectedDocId]);

  useEffect(() => {
    // set axis for the diagram
    if (!scales || !scales.length || !years || !years.length) return;
    const maxX = xGrid * years.length;
    const maxY = yGrid * scales.length;
    setMaxX(maxX);
    setMaxY(maxY);
  }, [scales, years]);

  const fetchDocumentData = useCallback(
    async docId => {
      try {
        const response = await API.getDocument(docId);
        setDocInfo(response);
      } catch {
        showToast('Failed to fetch document data', 'error');
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (!docId || !originalNodes?.length) return;
    // navigate to a document and center it
    setNodes(originalNodes);
    diagramLegendRef.current.resetFilters();
    fetchDocumentData(docId);
    const { x, y } = originalNodes.find(n => n.id === docId).position;
    setCenter(x, y, { duration: 800, zoom: 0.8 });
  }, [
    docId,
    fetchDocumentData,
    setCenter,
    originalNodes,
    originalEdges,
    setNodes,
  ]);

  useEffect(() => {
    if (!selectedDocId) return;
    fetchDocumentData(selectedDocId);
  }, [selectedDocId, showToast, fetchDocumentData]);

  const fetchData = async () => {
    try {
      const [scalesResponse, yearsResponse, nodesResponse, edgesResponse] =
        await Promise.all([
          API.getScales(),
          API.getYears(),
          API.getNodesForDiagram(),
          API.getEdgesForDiagram(),
        ]);
      const scales = await scalesResponse
        .map(scale => scale.scale)
        .sort()
        .sort(sortScales);
      const years = await yearsResponse.sort();
      const edges = await edgesResponse.map((edge, index) => ({
        ...edge,
        deletable: false,
        id: index.toString(),
      }));
      let nodes = mapToNodes(await nodesResponse, years, scales, user);
      if (isEditingPositions) {
        nodes = nodes.map(n => ({ ...n, draggable: true }));
      }
      setScales(scales);
      setYears(years);
      setOriginalNodes(nodes);
      setFilteredNodes(nodes);
      setNodes(nodes);
      setOriginalEdges(edges);
      setFilteredEdges(edges);
      setEdges(edges);
    } catch {
      showToast('Failed to fetch data', 'error');
    }
  };

  useEffect(() => {
    // fetch data when user is defined
    if (user === undefined) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingPositions]);

  useEffect(() => {
    if (!docInfo) return;
    const connectedNodes = docInfo.links.map(l => l.docId.toString());
    const visibleEdges = filteredEdges
      .filter(
        e =>
          connectedNodes.includes(e.target) ||
          connectedNodes.includes(e.source),
      )
      .map(e => ({ ...e, animated: e.type !== 'direct consequence' }));
    const visibleNodes = filteredNodes
      .filter(
        n =>
          connectedNodes.includes(n.id) || n.id === docInfo.id_file.toString(),
      )
      .map(n => ({ ...n, selected: n.id === docInfo.id_file.toString() }));
    setEdges(visibleEdges);
    setNodes(visibleNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docInfo, docId]);

  const handleOnNodeClick = (_, node) => {
    if (!isViewMode && !isEditingConnections) return;
    if (isViewMode) {
      setSelectedDocId(node.id);
    } else {
      if (
        +node.id === docsForConnections.doc1?.id ||
        +node.id === docsForConnections.doc2?.id
      ) {
        showToast('It is not possible to connect the same document', 'warn');
        return;
      }
      const mappedNode = { id: +node.id, title: node.data.title };
      if (!docsForConnections.doc1) {
        setDocsForConnections(prev => ({ ...prev, doc1: mappedNode }));
      } else if (!docsForConnections.doc2) {
        setDocsForConnections(prev => ({ ...prev, doc2: mappedNode }));
      }
    }
  };

  useEffect(() => {
    if (docsForConnections.doc1 && docsForConnections.doc2) {
      setIsConnectionsModalOpen(true);
    }
  }, [docsForConnections]);

  const handleCloseSidePanel = () => {
    setNodes(filteredNodes);
    setEdges(filteredEdges);
    if (docId) {
      navigate('/diagramView');
      setViewport(defaultViewport, { duration: 800 });
    }
    setDocInfo(null);
    setSelectedDocId(null);
  };

  const onNodeDrag = useCallback(
    (_, node) => {
      const intersections = getIntersectingNodes(node, true).map(n => n.id);
      setNodes(ns =>
        ns.map(n => {
          return {
            ...n,
            className:
              intersections.includes(n.id) && n.className !== 'highlight2'
                ? 'highlight'
                : n.className === 'highlight'
                  ? ''
                  : n.id === node.id
                    ? ''
                    : n.className,
          };
        }),
      );
    },
    [getIntersectingNodes, setNodes],
  );

  const onNodeDragStop = (_, node) => {
    const intersections = [];
    nodes.forEach(n => {
      intersections.push(...getIntersectingNodes(n, true).map(n => n.id));
    });
    setNodes(ns =>
      ns.map(n => ({
        ...n,
        className: intersections.includes(n.id) ? 'highlight' : '',
      })),
    );
    const nodeInfo = nodes.find(n => n.id === node.id);
    const newX = node.position.x - nodeInfo.data.yearIndex * xGrid;
    const newY = node.position.y - nodeInfo.data.scaleIndex * yGrid;
    setUpdatedNodesPositions(prev => {
      const updated = [...prev];
      const nodeIndex = updated.findIndex(n => n.id === node.id);
      if (nodeIndex !== -1) {
        updated[nodeIndex] = {
          id: node.id,
          x: newX,
          y: newY,
        };
      } else {
        updated.push({ id: node.id, x: newX, y: newY });
      }
      return updated;
    });
  };

  const onEditPositionsClick = async () => {
    if (isEditingPositions) {
      const intersections = nodes.filter(
        n => n.className === 'highlight2' || n.className === 'highlight',
      );
      if (intersections.length > 0) {
        showToast(
          'Overlapping nodes detected. Please adjust the positions before saving',
          'warn',
        );
        return;
      }
      if (updatedNodesPositions.length === 0) {
        showToast('No changes to save', 'warn');
        navigate('/diagramView');
        return;
      }
      try {
        await API.updateDiagramPositions({
          positions: updatedNodesPositions
            .map(node => ({
              ...node,
              id: Number(node.id),
            }))
            .concat(
              nodes
                .filter(n => n.data.toSave)
                .map(n => ({
                  id: Number(n.id),
                  x: n.position.x - n.data.yearIndex * xGrid,
                  y: n.position.y - n.data.scaleIndex * yGrid,
                })),
            ),
        });
        showToast('Changes saved successfully', 'success');
        navigate('/diagramView');
      } catch {
        showToast('Failed to save changes', 'error');
        navigate('/diagramView');
      }
    } else {
      navigate('/diagramView/edit-positions');
    }
  };

  const onEditConnectionsClick = () => {
    navigate('/diagramView/edit-connections');
  };

  const onHideConnectionsModal = () => {
    setIsConnectionsModalOpen(false);
    diagramLegendRef.current.resetFilters();
    fetchData();
    setDocsForConnections({ doc1: null, doc2: null });
  };

  return (
    <>
      {isIntersectionModalOpen && (
        <OverlappingDocsModal
          isOpen={isIntersectionModalOpen}
          onHide={() => setIsIntersectionModalOpen(false)}
        />
      )}
      {isConnectionsModalOpen && (
        <ConnectionsModal
          isOpen={isConnectionsModalOpen}
          onHide={onHideConnectionsModal}
          doc1={docsForConnections.doc1}
          doc2={docsForConnections.doc2}
        />
      )}
      <div
        style={{ position: 'absolute', top: '0px', left: '6rem' }}
        className="mt-5"
      >
        <DiagramLegend
          ref={diagramLegendRef}
          setFilteredNodes={setFilteredNodes}
          setNodes={setNodes}
          originalNodes={originalNodes}
          docsForConnections={docsForConnections}
          setEdges={setEdges}
          setFilteredEdges={setFilteredEdges}
          originalEdges={originalEdges}
        />
        {user && (
          <EditButtons
            isEditingPositions={isEditingPositions}
            isEditingConnections={isEditingConnections}
            updatedNodePositions={updatedNodesPositions}
            docsForConnections={docsForConnections}
            onEditPositionsClick={onEditPositionsClick}
            onEditConnectionsClick={onEditConnectionsClick}
            onCancelEditClick={() => navigate('/diagramView')}
          />
        )}
      </div>
      {docInfo && (
        <SidePanel
          mode={'diagram'}
          docInfo={docInfo}
          onClose={handleCloseSidePanel}
          handleShowLinksModal={() => {
            navigate(`/diagramView/edit-connections`, {
              state: { docId: docInfo.id_file, title: docInfo.title },
            });
          }}
          clearDocState={() => {}}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '20rem',
          height: '100%',
          width: 'calc(100% - 20rem)',
        }}
      >
        <ReactFlow
          zoomOnScroll={true}
          panOnScroll={true}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={nodeEdges}
          onNodeDragStop={onNodeDragStop}
          onNodeDrag={onNodeDrag}
          onNodesChange={onNodesChange}
          minZoom={0.35}
          maxZoom={1.5}
          defaultViewport={defaultViewport}
          translateExtent={[
            [-200, -200],
            [maxX, maxY],
          ]}
          onNodeClick={handleOnNodeClick}
        >
          <Controls
            showInteractive={false}
            position="top-right"
            onFitView={() => setViewport(defaultViewport, { duration: 500 })}
          />
          {years.length > 0 &&
            years.map((year, index) => (
              <Label
                key={index}
                text={year.toString()}
                position={{ x: 300 + index * xGrid, y: -130 }}
              />
            ))}
          {scales.length > 0 &&
            scales.map((scale, index) => (
              <Label
                key={index}
                text={scale}
                position={{ x: -200, y: 120 + index * yGrid }}
              />
            ))}
          <Background
            id="1"
            gap={[xGrid, yGrid]}
            color="#ccc"
            lineWidth={0.5}
            variant={BackgroundVariant.Lines}
          />
        </ReactFlow>
      </div>
    </>
  );
};

DiagramPage.propTypes = {
  mode: PropTypes.string.isRequired,
};
