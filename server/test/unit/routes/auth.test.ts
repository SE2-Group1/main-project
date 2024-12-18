import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import passport from 'passport';
import request from 'supertest';

import { app } from '../../../index';
import { User } from '../../../src/components/user';
import { Role } from '../../../src/components/user';
import ErrorHandler from '../../../src/helper';
import Authenticator from '../../../src/routers/auth';

const baseURL = '/kiruna/api';

jest.mock('../../../src/controllers/userController');
jest.mock('../../../src/routers/auth');

const loginUser = {
  username: 'testAdmin',
  password: 'test',
};
const testAdmin = new User('testAdmin', Role.ADMIN);

describe('Auth routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /sessions', () => {
    test('It should return a 200 success code', async () => {
      // mock the express-validator functions
      jest.mock('express-validator', () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());
      // mock login method
      jest
        .spyOn(Authenticator.prototype, 'login')
        .mockResolvedValueOnce(testAdmin);

      const response = await request(app)
        .post(baseURL + '/sessions')
        .send(loginUser); //Send a POST request to the route

      expect(response.status).toBe(200); //Check if the response status is 200
      expect(Authenticator.prototype.login).toHaveBeenCalledTimes(1); //Check if the login method has been called once
    });
  });
  describe('GET /sessions/current', () => {
    test('It should return a 200 success code', async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, 'isLoggedIn')
        .mockImplementation((req, res, next) => {
          next();
        });
      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());

      const response = await request(app).get(baseURL + '/sessions/current');

      expect(response.status).toBe(200); //Check if the response status is 200
    });
  });
  describe('DELETE /sessions/current', () => {
    test('It should return a 200 success code', async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, 'isLoggedIn')
        .mockImplementation((req, res, next) => {
          next();
        });
      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());

      // mock logout method
      jest.spyOn(Authenticator.prototype, 'logout').mockResolvedValueOnce(null);

      const response = await request(app).delete(baseURL + '/sessions/current');

      expect(response.status).toBe(200); //Check if the response status is 200
      expect(Authenticator.prototype.logout).toHaveBeenCalledTimes(1); //Check if the logout method has been called once
    });
  });
  describe('deserializing user', () => {
    test('It should return a 200 success code', async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, 'isLoggedIn')
        .mockImplementation((req, res, next) => {
          next();
        });
      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());

      const response = await request(app).get(baseURL + '/sessions/current');

      expect(response.status).toBe(200); //Check if the response status is 200
    });
  });
  describe('passport.deserializeUser', () => {
    let dao: { getUserByUsername: jest.Mock<any> };
    //let deserializeUser: (user: any, done: any) => void;

    beforeEach(() => {
      dao = {
        getUserByUsername: jest.fn(),
      };
      // Bind deserializeUser to the mocked context
      passport.deserializeUser(function (id: any, done) {
        dao
          .getUserByUsername(id.username)
          .then((retrievedUser: User) => done(null, retrievedUser))
          .catch((err: Error) => done(err));
      });
    });

    it('should call done with user if user is found', async () => {
      const mockUser = { username: 'testuser' };
      const mockRetrievedUser = {
        username: 'testuser',
        email: 'test@test.com',
      };

      dao.getUserByUsername.mockResolvedValue(mockRetrievedUser);

      const done = jest.fn();

      jest.mock('passport', () => ({
        deserializeUser: jest.fn(callback => callback),
      }));

      await passport.deserializeUser(mockUser, done);

      expect(dao.getUserByUsername).toHaveBeenCalledWith(mockUser.username);
      expect(done).toHaveBeenCalledWith(null, mockRetrievedUser);
    });
  });
});
