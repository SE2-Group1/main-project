import { Handle, Position } from '@xyflow/react';

import { memo, useState } from 'react';

import PropTypes from 'prop-types';

import { getColorByType } from '../../../utils/map';

export const CustomNode = ({ data, selected }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      style={{
        border: 'solid',
        borderColor: selected ? getColorByType(data.type) : 'transparent',
        borderWidth: '5px',
        borderRadius: '50%',
        padding: '6px',
      }}
    >
      <img
        src={data.img}
        alt="icon"
        height={75}
        width={75}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ ...(isHovered && { opacity: '0.8' }) }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ visibility: data.mode === 'edit' ? 'visible' : 'hidden' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ visibility: data.mode === 'edit' ? 'visible' : 'hidden' }}
      />
      {isHovered && <h4 style={{ position: 'absolute' }}>{data.title}</h4>}
    </div>
  );
};

CustomNode.propTypes = {
  data: PropTypes.object,
  selected: PropTypes.bool,
};

export default memo(CustomNode);
