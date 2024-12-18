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
import StakeholderController from '../../../src/controllers/stakeholderController';
import Authenticator from '../../../src/routers/auth';

jest.mock('../../../src/controllers/stakeholderController.ts');
jest.mock('../../../src/routers/auth');

const baseURL = '/kiruna/api/stakeholders';

describe('Stakeholder routes', () => {
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
        .spyOn(StakeholderController.prototype, 'addStakeholder')
        .mockResolvedValueOnce(true);

      const response = await request(app).post(`${baseURL}/`).send({
        stakeholder: 'stakeholder',
      });

      expect(response.status).toBe(200);
      expect(
        StakeholderController.prototype.addStakeholder,
      ).toHaveBeenCalledWith('stakeholder');
    });
    test('It should throw an error if the add Stakeholder fails', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(StakeholderController.prototype, 'addStakeholder')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).post(`${baseURL}/`).send({
        stakeholder: 'stakeholder',
      });

      expect(response.status).toBe(503);
    });
  });

  describe('GET /:stakeholder', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(StakeholderController.prototype, 'getStakeholder')
        .mockResolvedValueOnce({ stakeholder: 'stakeholder' });

      const response = await request(app).get(`${baseURL}/stakeholder`);

      expect(response.status).toBe(200);
      expect(
        StakeholderController.prototype.getStakeholder,
      ).toHaveBeenCalledWith('stakeholder');
    });
    test('It should throw an error if the get Stakeholder fails', async () => {
      jest
        .spyOn(StakeholderController.prototype, 'getStakeholder')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).get(`${baseURL}/stakeholder`);

      expect(response.status).toBe(503);
    });
  });

  describe('GET /', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(StakeholderController.prototype, 'getAllStakeholders')
        .mockResolvedValueOnce([
          {
            stakeholder: 'stakeholder',
          },
        ]);

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          stakeholder: 'stakeholder',
        },
      ]);
    });
    test('It should throw an error if the get all Stakeholders fails', async () => {
      jest
        .spyOn(StakeholderController.prototype, 'getAllStakeholders')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(503);
    });
  });
});
