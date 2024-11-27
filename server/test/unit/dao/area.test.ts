import { Area } from '../../../src/components/area';
import AreaDAO from '../../../src/dao/areaDAO';
import db from '../../../src/db/db';

jest.mock('../../../src/db/db');

describe('AreaDAO', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllAreas', () => {
    test('It should return all areas', async () => {
      const areaDAO = new AreaDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, callback: any) => {
          callback(null, {
            rows: [
              { id_area: 1, area: { type: 'Polygon', coordinates: [] } },
              { id_area: 2, area: { type: 'Polygon', coordinates: [] } },
            ],
          });
        });

      const result = await areaDAO.getAllAreas();

      expect(result).toEqual([
        new Area(1, { type: 'Polygon', coordinates: [] }),
        new Area(2, { type: 'Polygon', coordinates: [] }),
      ]);
      expect(mockDBQuery).toHaveBeenCalledWith(
        'SELECT * FROM areas',
        expect.any(Function),
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const areaDAO = new AreaDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, callback: any) => {
          callback(new Error('Database error'));
        });

      await expect(areaDAO.getAllAreas()).rejects.toThrow('Database error');
      mockDBQuery.mockRestore();
    });
  });

  describe('addArea', () => {
    test('It should add a new area and return its id', async () => {
      const areaDAO = new AreaDAO();
      const mockCheckExistingArea = jest
        .spyOn(areaDAO, 'checkExistingArea')
        .mockResolvedValue(-1);
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [{ id_area: 1 }] });
        });

      const result = await areaDAO.addArea([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);

      expect(result).toBe(1);
      expect(mockCheckExistingArea).toHaveBeenCalledWith([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
      expect(mockDBQuery).toHaveBeenCalledWith(
        `INSERT INTO areas (area) VALUES (ST_GeomFromText($1, 4326))
    RETURNING id_area`,
        ['POLYGON((2 1,4 3,6 5))'],
        expect.any(Function),
      );
      mockCheckExistingArea.mockRestore();
      mockDBQuery.mockRestore();
    });

    test('It should return the id if the area already exists', async () => {
      const areaDAO = new AreaDAO();
      const mockCheckExistingArea = jest
        .spyOn(areaDAO, 'checkExistingArea')
        .mockResolvedValue(1);

      const result = await areaDAO.addArea([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);

      expect(result).toBe(1);
      expect(mockCheckExistingArea).toHaveBeenCalledWith([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
      mockCheckExistingArea.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const areaDAO = new AreaDAO();
      const mockCheckExistingArea = jest
        .spyOn(areaDAO, 'checkExistingArea')
        .mockResolvedValue(-1);
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'));
        });

      await expect(
        areaDAO.addArea([
          [1, 2],
          [3, 4],
          [5, 6],
        ]),
      ).rejects.toThrow('Database error');
      mockCheckExistingArea.mockRestore();
      mockDBQuery.mockRestore();
    });
  });

  describe('checkExistingArea', () => {
    test('It should return the id if the area exists', async () => {
      const areaDAO = new AreaDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [{ id_area: 1 }] });
        });

      const result = await areaDAO.checkExistingArea([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);

      expect(result).toBe(1);
      expect(mockDBQuery).toHaveBeenCalledWith(
        `SELECT id_area FROM areas WHERE ST_Equals(ST_GeomFromText($1, 4326), area) LIMIT 1`,
        ['POLYGON((2 1,4 3,6 5))'],
        expect.any(Function),
      );
      mockDBQuery.mockRestore();
    });

    test('It should return -1 if the area does not exist', async () => {
      const areaDAO = new AreaDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [] });
        });

      const result = await areaDAO.checkExistingArea([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);

      expect(result).toBe(-1);
      expect(mockDBQuery).toHaveBeenCalledWith(
        `SELECT id_area FROM areas WHERE ST_Equals(ST_GeomFromText($1, 4326), area) LIMIT 1`,
        ['POLYGON((2 1,4 3,6 5))'],
        expect.any(Function),
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const areaDAO = new AreaDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'));
        });

      await expect(
        areaDAO.checkExistingArea([
          [1, 2],
          [3, 4],
          [5, 6],
        ]),
      ).rejects.toThrow('Database error');
      mockDBQuery.mockRestore();
    });
  });
});
