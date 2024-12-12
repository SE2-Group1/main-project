import { useMemo } from 'react';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button';
import { Guide } from './Guide';

export const EditButtons = ({
  isEditingPositions,
  onEditPositionsClick,
  onCancelEditClick,
}) => {
  const content = useMemo(() => {
    return isEditingPositions
      ? 'Move the nodes to their new positions on the map by dragging them'
      : 'TODO';
  }, [isEditingPositions]);
  return (
    <div className="mt-5">
      <Button
        onClick={onEditPositionsClick}
        variant={isEditingPositions ? 'secondary' : 'primary'}
      >
        {isEditingPositions ? 'Save changes' : 'Edit positions'}
      </Button>
      {isEditingPositions && (
        <Button className="mt-2" variant="cancel" onClick={onCancelEditClick}>
          Cancel
        </Button>
      )}
      {/* <Button className='mt-2'>Edit links</Button> */}
      {isEditingPositions && <Guide content={content} />}
    </div>
  );
};

EditButtons.propTypes = {
  isEditingPositions: PropTypes.bool.isRequired,
  updatedNodePositions: PropTypes.array.isRequired,
  onEditPositionsClick: PropTypes.func.isRequired,
  onCancelEditClick: PropTypes.func.isRequired,
};
