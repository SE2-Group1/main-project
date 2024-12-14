import { useMemo } from 'react';
import { Col } from 'react-bootstrap';

import PropTypes from 'prop-types';

export const Guide = ({ mode, docsForConnections }) => {
  const content = useMemo(() => {
    if (mode === 'edit-positions') {
      return (
        <p style={{ color: 'var(--color-primary-500)' }}>
          Move the nodes to their new positions on the map by dragging them
        </p>
      );
    } else {
      return (
        <Col style={{ color: 'var(--color-primary-500)' }}>
          <p>
            <strong>DOC1:</strong>{' '}
            {docsForConnections.doc1?.title ?? 'Not selected'}
          </p>
          <p>
            <strong>DOC2:</strong>{' '}
            {docsForConnections.doc2?.title ?? 'Not selected'}
          </p>
        </Col>
      );
    }
  }, [mode, docsForConnections]);

  return (
    <div
      style={{
        maxWidth: '10rem',
        border: 'solid',
        borderWidth: '2px',
        borderRadius: '10px',
        borderColor: 'var(--color-primary-500)',
        padding: '10px',
      }}
      className="mt-3"
    >
      {content}
    </div>
  );
};

Guide.propTypes = {
  mode: PropTypes.string.isRequired,
  docsForConnections: PropTypes.object.isRequired,
};
