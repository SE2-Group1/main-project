import { ViewportPortal } from '@xyflow/react';

import PropTypes from 'prop-types';

export const Label = ({ text, position }) => {
  return (
    <ViewportPortal>
      <h1
        style={{
          top: position.y,
          left: position.x,
          position: 'absolute',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          maxWidth: '13vw',
        }}
      >
        {text}
      </h1>
    </ViewportPortal>
  );
};

Label.propTypes = {
  text: PropTypes.string.isRequired,
  position: PropTypes.object.isRequired,
};
