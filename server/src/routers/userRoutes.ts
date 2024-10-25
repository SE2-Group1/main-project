import express, { Router } from 'express';
import { body } from 'express-validator';

import { User } from '../components/user';
import UserController from '../controllers/userController';
import ErrorHandler from '../helper';
import Authenticator from './auth';

/**
 * Represents a class that defines the routes for handling users.
 */
class UserRoutes {
  private router: Router;
  private errorHandler: ErrorHandler;
  private controller: UserController;

  /**
   * Constructs a new instance of the UserRoutes class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor() {
    this.router = express.Router();
    this.errorHandler = new ErrorHandler();
    this.controller = new UserController();
    this.initRoutes();
  }

  /**
   * Get the router instance.
   * @returns The router instance.
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Initializes the routes for the user router.
   *
   * @remarks
   * This method sets up the HTTP routes for creating, retrieving, updating, and deleting user data.
   * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
   */
  initRoutes() {
    /**
     * Route for creating a user.
     * It does not require authentication.
     * It requires the following body parameters:
     * - username: string. It cannot be empty and it must be unique (an existing username cannot be used to create a new user)
     * - password: string. It cannot be empty.
     * - role: string (one of "Manager", "Customer", "Admin")
     * It returns a 200 status code.
     */
    this.router.post(
      '/',
      body('username').isString().isLength({ min: 1 }),
      body('password').isString().isLength({ min: 1 }),
      body('role').isString().isIn(['Admin']),
      this.errorHandler.validateRequest,
      (req: any, res: any, next: any) =>
        this.controller
          .createUser(req.body.username, req.body.password, req.body.role)
          .then(() => res.status(200).end())
          .catch(err => {
            next(err);
          }),
    );
  }
}

/**
 * Represents a class that defines the authentication routes for the application.
 */
class AuthRoutes {
  private router: Router;
  private errorHandler: ErrorHandler;
  private authService: Authenticator;

  /**
   * Constructs a new instance of the UserRoutes class.
   * @param authenticator - The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authService = authenticator;
    this.errorHandler = new ErrorHandler();
    this.router = express.Router();
    this.initRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  /**
   * Initializes the authentication routes.
   *
   * @remarks
   * This method sets up the HTTP routes for login, logout, and retrieval of the logged in user.
   * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
   */
  initRoutes() {
    /**
     * Route for logging in a user.
     * It does not require authentication.
     * It expects the following parameters:
     * - username: string. It cannot be empty.
     * - password: string. It cannot be empty.
     * It returns an error if the username represents a non-existing user or if the password is incorrect.
     * It returns the logged in user.
     */
    this.router.post(
      '/',
      body('username').isString().isLength({ min: 1 }),
      body('password').isString().isLength({ min: 1 }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next) =>
        this.authService
          .login(req, res, next)
          .then((user: User) => res.status(200).json(user))
          .catch((err: any) => {
            res.status(401).json(err);
          }),
    );

    /**
     * Route for logging out the currently logged in user.
     * It expects the user to be logged in.
     * It returns a 200 status code.
     */
    this.router.delete(
      '/current',
      this.authService.isLoggedIn,
      this.errorHandler.validateRequest,
      (req: any, res: any, next) =>
        this.authService
          .logout(req, res, next)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    /**
     * Route for retrieving the currently logged in user.
     * It expects the user to be logged in.
     * It returns the logged in user.
     */
    this.router.get(
      '/current',
      this.authService.isLoggedIn,
      this.errorHandler.validateRequest,
      (req: any, res: any) => res.status(200).json(req.user),
    );
  }
}

export { UserRoutes, AuthRoutes };
