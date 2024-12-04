import { Area } from '../../../src/components/area';
import AreaController from '../../../src/controllers/areaController';
import AreaDAO from '../../../src/dao/areaDAO';

jest.mock('../../../src/dao/areaDAO'); // Mock the AreaDAO class

describe('DocumentController', () => {
  let documentController: AreaController;
  let areaDAO: jest.Mocked<AreaDAO>;

  beforeEach(() => {
    areaDAO = new AreaDAO() as jest.Mocked<AreaDAO>;

    documentController = new AreaController();
    documentController['dao'] = areaDAO;
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

      areaDAO.getAllAreas.mockResolvedValue(mockAreas);

      const areas = await documentController.getAllAreas();

      expect(areaDAO.getAllAreas).toHaveBeenCalledTimes(1);
      expect(areas).toEqual(mockAreas);
    });

    it('should throw an error if the DAO fails', async () => {
      const mockError = new Error('DAO error');
      areaDAO.getAllAreas.mockRejectedValue(mockError);

      await expect(documentController.getAllAreas()).rejects.toThrow(
        'DAO error',
      );
      expect(areaDAO.getAllAreas).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkPointInsideArea', () => {
    it('should return if a point is inside an area', async () => {
      const coordinates = [12.4924, 41.8902];
      areaDAO.checkPointInsideArea.mockResolvedValue(true);

      const isInside =
        await documentController.checkPointInsideArea(coordinates);

      expect(areaDAO.checkPointInsideArea).toHaveBeenCalledWith(coordinates);
      expect(isInside).toBe(true);
    });

    it('should throw an error if the DAO fails', async () => {
      const coordinates = [12.4924, 41.8902];
      const mockError = new Error('DAO error');
      areaDAO.checkPointInsideArea.mockRejectedValue(mockError);

      await expect(
        documentController.checkPointInsideArea(coordinates),
      ).rejects.toThrow('DAO error');
      expect(areaDAO.checkPointInsideArea).toHaveBeenCalledWith(coordinates);
    });
  });
});
