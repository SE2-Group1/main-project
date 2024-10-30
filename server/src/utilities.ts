import { Role, User } from './components/user';

/**
 * Represents a utility class.
 */
class Utility {
  static isAdmin(user: User): boolean {
    return user.role === Role.ADMIN;
  }

  static isUrbanPlanner(user: User): boolean {
    return user.role === Role.URBAN_PLANNER;
  }

  static isResident(user: User): boolean {
    return user.role === Role.RESIDENT;
  }

  static isVisitor(user: User): boolean {
    return user.role === Role.VISITOR;
  }

  static isUrbanDeveloper(user: User): boolean {
    return user.role === Role.URBAN_DEVELOPER;
  }
}

export { Utility };
