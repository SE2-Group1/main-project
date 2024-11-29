import { Scale } from '../../../src/components/scale';
import ScaleDAO from '../../../src/dao/scaleDAO';
import db from '../../../src/db/db';

jest.mock('../../../src/db/db');

describe('ScaleDAO', () => {
  let scaleDAO: ScaleDAO;

  beforeEach(() => {
    scaleDAO = new ScaleDAO();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllScales', () => {
    it('should return all scales', async () => {
      const mockScales = [{ scale: 'Scale1' }, { scale: 'Scale2' }];
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(null, { rows: mockScales });
      });

      const scales = await scaleDAO.getAllScales();
      expect(scales).toEqual([new Scale('Scale1'), new Scale('Scale2')]);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(scaleDAO.getAllScales()).rejects.toThrow('Query failed');
    });
  });

  describe('getScale', () => {
    it('should return the specified scale', async () => {
      const mockScale = { scale: 'Scale1' };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockScale] });
      });

      const scale = await scaleDAO.getScale('Scale1');
      expect(scale).toEqual(new Scale('Scale1'));
    });

    it('should throw an error if the scale is not found', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rowCount: 0 });
      });

      await expect(scaleDAO.getScale('NonExistentScale')).rejects.toThrow(
        'Scale not found',
      );
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(scaleDAO.getScale('Scale1')).rejects.toThrow('Query failed');
    });
  });

  describe('addScale', () => {
    it('should add a new scale', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await scaleDAO.addScale('NewScale');
      expect(result).toBe(true);
    });

    it('should throw an error if the scale already exists', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Scale already exists'), null);
      });

      await expect(scaleDAO.addScale('ExistingScale')).rejects.toThrow(
        'Scale already exists',
      );
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(scaleDAO.addScale('NewScale')).rejects.toThrow(
        'Query failed',
      );
    });
  });
});
