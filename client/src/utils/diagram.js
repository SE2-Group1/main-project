import { mapIcon } from './docs.js';
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

const isPositionValid = (yearIndex, scaleIndex, row, col, nodes) => {
  const x1 = yearIndex * gridWidth + (col * gridWidth) / maxCols;
  const y1 = scaleIndex * gridHeight + (row * gridHeight) / maxRows;
  return nodes.some(node => {
    if (!node.custom_position) return false;
    const x2 = yearIndex * gridWidth + node.custom_position.x;
    const y2 = scaleIndex * gridHeight + node.custom_position.y;
    return Math.abs(x2 - x1) < 100 && Math.abs(y2 - y1) < 100;
  });
};

/**
 * Maps the pairs of elements to nodes with positions.
 */
export const mapToNodes = (pairs, years, scales, user) => {
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
    const newElements = elements.map(item => {
      const customPosition = item.custom_position;
      let newX;
      let newY;
      let isOverlapping = false;
      if (!customPosition) {
        let row, col;
        // define x and y position based on the month using the map
        const month = new Date(item.date).getMonth();
        const xIndex = monthToGrid[month];
        let found = false;
        for (let i = 0; i < maxRows; i++) {
          if (
            matrix[i][xIndex] === 0 &&
            !isPositionValid(yearIndex, scaleIndex, i, xIndex, elements)
          ) {
            found = true;
            row = i;
            col = xIndex;
            matrix[i][xIndex] = 1;
            break;
          }
        }
        if (!found) {
          // try the next column
          if (xIndex < maxCols - 1) {
            for (let i = 0; i < maxRows; i++) {
              if (
                matrix[i][xIndex + 1] === 0 &&
                !isPositionValid(yearIndex, scaleIndex, i, xIndex + 1, elements)
              ) {
                found = true;
                row = i;
                col = xIndex + 1;
                matrix[i][xIndex + 1] = 1;
                break;
              }
            }
          }
          if (!found) {
            row = maxRows - 1;
            col = xIndex;
            isOverlapping = true;
            matrix[maxRows - 1][xIndex] = 1;
          }
        }
        newX = yearIndex * gridWidth + (col * gridWidth) / maxCols;
        newY = scaleIndex * gridHeight + (row * gridHeight) / maxRows;
      } else {
        newX = yearIndex * gridWidth + customPosition.x;
        newY = scaleIndex * gridHeight + customPosition.y;
      }
      console.log(
        `itemid: ${item.id} docType: ${item.type} url: ${mapIcon(item.stakeholders, item.type)} stakeholders:`,
      );
      console.log(item.stakeholders);
      return {
        id: item.id.toString(),
        type: 'custom',
        className: isOverlapping && user ? 'highlight2' : '',
        data: {
          label: item.id.toString(),
          img: mapIcon(item.stakeholders, item.type),
          title: item.title,
          type: item.type,
          yearIndex: yearIndex,
          scaleIndex: scaleIndex,
          toSave: !item.custom_position,
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

export const sortScales = (a, b) => {
  if (a.includes(':') && b.includes(':')) {
    let p11 = Number(a.split(':')[0]);
    let p12 = Number(a.split(':')[1]);
    let p21 = Number(b.split(':')[0]);
    let p22 = Number(b.split(':')[1]);
    if (p11 === p21) {
      return p22 - p12;
    }
    return p21 - p11;
  }
  return a - b;
};
