import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import crypto from 'crypto';

import { Role, User } from '../../../src/components/user';
import UserDAO from '../../../src/dao/userDAO';
import db from '../../../src/db/db';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../../src/errors/userError';

jest.mock('../../../src/db/db');

const testAdmin = new User('testAdmin', Role.ADMIN);

describe('userDAO', () => {
  let userDAO: UserDAO;
  beforeEach(() => {
    userDAO = new UserDAO();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    test('It should resolve true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });
      // Mocking the randomBytes and scrypt methods
      jest.spyOn(crypto, 'randomBytes').mockImplementation(size => {
        return Buffer.from('salt');
      });
      jest
        .spyOn(crypto, 'scrypt')
        .mockImplementation(async (password, salt, keylen) => {
          return Buffer.from('hashedPassword');
        });

      const result = await userDAO.createUser('username', 'password', 'Admin');
      expect(result).toBe(true);
    });
    test('It should throw an error, user already exists', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(
            new Error(
              'duplicate key value violates unique constraint "users_pkey"',
            ),
          );
        });
      // Mocking the randomBytes and scrypt methods
      jest.spyOn(crypto, 'randomBytes').mockImplementation(size => {
        return Buffer.from('salt');
      });
      jest
        .spyOn(crypto, 'scrypt')
        .mockImplementation(async (password, salt, keylen) => {
          return Buffer.from('hashedPassword');
        });

      expect(
        userDAO.createUser('username', 'password', 'role'),
      ).rejects.toThrow(UserAlreadyExistsError);
    });
  });
  describe('getUserByUsername', () => {
    test('It should return the user with the specified username', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [testAdmin] });
        });
      const result = await userDAO.getUserByUsername('testAdmin');
      expect(result).toEqual(testAdmin);
    });
    test('It should throw an error, user not found', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, null);
        });
      expect(userDAO.getUserByUsername('testAdmin')).rejects.toThrow(
        UserNotFoundError,
      );
    });
    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error(), null);
        });
      expect(userDAO.getUserByUsername('testAdmin')).rejects.toThrow();
    });
  });
});
