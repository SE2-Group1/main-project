const USER_NOT_FOUND = 'The user does not exist';
const USER_ALREADY_EXISTS = 'The username already exists';

/**
 * Represents an error that occurs when a user is not found.
 */
class UserNotFoundError extends Error {
  customMessage: string;
  customCode: number;

  constructor() {
    super();
    this.customMessage = USER_NOT_FOUND;
    this.customCode = 404;
  }
}

/**
 * Represents an error that occurs when a username is already in use.
 */
class UserAlreadyExistsError extends Error {
  customMessage: String;
  customCode: Number;

  constructor() {
    super();
    this.customMessage = USER_ALREADY_EXISTS;
    this.customCode = 409;
  }
}

export { UserNotFoundError, UserAlreadyExistsError };
