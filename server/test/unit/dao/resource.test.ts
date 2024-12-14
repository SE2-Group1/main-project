import fs from 'fs';

import { Resource } from '../../../src/components/resource';
import ResourceDAO from '../../../src/dao/resourceDAO';
import db from '../../../src/db/db';

jest.mock('../../../src/db/db');

describe('ResourceDAO', () => {
  let resourceDAO: ResourceDAO;

  beforeEach(() => {
    resourceDAO = new ResourceDAO();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllResources', () => {
    it('should return all resources', async () => {
      const mockResources = [
        { resourceid: 1, resource_name: 'resource1', resource_pages: 10 },
        { resourceid: 2, resource_name: 'resource2', resource_pages: 20 },
      ];
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(null, { rows: mockResources });
      });

      const result = await resourceDAO.getAllResources();
      expect(result).toEqual([
        new Resource(1, 'resource1', 10, null),
        new Resource(2, 'resource2', 20, null),
      ]);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(resourceDAO.getAllResources()).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('getResourceById', () => {
    it('should return a specific resource', async () => {
      const mockResource = {
        resourceid: 1,
        resource_name: 'resource1',
        resource_pages: 10,
        resource_hash: 'hash1',
      };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockResource], rowCount: 1 });
      });
      jest
        .spyOn(fs.promises, 'readFile')
        .mockResolvedValue(Buffer.from('file content'));

      const result = await resourceDAO.getResourceById(1);
      expect(result).toEqual(
        new Resource(1, 'resource1', 10, Buffer.from('file content')),
      );
    });

    it('should throw an error if the resource is not found', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rowCount: 0 });
      });

      await expect(resourceDAO.getResourceById(1)).rejects.toThrow(
        'Resource not found',
      );
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(resourceDAO.getResourceById(1)).rejects.toThrow(
        'Query failed',
      );
    });

    it('should throw an error if reading the file fails', async () => {
      const mockResource = {
        resourceid: 1,
        resource_name: 'resource1',
        resource_pages: 10,
        resource_hash: 'hash1',
      };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockResource], rowCount: 1 });
      });
      jest
        .spyOn(fs.promises, 'readFile')
        .mockRejectedValue(new Error('File read failed'));

      await expect(resourceDAO.getResourceById(1)).rejects.toThrow(
        'File read failed',
      );
    });
  });

  describe('getResourcesByDocId', () => {
    it('should return all resources linked to a specific document', async () => {
      const mockResources = [
        { resourceid: 1, resource_name: 'resource1', resource_pages: 10 },
        { resourceid: 2, resource_name: 'resource2', resource_pages: 20 },
      ];
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: mockResources });
      });

      const result = await resourceDAO.getResourcesByDocId(1);
      expect(result).toEqual([
        new Resource(1, 'resource1', 10, null),
        new Resource(2, 'resource2', 20, null),
      ]);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(resourceDAO.getResourcesByDocId(1)).rejects.toThrow(
        'Query failed',
      );
    });
  });
});
