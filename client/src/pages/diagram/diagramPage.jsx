import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../contexts/FeedbackContext';
import { useUserContext } from '../../contexts/UserContext';
import API from '../../services/API';
import { mapToNodes } from '../../utils/diagram';
import SidePanel from '../MapView/components/SidePanel';
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
  const [scales, setScales] = useState([]);
  const [years, setYears] = useState([]);
  const containerRef = useRef(null);
  const [originalNodes, setOriginalNodes] = useState([]);
  const [originalEdges, setOriginalEdges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const isViewMode = mode === 'view' ? true : false;
  const isEditingPositions = mode === 'edit-positions' ? true : false;
  const [updatedNodesPositions, setUpdatedNodesPositions] = useState([]);
  const [maxX, setMaxX] = useState(10000);
  const [maxY, setMaxY] = useState(10000);
  const { setViewport, setCenter } = useReactFlow();
  const navigate = useNavigate();
  const { docId } = useParams();

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
    if (!docId || !originalNodes?.length || !originalEdges?.length) return;
    fetchDocumentData(docId);
    const { x, y } = originalNodes.find(n => n.id === docId).position;
    setCenter(x, y, { duration: 800, zoom: 0.8 });
  }, [docId, fetchDocumentData, setCenter, originalNodes, originalEdges]);

  useEffect(() => {
    if (!selectedDocId) return;
    fetchDocumentData(selectedDocId);
  }, [selectedDocId, showToast, fetchDocumentData]);

  useEffect(() => {
    if (!scales || !scales.length || !years || !years.length) return;
    const maxX = xGrid * years.length;
    const maxY = yGrid * scales.length;
    setMaxX(maxX);
    setMaxY(maxY);
  }, [scales, years]);

  useEffect(() => {
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
          .sort((a, b) => a - b);
        const years = await yearsResponse.sort();
        const edges = await edgesResponse.map((edge, index) => ({
          ...edge,
          deletable: false,
          id: index.toString(),
        }));
        let nodes = mapToNodes(await nodesResponse, years, scales);
        if (isEditingPositions) {
          nodes = nodes.map(n => ({ ...n, draggable: true }));
        }
        setScales(scales);
        setYears(years);
        setOriginalNodes(nodes);
        setNodes(nodes);
        setOriginalEdges(edges);
        setEdges(edges);
      } catch {
        showToast('Failed to fetch data', 'error');
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingPositions]);

  useEffect(() => {
    if (!docInfo) return;

    const connectedNodes = docInfo.links.map(l => l.docId.toString());

    const visibleEdges = originalEdges
      .filter(
        e =>
          connectedNodes.includes(e.target) ||
          connectedNodes.includes(e.source),
      )
      .map(e => ({ ...e, animated: e.type !== 'direct consequence' }));
    const visibleNodes = originalNodes
      .filter(
        n =>
          connectedNodes.includes(n.id) || n.id === docInfo.id_file.toString(),
      )
      .map(n => ({ ...n, selected: n.id === docInfo.id_file.toString() }));

    setEdges(visibleEdges);
    setNodes(visibleNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docInfo, docId]);

  const handleOnNodeClick = node => {
    if (!isViewMode) return;
    const id = node.currentTarget.attributes['data-id'].nodeValue;
    setSelectedDocId(id);
  };
  const handleCloseSidePanel = () => {
    setNodes(originalNodes);
    setEdges(originalEdges);
    if (docId) {
      navigate('/diagramView');
      setViewport(defaultViewport, { duration: 800 });
    }
    setDocInfo(null);
    setSelectedDocId(null);
  };

  const onNodesChange = nodes => {
    if (
      !isEditingPositions ||
      !nodes.length ||
      nodes.length > 1 ||
      !nodes[0]?.position
    )
      return;
    const nodeId = nodes[0].id;
    const node = updatedNodesPositions.find(n => n.id === nodeId);
    if (node) {
      setUpdatedNodesPositions(prev => {
        const updated = [...prev];
        const index = updated.findIndex(n => n.id === nodeId);
        updated[index] = {
          ...node,
          x: nodes[0].position.x,
          y: nodes[0].position.y,
        };
        return updated;
      });
    } else {
      setUpdatedNodesPositions(prev => [
        ...prev,
        { id: nodeId, x: nodes[0].position.x, y: nodes[0].position.y },
      ]);
    }
  };

  return (
    <>
      <div
        style={{ position: 'absolute', top: '0px', left: '6rem' }}
        className="mt-5"
      >
        <DiagramLegend />
        {user && (
          <EditButtons
            isEditingPositions={isEditingPositions}
            updatedNodePositions={updatedNodesPositions}
          />
        )}
      </div>
      {docInfo && (
        <SidePanel
          mode={'diagram'}
          docInfo={docInfo}
          onClose={handleCloseSidePanel}
          handleShowLinksModal={() => {}}
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
        ref={containerRef}
      >
        <ReactFlow
          defaultNodes={[]}
          nodes={nodes}
          defaultEdges={[]}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={nodeEdges}
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
