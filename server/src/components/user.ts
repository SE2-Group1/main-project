/**
 * Represents a user in the system.
 */
class User {
  username: string;
  role: Role;

  /**
   * Creates a new instance of the User class.
   * @param username - The username of the user. This is unique for each user.
   * @param role - The role of the user.
   */
  constructor(username: string, role: Role) {
    this.username = username;
    this.role = role;
  }
}

/**
 * Represents the role of a user.
 * The values present in this enum are the only valid values for the role of a user.
 */
enum Role {
  ADMIN = 'Admin',
}

export { User, Role };
