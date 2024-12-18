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
import LanguageController from '../../../src/controllers/languageController';
import Authenticator from '../../../src/routers/auth';

jest.mock('../../../src/controllers/languageController');
jest.mock('../../../src/routers/auth');

const baseURL = '/kiruna/api/languages';

describe('Language routes', () => {
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
        .spyOn(LanguageController.prototype, 'addLanguage')
        .mockResolvedValueOnce(true);

      const response = await request(app).post(`${baseURL}/`).send({
        language_id: 'en',
        language_name: 'English',
      });

      expect(response.status).toBe(200);
      expect(LanguageController.prototype.addLanguage).toHaveBeenCalledWith(
        'en',
        'English',
      );
    });
    test('It should throw an error if the add Language fails', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(LanguageController.prototype, 'addLanguage')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).post(`${baseURL}/`).send({
        language_id: 'en',
        language_name: 'English',
      });

      expect(response.status).toBe(503);
    });
  });
  describe('GET /', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(LanguageController.prototype, 'getAllLanguages')
        .mockResolvedValueOnce([
          {
            language_id: 'en',
            language_name: 'English',
          },
        ]);

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          language_id: 'en',
          language_name: 'English',
        },
      ]);
    });
    test('It should throw an error if the get all languages fails', async () => {
      jest
        .spyOn(LanguageController.prototype, 'getAllLanguages')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(503);
    });
  });
  describe('GET /:language', () => {
    test('should return 200 on success', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(LanguageController.prototype, 'getLanguage')
        .mockResolvedValueOnce({
          language_id: 'en',
          language_name: 'English',
        });

      const response = await request(app).get(`${baseURL}/en`);

      expect(response.status).toBe(200);
      expect(LanguageController.prototype.getLanguage).toHaveBeenCalledWith(
        'en',
      );
    });
    test('It should throw an error if the get language fails', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(LanguageController.prototype, 'getLanguage')
        .mockRejectedValueOnce(new Error('Error'));

      const response = await request(app).get(`${baseURL}/en`);

      expect(response.status).toBe(503);
    });
  });
});
