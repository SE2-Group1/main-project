import { Point, Polygon } from 'geojson';

import { Area } from '../../../src/components/area';
import AreaController from '../../../src/controllers/areaController';
import AreaDAO from '../../../src/dao/areaDAO';

jest.mock('../../../src/dao/areaDAO'); // Mock the AreaDAO class

describe('DocumentController', () => {
  let documentController: AreaController;
  let mockGetAllAreas: jest.Mock;

  beforeEach(() => {
    // Set up the mocked DAO
    mockGetAllAreas = jest.fn();
    (AreaDAO as jest.Mock).mockImplementation(() => ({
      getAllAreas: mockGetAllAreas,
    }));

    documentController = new AreaController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAreas', () => {
    it('should return all areas from the DAO', async () => {
      const mockAreas: Area[] = [
        new Area(1, {
          type: 'Point',
          coordinates: [12.4924, 41.8902],
        } as Point),
        new Area(2, {
          type: 'Polygon',
          coordinates: [
            [
              [12.4924, 41.8902],
              [12.4934, 41.8912],
              [12.4924, 41.8902],
            ],
          ],
        } as Polygon),
      ];

      mockGetAllAreas.mockResolvedValue(mockAreas);

      const areas = await documentController.getAllAreas();

      expect(mockGetAllAreas).toHaveBeenCalledTimes(1);
      expect(areas).toEqual(mockAreas);
    });

    it('should throw an error if the DAO fails', async () => {
      const mockError = new Error('DAO error');
      mockGetAllAreas.mockRejectedValue(mockError);

      await expect(documentController.getAllAreas()).rejects.toThrow(
        'DAO error',
      );
      expect(mockGetAllAreas).toHaveBeenCalledTimes(1);
    });
  });
});
