import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import request from 'supertest';

import { app } from '../../../index';
import ResourceController from '../../../src/controllers/resourceController';
import Authenticator from '../../../src/routers/auth';

const baseURL = '/kiruna/api/resources';

jest.mock('../../../src/controllers/resourceController');
jest.mock('../../../src/routers/auth');

describe('Resource routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /resources', () => {
    test('It should return a 200 success code with a list of resources', async () => {
      const mockResources = [
        { id: 1, name: 'Resource1', pages: 10, file: null },
        { id: 2, name: 'Resource2', pages: 20, file: null },
      ];
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ResourceController.prototype, 'getAllResources')
        .mockResolvedValueOnce(mockResources);

      const response = await request(app).get(baseURL);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResources);
      expect(
        ResourceController.prototype.getAllResources,
      ).toHaveBeenCalledTimes(1);
    });

    test('It should return a 503 error if there is a server error', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ResourceController.prototype, 'getAllResources')
        .mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app).get(baseURL);

      expect(response.status).toBe(503);
      expect(
        ResourceController.prototype.getAllResources,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /resources/:resourceId', () => {
    test('It should return a 200 success code for a valid resource', async () => {
      const mockResource = {
        id: 1,
        name: 'Resource1',
        pages: 10,
        file: Buffer.from('file content'),
      };
      jest
        .spyOn(ResourceController.prototype, 'getResourceById')
        .mockResolvedValueOnce(mockResource);

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/octet-stream');
      expect(response.header['content-disposition']).toBe(
        'inline; filename="Resource1"',
      );
      expect(response.body).toEqual(Buffer.from('file content'));
      expect(
        ResourceController.prototype.getResourceById,
      ).toHaveBeenCalledTimes(1);
      expect(ResourceController.prototype.getResourceById).toHaveBeenCalledWith(
        '1',
      );
    });

    test('It should return a 404 error if the resource is not found', async () => {
      jest
        .spyOn(ResourceController.prototype, 'getResourceById')
        .mockRejectedValueOnce(new Error('Resource not found'));

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('Resource not found');
      expect(
        ResourceController.prototype.getResourceById,
      ).toHaveBeenCalledTimes(1);
      expect(ResourceController.prototype.getResourceById).toHaveBeenCalledWith(
        '1',
      );
    });

    test('It should return a 404 error for an invalid resource ID', async () => {
      const response = await request(app).get(`${baseURL}/invalid-id`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('Invalid resource ID');
    });

    test('It should return a 404 error if the file buffer is not available', async () => {
      const mockResource = { id: 1, name: 'Resource1', pages: 10, file: null };
      jest
        .spyOn(ResourceController.prototype, 'getResourceById')
        .mockResolvedValueOnce(mockResource);

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('File buffer not available');
      expect(
        ResourceController.prototype.getResourceById,
      ).toHaveBeenCalledTimes(1);
      expect(ResourceController.prototype.getResourceById).toHaveBeenCalledWith(
        '1',
      );
    });
  });

  describe('GET /resources/doc/:docId', () => {
    test('It should return a 200 success code with a list of resources linked to a document', async () => {
      const mockResources = [
        { id: 1, name: 'Resource1', pages: 10, file: null },
        { id: 2, name: 'Resource2', pages: 20, file: null },
      ];
      jest
        .spyOn(ResourceController.prototype, 'getResourcesByDocId')
        .mockResolvedValueOnce(mockResources);

      const response = await request(app).get(`${baseURL}/doc/1`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResources);
      expect(
        ResourceController.prototype.getResourcesByDocId,
      ).toHaveBeenCalledTimes(1);
      expect(
        ResourceController.prototype.getResourcesByDocId,
      ).toHaveBeenCalledWith('1');
    });

    test('It should return a 200 if no resources are found for the document', async () => {
      jest
        .spyOn(ResourceController.prototype, 'getResourcesByDocId')
        .mockResolvedValueOnce([]);

      const response = await request(app).get(`${baseURL}/doc/1`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('[]');
      expect(
        ResourceController.prototype.getResourcesByDocId,
      ).toHaveBeenCalledTimes(1);
      expect(
        ResourceController.prototype.getResourcesByDocId,
      ).toHaveBeenCalledWith('1');
    });

    test('It should return a 503 error if there is a server error', async () => {
      jest
        .spyOn(ResourceController.prototype, 'getResourcesByDocId')
        .mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app).get(`${baseURL}/doc/1`);

      expect(response.status).toBe(503);
      expect(
        ResourceController.prototype.getResourcesByDocId,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
