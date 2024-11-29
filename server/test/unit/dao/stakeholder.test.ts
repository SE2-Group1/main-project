import { Stakeholder } from '../../../src/components/stakeholder';
import StakeholderDAO from '../../../src/dao/stakeholderDAO';
import db from '../../../src/db/db';
import { StakeholderNotFoundError } from '../../../src/errors/stakeholderError';

jest.mock('../../../src/db/db');

describe('StakeholderDAO', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addStakeholder', () => {
    test('It should create a new stakeholder and return true', async () => {
      const stakeholderDAO = new StakeholderDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });

      const result = await stakeholderDAO.addStakeholder('stakeholder1');

      expect(result).toBe(true);
      expect(mockDBQuery).toHaveBeenCalledWith(
        `INSERT INTO stakeholders (stakeholder)
                VALUES (?)`,
        ['stakeholder1'],
        expect.any(Function),
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const stakeholderDAO = new StakeholderDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'));
        });

      await expect(
        stakeholderDAO.addStakeholder('stakeholder1'),
      ).rejects.toThrow('Database error');
      mockDBQuery.mockRestore();
    });
  });

  describe('getStakeholder', () => {
    test('It should return a specific stakeholder', async () => {
      const stakeholderDAO = new StakeholderDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [{ stakeholder: 'stakeholder1' }] });
        });

      const result = await stakeholderDAO.getStakeholder('stakeholder1');

      expect(result).toEqual(new Stakeholder('stakeholder1'));
      expect(mockDBQuery).toHaveBeenCalledWith(
        'SELECT * FROM stakeholders WHERE stakeholder = ?',
        ['stakeholder1'],
        expect.any(Function),
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw StakeholderNotFoundError if the stakeholder does not exist', async () => {
      const stakeholderDAO = new StakeholderDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });

      await expect(
        stakeholderDAO.getStakeholder('stakeholder1'),
      ).rejects.toThrow(StakeholderNotFoundError);
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const stakeholderDAO = new StakeholderDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'));
        });

      await expect(
        stakeholderDAO.getStakeholder('stakeholder1'),
      ).rejects.toThrow('Database error');
      mockDBQuery.mockRestore();
    });
  });

  describe('getAllStakeholders', () => {
    test('It should return all stakeholders', async () => {
      const stakeholderDAO = new StakeholderDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              { stakeholder: 'stakeholder1' },
              { stakeholder: 'stakeholder2' },
            ],
          });
        });

      const result = await stakeholderDAO.getAllStakeholders();

      expect(result).toEqual([
        new Stakeholder('stakeholder1'),
        new Stakeholder('stakeholder2'),
      ]);
      expect(mockDBQuery).toHaveBeenCalledWith(
        'SELECT * FROM stakeholders',
        [],
        expect.any(Function),
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const stakeholderDAO = new StakeholderDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'));
        });

      await expect(stakeholderDAO.getAllStakeholders()).rejects.toThrow(
        'Database error',
      );
      mockDBQuery.mockRestore();
    });
  });
});
