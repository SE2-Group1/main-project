import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button';
import { useFeedbackContext } from '../../../contexts/FeedbackContext';
import API from '../../../services/API';
import { Guide } from './Guide';

export const EditButtons = ({ isEditingPositions, updatedNodePositions }) => {
  const navigate = useNavigate();
  const { showToast } = useFeedbackContext();
  const content = useMemo(() => {
    return isEditingPositions
      ? 'Move the nodes to their new positions on the map by dragging them'
      : 'TODO';
  }, [isEditingPositions]);
  const editPositionsHandler = async () => {
    if (isEditingPositions) {
      try {
        if (updatedNodePositions.length === 0) {
          showToast('No changes to save', 'warn');
          navigate('/diagramView');
          return;
        }
        await API.updateDiagramPositions({
          positions: updatedNodePositions.map(node => ({
            ...node,
            id: Number(node.id),
          })),
        });
        showToast('Changes saved successfully', 'success');
        navigate('/diagramView');
      } catch (error) {
        showToast('Failed to save changes', 'error');
        console.error('Error saving changes:', error);
      }
    } else {
      navigate('/diagramView/edit-positions');
    }
  };
  return (
    <div className="mt-5">
      <Button
        onClick={editPositionsHandler}
        variant={isEditingPositions ? 'secondary' : 'primary'}
      >
        {isEditingPositions ? 'Save changes' : 'Edit positions'}
      </Button>
      {/* <Button className='mt-2'>Edit links</Button> */}
      {isEditingPositions && <Guide content={content} />}
    </div>
  );
};

EditButtons.propTypes = {
  isEditingPositions: PropTypes.bool.isRequired,
  updatedNodePositions: PropTypes.array.isRequired,
};
