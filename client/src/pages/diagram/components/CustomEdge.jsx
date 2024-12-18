import { BaseEdge } from '@xyflow/react';

import PropTypes from 'prop-types';

const getSpecialPath = ({ sourceX, sourceY, targetX, targetY }, offset) => {
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  return `M ${sourceX} ${sourceY} Q ${centerX} ${
    centerY + offset
  } ${targetX} ${targetY}`;
};

export const DirectConsequenceEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}) => {
  const edgePath = getSpecialPath(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
    },
    100,
  );

  return <BaseEdge id={id} path={edgePath} style={{ stroke: 'red' }} />;
};

export const CollateralConsequenceEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}) => {
  const edgePath = getSpecialPath(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
    },
    50,
  );

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{ stroke: 'blue', strokeDasharray: '5' }}
    />
  );
};

export const ProjectionEdge = ({ id, sourceX, sourceY, targetX, targetY }) => {
  const edgePath = getSpecialPath(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
    },
    -50,
  );
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: 'green',
        strokeWidth: 2,
        strokeDasharray: '0.1,5',
        strokeLinecap: 'round',
      }}
    />
  );
};

export const UpdateEdge = ({ id, sourceX, sourceY, targetX, targetY }) => {
  const edgePath = getSpecialPath(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
    },
    -100,
  );

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: 'black',
        strokeWidth: 1,
        strokeDasharray: '10,5,0.1,5',
        strokeLinecap: 'round',
      }}
    />
  );
};

DirectConsequenceEdge.propTypes = {
  id: PropTypes.string,
  sourceX: PropTypes.number,
  sourceY: PropTypes.number,
  targetX: PropTypes.number,
  targetY: PropTypes.number,
};
CollateralConsequenceEdge.propTypes = {
  id: PropTypes.string,
  sourceX: PropTypes.number,
  sourceY: PropTypes.number,
  targetX: PropTypes.number,
  targetY: PropTypes.number,
};
ProjectionEdge.propTypes = {
  id: PropTypes.string,
  sourceX: PropTypes.number,
  sourceY: PropTypes.number,
  targetX: PropTypes.number,
  targetY: PropTypes.number,
};
UpdateEdge.propTypes = {
  id: PropTypes.string,
  sourceX: PropTypes.number,
  sourceY: PropTypes.number,
  targetX: PropTypes.number,
  targetY: PropTypes.number,
};
