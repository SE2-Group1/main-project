import { User } from '../components/user';
import UserDAO from '../dao/userDAO';

/**
 * Represents a controller for managing users.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class UserController {
  private dao: UserDAO;

  constructor() {
    this.dao = new UserDAO();
  }

  /**
   * Creates a new user.
   * @param username - The username of the new user. It must not be null and it must not be already taken.
   * @param password - The password of the new user. It must not be null.
   * @param role - The role of the new user. It must not be null and it can only be one of the three allowed types ("Manager", "Customer", "Admin")
   * @returns A Promise that resolves to true if the user has been created.
   */
  async createUser(
    username: string,
    password: string,
    role: string,
  ): Promise<Boolean> {
    return this.dao.createUser(username, password, role);
  }

  /**
   * Returns a specific user.
   * The function has different behavior depending on the role of the user calling it:
   * - Admins can retrieve any user
   * - Other roles can only retrieve their own information
   * @param username - The username of the user to retrieve. The user must exist.
   * @returns A Promise that resolves to the user with the specified username.
   */
  async getUserByUsername(user: User, username: string): Promise<User> {
    return this.dao.getUserByUsername(username);
  }
}

export default UserController;
