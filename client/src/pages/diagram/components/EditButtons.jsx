import PropTypes from 'prop-types';

import { Button } from '../../../components/Button';
import { Guide } from './Guide';

export const EditButtons = ({
  isEditingPositions,
  isEditingConnections,
  onEditPositionsClick,
  onEditConnectionsClick,
  onCancelEditClick,
  docsForConnections,
}) => {
  return (
    <div className="mt-5">
      {!isEditingConnections ? (
        <Button
          onClick={onEditPositionsClick}
          variant={isEditingPositions ? 'secondary' : 'primary'}
        >
          {isEditingPositions ? 'Save changes' : 'Edit positions'}
        </Button>
      ) : null}
      {!isEditingConnections && !isEditingPositions ? (
        <Button
          className="mt-3"
          onClick={onEditConnectionsClick}
          variant={isEditingConnections ? 'secondary' : 'primary'}
        >
          Edit connections
        </Button>
      ) : null}
      {isEditingPositions || isEditingConnections ? (
        <Button className="mt-2" variant="cancel" onClick={onCancelEditClick}>
          Cancel
        </Button>
      ) : null}
      {isEditingPositions || isEditingConnections ? (
        <Guide
          mode={isEditingPositions ? 'edit-positions' : 'edit-connections'}
          docsForConnections={docsForConnections}
        />
      ) : null}
    </div>
  );
};

EditButtons.propTypes = {
  isEditingPositions: PropTypes.bool.isRequired,
  isEditingConnections: PropTypes.bool.isRequired,
  onEditPositionsClick: PropTypes.func.isRequired,
  onEditConnectionsClick: PropTypes.func.isRequired,
  onCancelEditClick: PropTypes.func.isRequired,
  docsForConnections: PropTypes.object.isRequired,
};
