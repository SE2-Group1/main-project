import { getIconByType } from './map';
import collateralConsequence from '/icons/diagram_icons/collateralConsequence.svg';
import directConsequence from '/icons/diagram_icons/directConsequence.svg';
import projection from '/icons/diagram_icons/projection.svg';
import update from '/icons/diagram_icons/update.svg';

const gridWidth = 700;
const gridHeight = 300;
const maxCols = 4;
const maxRows = 3;

const typeIcons = {
  'direct consequence': directConsequence,
  'collateral consequence': collateralConsequence,
  projection: projection,
  update: update,
};

export const getIconByLinkType = type => typeIcons[type];

// Map month to grid position
const monthToGrid = {
  0: 0,
  1: 0,
  2: 0,
  3: 1,
  4: 1,
  5: 1,
  6: 2,
  7: 2,
  8: 2,
  9: 3,
  10: 3,
  11: 3,
};

/**
 * Maps the pairs of elements to nodes with positions.
 */
export const mapToNodes = (pairs, years, scales) => {
  const positionedElements = [];
  Object.keys(pairs).forEach(pair => {
    const elements = pairs[pair];
    const year = pair.split('-')[0];
    const scale = pair.split('-')[1];
    const yearIndex = years.indexOf(+year);
    const scaleIndex = scales.indexOf(scale);
    elements.sort((a, b) => new Date(a.date) - new Date(b.date));
    // matrix layout
    const matrix = [];
    for (let i = 0; i < maxRows; i++) {
      matrix.push(Array(maxCols).fill(0));
    }
    const newElements = elements.map((item, index) => {
      const customPosition = item.custom_position;
      let newX;
      let newY;
      if (!customPosition) {
        let row = Math.floor(index / maxCols);
        let col = index % maxCols;
        // define x and y position based on the month using the map
        const month = new Date(item.date).getMonth();
        const xIndex = monthToGrid[month];
        let found = false;
        for (let i = 0; i < maxRows; i++) {
          if (matrix[i][xIndex] === 0) {
            found = true;
            row = i;
            col = xIndex;
            matrix[i][xIndex] = 1;
            break;
          }
        }
        if (!found) {
          // if the position is already taken, go to the next column
          if (xIndex < maxCols - 1) {
            col = xIndex + 1;
            row = 0;
            matrix[row][col] = 1;
          }
        }
        newX = yearIndex * gridWidth + (col * gridWidth) / maxCols;
        newY = scaleIndex * gridHeight + (row * gridHeight) / maxRows;
      } else {
        newX = customPosition.x;
        newY = customPosition.y;
      }
      return {
        id: item.id.toString(),
        type: 'custom',
        data: {
          label: item.id.toString(),
          img: getIconByType(item.type),
          title: item.title,
          type: item.type,
        },
        deletable: false,
        draggable: false,
        position: {
          x: newX,
          y: newY,
        },
      };
    });
    positionedElements.push(...newElements);
  });

  return positionedElements;
};
