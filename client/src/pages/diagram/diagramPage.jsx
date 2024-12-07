import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useEffect, useRef, useState } from 'react';

import { useFeedbackContext } from '../../contexts/FeedbackContext';
import API from '../../services/API';
import { mapToNodes } from '../../utils/diagram';
import {
  CollateralConsequenceEdge,
  DirectConsequenceEdge,
  ProjectionEdge,
  UpdateEdge,
} from './components/CustomEdge';
import { CustomNode } from './components/CustomNode';
import { Label } from './components/Label';

// import agreementIcon from '/icons/map_icons/agreementDocument.svg';

const nodeTypes = {
  custom: CustomNode,
};
const nodeEdges = {
  'direct consequence': DirectConsequenceEdge,
  'collateral consequence': CollateralConsequenceEdge,
  projection: ProjectionEdge,
  update: UpdateEdge,
};

// const initialNodes = [
//   {
//     id: '9',
//     type: 'custom',
//     data: { label: '9', img: agreementIcon },
//     position: { x: 0, y: 0 },
//   },
//   {
//     id: '8',
//     type: 'custom',
//     data: { label: '8', img: agreementIcon },
//     position: { x: 700, y: 0 },
//   },
//   {
//     id: '2',
//     type: 'custom',
//     data: { label: '2', img: agreementIcon },
//     position: { x: 0, y: 200 },
//   },
// ];

// const initialEdges = [
//   { id: 'e12', source: '1', target: '2', type: 'direct-consequence' },
//   { id: 'e13', source: '1', target: '3', type: 'collateral-consequence' },
//   { id: 'e22a', source: '2', target: '2a', type: 'projection' },
//   { id: 'e22b', source: '2', target: '2b', type: 'update' },
//   { id: 'e22c', source: '2', target: '2c', type: 'direct-consequence' },
//   { id: 'e2c2d', source: '2c', target: '2d', type: 'collateral-consequence' },
// ];
const defaultZoom = 0.5;
const xGrid = 700;
const yGrid = 300;
const minX = 100;
const minY = 100;
// TODO: min zoom depends on the size of the diagram

// defaul viewport (scale 0.5)
const defaultViewport = {
  x: 100,
  y: 100,
  zoom: defaultZoom,
};

export const DiagramPage = () => {
  const [viewPort, setViewPort] = useState(defaultViewport);
  const { showToast } = useFeedbackContext();
  const [scales, setScales] = useState([]);
  const [years, setYears] = useState([]);
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const viewportWidth = containerRef.current?.offsetWidth || 0;
  const viewportHeight = containerRef.current?.offsetHeight || 0;

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
          id: index.toString(),
        }));
        setScales(scales);
        setYears(years);
        setNodes(mapToNodes(nodesResponse, years, scales));
        setEdges(edges);
      } catch {
        showToast('Failed to fetch data', 'error');
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewportChange = v => {
    const { x, y, zoom } = v;

    const scaleX = x / zoom;
    const scaleY = y / zoom;

    const maxX = -(xGrid * (years.length ?? 1)) + viewportWidth / zoom;
    const maxY = -(yGrid * (scales.length ?? 1)) + viewportHeight / zoom;

    // bound top left corner
    let boundedX = Math.min(scaleX, minX / defaultZoom);
    let boundedY = Math.min(scaleY, minY / defaultZoom);

    // bound bottom right corner
    boundedX = Math.max(boundedX, maxX);
    boundedY = Math.max(boundedY, maxY);

    const newViewport = {
      x: boundedX * zoom,
      y: boundedY * zoom,
      zoom,
    };

    setViewPort(newViewport);
  };

  return (
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
        minZoom={0.35}
        maxZoom={1.5}
        defaultViewport={viewPort}
        onViewportChange={handleViewportChange}
        viewport={viewPort}
      >
        <Controls
          showInteractive={false}
          position="top-right"
          onFitView={() => setViewPort(defaultViewport)}
        />
        {years.length > 0 &&
          years.map((year, index) => (
            <Label
              key={index}
              text={year}
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
          lineWidth={2}
          variant={BackgroundVariant.Lines}
        />
      </ReactFlow>
    </div>
  );
};
