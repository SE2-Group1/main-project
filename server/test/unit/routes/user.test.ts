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
import UserController from '../../../src/controllers/userController';
import { UserAlreadyExistsError } from '../../../src/errors/userError';
import ErrorHandler from '../../../src/helper';

const baseURL = '/kiruna/api';

jest.mock('../../../src/controllers/userController');
jest.mock('../../../src/routers/auth');

const newUser = {
  username: 'test',
  password: 'test',
  role: 'Admin',
};

describe('User routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /users', () => {
    test('It should return a 200 success code', async () => {
      // mock the express-validator functions
      jest.mock('express-validator', () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
          notEmpty: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock the validateRequest
      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());

      // mock the createUser method of the controller
      jest
        .spyOn(UserController.prototype, 'createUser')
        .mockResolvedValueOnce(true);

      const response = await request(app)
        .post(baseURL + '/users')
        .send(newUser); //Send a POST request to the route

      expect(response.status).toBe(200); //Check if the response status is 200
      expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1); //Check if the createUser method has been called once
      //Check if the createUser method has been called with the correct parameters
      expect(UserController.prototype.createUser).toHaveBeenCalledWith(
        newUser.username,
        newUser.password,
        newUser.role,
      );
    });
    test('It should return a 409 error code, user already exists', async () => {
      // mock the express-validator functions
      jest.mock('express-validator', () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
          notEmpty: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock the validateRequest
      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());

      // mock the createUser method of the controller
      jest
        .spyOn(UserController.prototype, 'createUser')
        .mockRejectedValue(new UserAlreadyExistsError());

      const response = await request(app)
        .post(baseURL + '/users')
        .send(newUser); //Send a POST request to the route

      expect(response.status).toBe(409); //Check if the response status is 200
    });
  });
});
