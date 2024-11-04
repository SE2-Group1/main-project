import crypto from 'crypto';

import { User } from '../components/user';
import db from '../db/db';
import { UserAlreadyExistsError, UserNotFoundError } from '../errors/userError';

/**
 * A class that implements the interaction with the database for all user-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class UserDAO {
  /**
   * Checks whether the information provided during login (username and password) is correct.
   * @param username The username of the user.
   * @param plainPassword The password of the user (in plain text).
   * @returns A Promise that resolves to true if the user is authenticated, false otherwise.
   */
  getIsUserAuthenticated(
    username: string,
    plainPassword: string,
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        /**
         * Example of how to retrieve user information from a table that stores username, encrypted password and salt (encrypted set of 16 random bytes that ensures additional protection against dictionary attacks).
         * Using the salt is not mandatory (while it is a good practice for security), however passwords MUST be hashed using a secure algorithm (e.g. scrypt, bcrypt, argon2).
         */
        const sql =
          'SELECT username, password, salt FROM users WHERE username = $1';
        db.query(sql, [username], (err: Error | null, result: any) => {
          if (err) reject(err);
          //If there is no user with the given username, or the user salt is not saved in the database, the user is not authenticated.
          if (!result || !result.rows) {
            resolve(false);
          } else {
            //Hashes the plain password using the salt and then compares it with the hashed password stored in the database
            const row = result.rows[0];
            const hashedPassword = crypto.scryptSync(
              plainPassword,
              row.salt,
              16,
            );
            const passwordHex = Buffer.from(row.password, 'hex');
            if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
              resolve(false);
            resolve(true);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Creates a new user and saves their information in the database
   * @param username The username of the user. It must be unique.
   * @param password The password of the user. It must be encrypted using a secure algorithm (e.g. scrypt, bcrypt, argon2)
   * @param role The role of the user.
   * @returns A Promise that resolves to true if the user has been created.
   */
  createUser(
    username: string,
    password: string,
    role: string,
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const salt = crypto.randomBytes(16);
        const hashedPassword = crypto.scryptSync(password, salt, 16);
        const sql =
          'INSERT INTO users(username, role, password, salt) VALUES($1, $2, $3, $4)';
        db.query(
          sql,
          [username, role, hashedPassword, salt],
          (err: Error | null) => {
            if (err) {
              if (
                err.message.includes(
                  'duplicate key value violates unique constraint "users_pkey"',
                )
              )
                reject(new UserAlreadyExistsError());
              reject(err);
            }
            resolve(true);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns a user object from the database based on the username.
   * @param username The username of the user to retrieve
   * @returns A Promise that resolves the information of the requested user
   */
  getUserByUsername(username: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM users WHERE username = $1';
        db.query(sql, [username], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result || !result.rows) {
            reject(new UserNotFoundError());
            return;
          }
          const row = result.rows[0];
          const user: User = new User(row.username, row.role);
          resolve(user);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
export default UserDAO;