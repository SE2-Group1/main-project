import { Handle, Position } from '@xyflow/react';

import { memo, useState } from 'react';

import PropTypes from 'prop-types';

import { getColorByType } from '../../../utils/map';

export const CustomNode = ({ data, selected }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      style={{
        position: 'relative',
        border: 'solid',
        borderColor: selected ? getColorByType(data.type) : 'transparent',
        borderWidth: '5px',
        borderRadius: '50%',
        padding: '6px',
        backgroundColor: selected ? 'white' : 'transparent',
        textAlign: 'center',
      }}
    >
      {isHovered && <h4>{data.title}</h4>}
      <img
        src={data.img}
        alt="icon"
        height={75}
        width={75}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ visibility: 'hidden' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
};

CustomNode.propTypes = {
  data: PropTypes.object,
  selected: PropTypes.bool,
};

export default memo(CustomNode);
