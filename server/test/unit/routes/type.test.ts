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
import TypeController from '../../../src/controllers/typeController';
import ErrorHandler from '../../../src/helper';
import Authenticator from '../../../src/routers/auth';

const baseURL = '/kiruna/api/types';

jest.mock('../../../src/controllers/typeController');
jest.mock('../../../src/routers/auth');

const newType = {
  type_name: 'Residential',
};

describe('Type routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /types', () => {
    test('It should return a 200 success code', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(TypeController.prototype, 'addType')
        .mockResolvedValueOnce(true);

      const response = await request(app).post(baseURL).send(newType);

      expect(response.status).toBe(200);
      expect(TypeController.prototype.addType).toHaveBeenCalledTimes(1);
      expect(TypeController.prototype.addType).toHaveBeenCalledWith(
        newType.type_name,
      );
    });
  });

  describe('GET /types', () => {
    test('It should return a 200 success code with a list of types', async () => {
      const mockTypes = [{ type_name: 'test1' }, { type_name: 'test2' }];
      jest
        .spyOn(TypeController.prototype, 'getAllTypes')
        .mockResolvedValueOnce(mockTypes);

      const response = await request(app).get(baseURL);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTypes);
      expect(TypeController.prototype.getAllTypes).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /types/:type', () => {
    test('It should return a 200 success code for a valid type', async () => {
      const mockType = { type_name: 'testType' };
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => {
          req.params = { type: 'testType' };
          next();
        });

      jest
        .spyOn(TypeController.prototype, 'getType')
        .mockImplementation((type: any) => {
          return Promise.resolve(mockType);
        });

      const response = await request(app).get(`${baseURL}/testType`);

      expect(response.status).toBe(200);
      expect(TypeController.prototype.getType).toHaveBeenCalledTimes(1);
      expect(TypeController.prototype.getType).toHaveBeenCalledWith('testType');
    });
  });
});
