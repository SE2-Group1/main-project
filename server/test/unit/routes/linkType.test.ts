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
import LinkTypeController from '../../../src/controllers/linkTypeController';
import Authenticator from '../../../src/routers/auth';

jest.mock('../../../src/controllers/linkTypeController');
jest.mock('../../../src/routers/auth');

const baseURL = '/kiruna/api/linktypes';

describe('LinkType routes', () => {
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
        .spyOn(LinkTypeController.prototype, 'addLinkType')
        .mockResolvedValueOnce(true);

      const response = await request(app).post(`${baseURL}/`).send({
        link_type: 'test',
      });

      expect(response.status).toBe(200);
      expect(LinkTypeController.prototype.addLinkType).toHaveBeenCalledWith(
        'test',
      );
    });
    test('It should throw an error if the add LinkType fails', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(LinkTypeController.prototype, 'addLinkType')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).post(`${baseURL}/`).send({
        link_type: 'test',
      });

      expect(response.status).toBe(503);
      expect(LinkTypeController.prototype.addLinkType).toHaveBeenCalledWith(
        'test',
      );
    });
  });

  describe('GET /', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(LinkTypeController.prototype, 'getAllLinkTypes')
        .mockResolvedValueOnce([]);

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(200);
      expect(LinkTypeController.prototype.getAllLinkTypes).toHaveBeenCalled();
    });
    test('It should throw an error if the get all LinkTypes fails', async () => {
      jest
        .spyOn(LinkTypeController.prototype, 'getAllLinkTypes')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(503);
      expect(LinkTypeController.prototype.getAllLinkTypes).toHaveBeenCalled();
    });
  });

  describe('GET /:link_type', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(LinkTypeController.prototype, 'getLinkTypes')
        .mockResolvedValueOnce({ link_type: 'test' });

      const response = await request(app).get(`${baseURL}/test`);

      expect(response.status).toBe(200);
      expect(LinkTypeController.prototype.getLinkTypes).toHaveBeenCalledWith(
        'test',
      );
    });
    test('It should throw an error if the get LinkType fails', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(LinkTypeController.prototype, 'getLinkTypes')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).get(`${baseURL}/test`);

      expect(response.status).toBe(503);
      expect(LinkTypeController.prototype.getLinkTypes).toHaveBeenCalledWith(
        'test',
      );
    });
  });
});
