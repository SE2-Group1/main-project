import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import { Role, User } from '../../../src/components/user';
import UserController from '../../../src/controllers/userController';
import UserDAO from '../../../src/dao/userDAO';
import { Utility } from '../../../src/utilities';

jest.mock('../../../src/dao/userDAO');

const testAdmin = new User('testAdmin', Role.ADMIN);

describe('Users controller', () => {
  let userController: UserController;
  beforeEach(() => {
    userController = new UserController();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    test('It should return true', async () => {
      const testUser = {
        //Define a test user object
        username: 'test',
        password: 'test',
        role: 'Admin',
      };
      jest.spyOn(UserDAO.prototype, 'createUser').mockResolvedValueOnce(true); //Mock the createUser method of the DAO
      //Call the createUser method of the controller with the test user object
      const response = await userController.createUser(
        testUser.username,
        testUser.password,
        testUser.role,
      );

      //Check if the createUser method of the DAO has been called once with the correct parameters
      expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
      expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(
        testUser.username,
        testUser.password,
        testUser.role,
      );
      expect(response).toBe(true); //Check if the response is true
    });
  });

  describe('getUserByUsername', () => {
    test('it should return a specific user', async () => {
      jest.spyOn(Utility, 'isAdmin').mockReturnValueOnce(true);
      jest
        .spyOn(UserDAO.prototype, 'getUserByUsername')
        .mockResolvedValueOnce(testAdmin);
      const response = await userController.getUserByUsername(
        testAdmin,
        'testAdmin',
      );
      expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
      expect(response).toBe(testAdmin);
    });
  });
});
