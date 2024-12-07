import { Handle, Position } from '@xyflow/react';

import PropTypes from 'prop-types';

export const CustomNode = ({ data }) => {
  return (
    <>
      <img src={data.img} alt="icon" height={75} width={75} />
      <Handle type="target" position={Position.Left} id="a" />
      <Handle type="source" position={Position.Right} id="b" />
    </>
  );
};

CustomNode.propTypes = {
  data: PropTypes.object,
};

export default CustomNode;
