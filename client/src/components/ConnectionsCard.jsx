import { Card, Col, Form } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { CtaButton } from './CtaButton';

// editedDocument -> doc1
// selectedDoc -> doc2

export const ConnectionsCard = ({
  doc1,
  doc2,
  links,
  handleChangeLinks,
  saveLinks,
}) => {
  return (
    <Col>
      <Card className="p-3">
        <h3 className="linked-docs-title">
          {doc1 ? `${doc1.title.toUpperCase()} ⭤ ` : ''}
          {doc2 ? doc2.title.toUpperCase() : 'No document selected'}
        </h3>
        <div style={{ overflowY: 'auto', padding: '10px' }}>
          {links.map((conn, idx) => (
            <Form.Check
              className="mb-3 custom-switch"
              key={idx}
              type="switch"
              checked={conn.checked}
              onChange={handleChangeLinks}
              id={conn.type}
              label={conn.type}
              style={{ fontSize: '1.25rem' }}
            />
          ))}
        </div>
        <div className="d-flex justify-content-center">
          <CtaButton onClick={saveLinks} disabled={!links.length}>
            Save Links
          </CtaButton>
        </div>
      </Card>
    </Col>
  );
};

ConnectionsCard.propTypes = {
  doc1: PropTypes.object.isRequired,
  doc2: PropTypes.object.isRequired,
  links: PropTypes.array.isRequired,
  handleChangeLinks: PropTypes.func.isRequired,
  saveLinks: PropTypes.func.isRequired,
};
