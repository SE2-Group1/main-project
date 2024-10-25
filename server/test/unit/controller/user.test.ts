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
  beforeEach(() => {
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
        name: 'test',
        surname: 'test',
        password: 'test',
        role: 'Manager',
      };
      jest.spyOn(UserDAO.prototype, 'createUser').mockResolvedValueOnce(true); //Mock the createUser method of the DAO
      const controller = new UserController(); //Create a new instance of the controller
      //Call the createUser method of the controller with the test user object
      const response = await controller.createUser(
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
      const controller = new UserController();
      const response = await controller.getUserByUsername(
        testAdmin,
        'testAdmin',
      );
      expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
      expect(response).toBe(testAdmin);
    });
  });
});
