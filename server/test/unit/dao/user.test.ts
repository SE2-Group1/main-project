import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import crypto from 'crypto';
import { Database } from 'sqlite3';

import { Role, User } from '../../../src/components/user';
import UserDAO from '../../../src/dao/userDAO';
import db from '../../../src/db/db';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../../src/errors/userError';

jest.mock('crypto');
jest.mock('../../../src/db/db.ts');

const testAdmin = new User('testAdmin', Role.ADMIN);

describe('userDAO', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    test('It should resolve true', async () => {
      const userDAO = new UserDAO();
      const mockDBRun = jest
        .spyOn(db, 'run')
        .mockImplementation((sql, params, callback) => {
          callback(null);
          return {} as Database;
        });
      const mockRandomBytes = jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementation(size => {
          return Buffer.from('salt');
        });
      const mockScrypt = jest
        .spyOn(crypto, 'scrypt')
        .mockImplementation(async (password, salt, keylen) => {
          return Buffer.from('hashedPassword');
        });
      const result = await userDAO.createUser('username', 'password', 'role');
      expect(result).toBe(true);
      mockRandomBytes.mockRestore();
      mockDBRun.mockRestore();
      mockScrypt.mockRestore();
    });
    test('It should throw an error, user already exists', async () => {
      const userDAO = new UserDAO();
      const mockDBRun = jest
        .spyOn(db, 'run')
        .mockImplementation((sql, params, callback) => {
          callback(new Error('UNIQUE constraint failed: users.username'));
          return {} as Database;
        });
      const mockRandomBytes = jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementation(size => {
          return Buffer.from('salt');
        });
      const mockScrypt = jest
        .spyOn(crypto, 'scrypt')
        .mockImplementation(async (password, salt, keylen) => {
          return Buffer.from('hashedPassword');
        });
      expect(
        userDAO.createUser('username', 'password', 'role'),
      ).rejects.toThrow(UserAlreadyExistsError);
      mockRandomBytes.mockRestore();
      mockDBRun.mockRestore();
      mockScrypt.mockRestore();
    });
  });
  describe('getUserByUsername', () => {
    test('It should return the user with the specified username', async () => {
      const userDAO = new UserDAO();
      const mockDBGet = jest
        .spyOn(db, 'get')
        .mockImplementation((sql, params, callback) => {
          callback(null, testAdmin);
          return {} as Database;
        });
      const result = await userDAO.getUserByUsername('testAdmin');
      expect(result).toEqual(testAdmin);
      mockDBGet.mockRestore();
    });
    test('It should throw an error, user not found', async () => {
      const userDAO = new UserDAO();
      const mockDBGet = jest
        .spyOn(db, 'get')
        .mockImplementation((sql, params, callback) => {
          callback(null, null);
          return {} as Database;
        });
      expect(userDAO.getUserByUsername('testAdmin')).rejects.toThrow(
        UserNotFoundError,
      );
      mockDBGet.mockRestore();
    });
    test('It should throw an error', async () => {
      const userDAO = new UserDAO();
      const mockDBGet = jest
        .spyOn(db, 'get')
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), null);
          return {} as Database;
        });
      expect(userDAO.getUserByUsername('testAdmin')).rejects.toThrow();
      mockDBGet.mockRestore();
    });
  });
});
