import { Stakeholder } from '../../../src/components/stakeholder';
import StakeholderController from '../../../src/controllers/stakeholderController';
import StakeholderDAO from '../../../src/dao/stakeholderDAO';
import { StakeholderNotFoundError } from '../../../src/errors/stakeholderError';

jest.mock('../../../src/dao/stakeholderDAO');

describe('StakeholderController', () => {
  let stakeholderController: StakeholderController;
  let stakeholderDAO: jest.Mocked<StakeholderDAO>;

  beforeEach(() => {
    stakeholderDAO = new StakeholderDAO() as jest.Mocked<StakeholderDAO>;
    stakeholderController = new StakeholderController();
    stakeholderController['dao'] = stakeholderDAO;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('addStakeholder', () => {
    test('It should create a new stakeholder and return true', async () => {
      stakeholderDAO.addStakeholder.mockResolvedValue(true);

      const result = await stakeholderController.addStakeholder('stakeholder1');

      expect(result).toBe(true);
      expect(stakeholderDAO.addStakeholder).toHaveBeenCalledWith(
        'stakeholder1',
      );
    });

    test('It should throw an error if the DAO method fails', async () => {
      stakeholderDAO.addStakeholder.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        stakeholderController.addStakeholder('stakeholder1'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getStakeholder', () => {
    test('It should return a specific stakeholder', async () => {
      const testStakeholder = new Stakeholder('stakeholder1');
      stakeholderDAO.getStakeholder.mockResolvedValue(testStakeholder);

      const result = await stakeholderController.getStakeholder('stakeholder1');

      expect(result).toEqual(testStakeholder);
      expect(stakeholderDAO.getStakeholder).toHaveBeenCalledWith(
        'stakeholder1',
      );
    });

    test('It should throw StakeholderNotFoundError if the stakeholder does not exist', async () => {
      stakeholderDAO.getStakeholder.mockRejectedValue(
        new StakeholderNotFoundError(),
      );

      await expect(
        stakeholderController.getStakeholder('stakeholder1'),
      ).rejects.toThrow(StakeholderNotFoundError);
    });

    test('It should throw an error if the DAO method fails', async () => {
      stakeholderDAO.getStakeholder.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        stakeholderController.getStakeholder('stakeholder1'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAllStakeholders', () => {
    test('It should return all stakeholders', async () => {
      const testStakeholders = [
        new Stakeholder('stakeholder1'),
        new Stakeholder('stakeholder2'),
      ];
      stakeholderDAO.getAllStakeholders.mockResolvedValue(testStakeholders);

      const result = await stakeholderController.getAllStakeholders();

      expect(result).toEqual(testStakeholders);
      expect(stakeholderDAO.getAllStakeholders).toHaveBeenCalled();
    });

    test('It should throw an error if the DAO method fails', async () => {
      stakeholderDAO.getAllStakeholders.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(stakeholderController.getAllStakeholders()).rejects.toThrow(
        'Database error',
      );
    });
  });
});
