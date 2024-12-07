import { getIconByType } from './map';

const gridWidth = 700;
const gridHeight = 300;
const maxCols = 4;

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

    const newElements = elements.map((item, index) => {
      const row = Math.floor(index / maxCols);
      const col = index % maxCols;
      const newX = yearIndex * gridWidth + (col * gridWidth) / maxCols;
      const newY = scaleIndex * gridHeight + row * gridHeight;
      console.log(newX, newY);
      return {
        id: item.id.toString(),
        type: 'custom',
        data: { label: item.id.toString(), img: getIconByType(item.type) },
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
