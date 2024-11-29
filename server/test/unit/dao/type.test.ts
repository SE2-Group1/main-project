import { Type } from '../../../src/components/type';
import TypeDAO from '../../../src/dao/typeDAO';
import db from '../../../src/db/db';

jest.mock('../../../src/db/db');

describe('TypeDAO', () => {
  let typeDAO: TypeDAO;

  beforeEach(() => {
    typeDAO = new TypeDAO();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTypes', () => {
    it('should return all types', async () => {
      const mockTypes = [{ type_name: 'type1' }, { type_name: 'type2' }];
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(null, { rows: mockTypes });
      });

      const result = await typeDAO.getAllTypes();
      expect(result).toEqual([new Type('type1'), new Type('type2')]);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(typeDAO.getAllTypes()).rejects.toThrow('Query failed');
    });
  });

  describe('getType', () => {
    it('should return a specific type', async () => {
      const mockType = { type_name: 'type1' };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockType] });
      });

      const result = await typeDAO.getType('type1');
      expect(result).toEqual(mockType);
    });

    it('should throw an error if the type is not found', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rowCount: 0 });
      });

      await expect(typeDAO.getType('type1')).rejects.toThrow('Type not found');
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(typeDAO.getType('type1')).rejects.toThrow('Query failed');
    });
  });

  describe('addType', () => {
    it('should add a new type', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await typeDAO.addType('type3');
      expect(result).toBe(true);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'));
      });

      await expect(typeDAO.addType('type3')).rejects.toThrow('Query failed');
    });
  });
});
