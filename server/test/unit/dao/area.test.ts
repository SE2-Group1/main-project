import { QueryResult } from 'pg';

import { Area } from '../../../src/components/area';
import AreaDAO from '../../../src/dao/areaDAO';
import db from '../../../src/db/db';

jest.mock('../../../src/db/db'); // Mock the database module

describe('AreaDAO', () => {
  let areaDAO: AreaDAO;

  beforeEach(() => {
    areaDAO = new AreaDAO();
    jest.clearAllMocks();
  });

  describe('getAllAreas', () => {
    it('should return all areas', async () => {
      const mockAreas = [
        {
          id_area: 3,
          area_geojson: '{"type":"Point","coordinates":[12.4924,41.8902]}',
          name_area: 'Area1',
        },
        {
          id_area: 2,
          area_geojson:
            '{"type":"Polygon","coordinates":[[[12.4924,41.8902],[12.4934,41.8912]]]}',
          name_area: 'Area2',
        },
      ];
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(null, { rows: mockAreas } as QueryResult<any>);
      });

      const areas = await areaDAO.getAllAreas();

      expect(db.query).toHaveBeenCalledWith(
        `SELECT id_area, name_area, ST_AsGeoJSON(area) AS area_geojson FROM areas`,
        expect.any(Function),
      );
      expect(areas).toHaveLength(2);
      expect(areas[0]).toBeInstanceOf(Area);
      expect(areas[0].id_area).toBe(3);
      expect(areas[1].coordinates).toEqual([
        { lon: 12.4924, lat: 41.8902 },
        { lon: 12.4934, lat: 41.8912 },
      ]);
    });

    it('should throw an error if the query fails', async () => {
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(mockError, null);
      });

      await expect(areaDAO.getAllAreas()).rejects.toThrow('Database error');
    });
  });

  describe('addArea', () => {
    it('should return existing area ID if the area exists', async () => {
      jest.spyOn(areaDAO, 'checkExistingArea').mockResolvedValue(5);

      const id = await areaDAO.addArea([[41.8902, 12.4924]], 'Area1');

      expect(areaDAO.checkExistingArea).toHaveBeenCalledWith([
        [41.8902, 12.4924],
      ]);
      expect(id).toBe(5);
    });

    it('should insert a new point area and return its ID', async () => {
      jest.spyOn(areaDAO, 'checkExistingArea').mockResolvedValue(-1);
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [{ id_area: 10 }] });
      });

      const id = await areaDAO.addArea([[12.4924, 41.8902]], 'Area1');

      expect(areaDAO.checkExistingArea).toHaveBeenCalledWith([
        [12.4924, 41.8902],
      ]);
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['POINT(12.4924 41.8902)', 'Area1'],
        expect.any(Function),
      );
      expect(id).toBe(10);
    });
    it('should insert a new polygon area and return its ID', async () => {
      jest.spyOn(areaDAO, 'checkExistingArea').mockResolvedValue(-1);
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [{ id_area: 15 }] });
      });

      const coordinates = [
        [12.4924, 41.8902],
        [12.4934, 41.8912],
        [12.4944, 41.8922],
      ];

      const id = await areaDAO.addArea(coordinates, 'Area1');

      expect(areaDAO.checkExistingArea).toHaveBeenCalledWith(coordinates);
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['POLYGON((12.4924 41.8902,12.4934 41.8912,12.4944 41.8922))', 'Area1'],
        expect.any(Function),
      );
      expect(id).toBe(15);
    });
    it('should throw an error if the query fails', async () => {
      jest.spyOn(areaDAO, 'checkExistingArea').mockResolvedValue(-1);
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(
        areaDAO.addArea([[12.4924, 41.8902]], 'Area1'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('checkExistingArea', () => {
    it('should return the area ID if the area exists', async () => {
      const mockResult = { rows: [{ id_area: 7 }] };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, mockResult);
      });

      const id = await areaDAO.checkExistingArea([[12.4924, 41.8902]]);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['POINT(12.4924 41.8902)'],
        expect.any(Function),
      );
      expect(id).toBe(7);
    });

    it('should return -1 if the area does not exist', async () => {
      const mockResult = { rows: [] };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, mockResult);
      });

      const id = await areaDAO.checkExistingArea([[12.4924, 41.8902]]);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['POINT(12.4924 41.8902)'],
        expect.any(Function),
      );
      expect(id).toBe(-1);
    });

    it('should throw an error if the query fails', async () => {
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(
        areaDAO.checkExistingArea([[12.4924, 41.8902]]),
      ).rejects.toThrow('Database error');
    });
  });

  describe('checkPointInsideArea', () => {
    it('should return true if the point is inside the area', async () => {
      const mockResult = { rows: [{ st_contains: true }] };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, mockResult);
      });

      const isInside = await areaDAO.checkPointInsideArea([12.4924, 41.8902]);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [12.4924, 41.8902],
        expect.any(Function),
      );
      expect(isInside).toBe(true);
    });

    it('should return false if the point is outside the area', async () => {
      const mockResult = { rows: [{ st_contains: false }] };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, mockResult);
      });

      const isInside = await areaDAO.checkPointInsideArea([12.4924, 41.8902]);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [12.4924, 41.8902],
        expect.any(Function),
      );
      expect(isInside).toBe(false);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(
        areaDAO.checkPointInsideArea([12.4924, 41.8902]),
      ).rejects.toThrow('Database error');
    });

    it('should throw an error if the query fails', async () => {
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      await expect(
        areaDAO.checkPointInsideArea([12.4924, 41.8902]),
      ).rejects.toThrow('Database error');
    });
  });
});
