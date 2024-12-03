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
        // Mock Area with a Point
        new Area(1, 'Area1', [
          {
            lat: 41.8902,
            lon: 12.4924,
          },
        ]),

        // Mock Area with a Polygon
        new Area(2, 'Area2', [
          { lat: 41.8902, lon: 12.4924 },
          { lat: 41.8912, lon: 12.4934 },
          { lat: 41.8902, lon: 12.4924 },
        ]),
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
