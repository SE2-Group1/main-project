import { Area } from '../../../src/components/area';
import AreaController from '../../../src/controllers/areaController';
import AreaDAO from '../../../src/dao/areaDAO';

jest.mock('../../../src/dao/areaDAO'); // Mock the AreaDAO class

describe('AreaController', () => {
  let areaController: AreaController;
  let areaDAO: jest.Mocked<AreaDAO>;

  beforeEach(() => {
    areaDAO = new AreaDAO() as jest.Mocked<AreaDAO>;

    areaController = new AreaController();
    areaController['dao'] = areaDAO;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAreas', () => {
    it('should return all areas from the DAO', async () => {
      const mockAreas: Area[] = [
        {
          id_area: 15,
          name_area: '',
          coordinates: [
            {
              lon: 20.255043,
              lat: 67.85527,
            },
          ],
        },
        {
          id_area: 16,
          name_area: 'Area1',
          coordinates: [
            {
              lon: 20.255043,
              lat: 67.85527,
            },
          ],
        },
      ];
      areaDAO.getAllAreas.mockResolvedValue(mockAreas);

      const areas = await areaController.getAllAreas();

      expect(areaDAO.getAllAreas).toHaveBeenCalledTimes(1);
      expect(areas).toEqual(mockAreas);
    });

    it('should throw an error if the DAO fails', async () => {
      const mockError = new Error('DAO error');
      areaDAO.getAllAreas.mockRejectedValue(mockError);

      await expect(areaController.getAllAreas()).rejects.toThrow('DAO error');
      expect(areaDAO.getAllAreas).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkPointInsideArea', () => {
    it('should return if a point is inside an area', async () => {
      const coordinates = [12.4924, 41.8902];
      areaDAO.checkPointInsideArea.mockResolvedValue(true);

      const isInside = await areaController.checkPointInsideArea(coordinates);

      expect(areaDAO.checkPointInsideArea).toHaveBeenCalledWith(coordinates);
      expect(isInside).toBe(true);
    });

    it('should throw an error if the DAO fails', async () => {
      const coordinates = [12.4924, 41.8902];
      const mockError = new Error('DAO error');
      areaDAO.checkPointInsideArea.mockRejectedValue(mockError);

      await expect(
        areaController.checkPointInsideArea(coordinates),
      ).rejects.toThrow('DAO error');
      expect(areaDAO.checkPointInsideArea).toHaveBeenCalledWith(coordinates);
    });
  });
});
