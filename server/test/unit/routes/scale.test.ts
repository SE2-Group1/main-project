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
import ScaleController from '../../../src/controllers/scaleController';
import Authenticator from '../../../src/routers/auth';

jest.mock('../../../src/controllers/scaleController');
jest.mock('../../../src/routers/auth');

const baseURL = '/kiruna/api/scales';

describe('Scale routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ScaleController.prototype, 'addScale')
        .mockResolvedValueOnce(true);

      const response = await request(app).post(`${baseURL}/`).send({
        scale: '1',
      });

      expect(response.status).toBe(200);
      expect(ScaleController.prototype.addScale).toHaveBeenCalledWith('1');
    });
    test('It should throw an error if the add Scale fails', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ScaleController.prototype, 'addScale')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).post(`${baseURL}/`).send({
        scale: '1',
      });

      expect(response.status).toBe(503);
      expect(ScaleController.prototype.addScale).toHaveBeenCalledWith('1');
    });
  });
  describe('GET /', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(ScaleController.prototype, 'getAllScales')
        .mockResolvedValueOnce([{ scale: '1' }]);

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ scale: '1' }]);
    });
    test('It should throw an error if the get all scales fails', async () => {
      jest
        .spyOn(ScaleController.prototype, 'getAllScales')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(503);
    });
  });
  describe('GET /:scale', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ScaleController.prototype, 'getScale')
        .mockResolvedValueOnce({ scale: '1' });

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(200);
    });
    test('It should throw an error if the get scale fails', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ScaleController.prototype, 'getScale')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(503);
    });
  });
});
