import { Scale } from '../../../src/components/scale';
import StakeholderController from '../../../src/controllers/scaleController';
import ScaleDAO from '../../../src/dao/scaleDAO';

jest.mock('../../../src/dao/scaleDAO');

describe('StakeholderController', () => {
  let stakeholderController: StakeholderController;
  let mockDAO: jest.Mocked<ScaleDAO>;

  beforeEach(() => {
    mockDAO = new ScaleDAO() as jest.Mocked<ScaleDAO>;
    stakeholderController = new StakeholderController();
    (stakeholderController as any).dao = mockDAO;
  });

  describe('getAllScales', () => {
    it('should return all scales', async () => {
      const scales: Scale[] = [new Scale('scale1'), new Scale('scale2')];
      mockDAO.getAllScales.mockResolvedValue(scales);

      const result = await stakeholderController.getAllScales();

      expect(result).toEqual(scales);
      expect(mockDAO.getAllScales).toHaveBeenCalledTimes(1);
    });
  });

  describe('getScale', () => {
    it('should return a scale by name', async () => {
      const scale = new Scale('scale1');
      mockDAO.getScale.mockResolvedValue(scale);

      const result = await stakeholderController.getScale('scale1');

      expect(result).toEqual(scale);
      expect(mockDAO.getScale).toHaveBeenCalledWith('scale1');
      expect(mockDAO.getScale).toHaveBeenCalledTimes(1);
    });
  });

  describe('addScale', () => {
    it('should add a new scale', async () => {
      mockDAO.addScale.mockResolvedValue(true);

      const result = await stakeholderController.addScale('scale3');

      expect(result).toBe(true);
      expect(mockDAO.addScale).toHaveBeenCalledWith('scale3');
      expect(mockDAO.addScale).toHaveBeenCalledTimes(1);
    });
  });
});
