import { Role, User } from './components/user';

/**
 * Represents a utility class.
 */
class Utility {
  static isAdmin(user: User): boolean {
    return user.role === Role.ADMIN;
  }
}

export { Utility };
