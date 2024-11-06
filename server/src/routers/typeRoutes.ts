import express, { Router } from 'express';
import { body } from 'express-validator';

import { Type } from '../components/type';
import TypeController from '../controllers/typeController';
import ErrorHandler from '../helper';
import Authenticator from './auth';

/**
 * Represents a class that defines the routes for handling users.
 */
class TypeRoutes {
  private router: Router;
  private errorHandler: ErrorHandler;
  private controller: TypeController;
  private authenticator: Authenticator;

  /**
   * Constructs a new instance of the StakeholderRouter class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
    this.router = express.Router();
    this.errorHandler = new ErrorHandler();
    this.controller = new TypeController();
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
   * Initializes the routes for the stakeholder router.
   *
   * @remarks
   * This method sets up the HTTP routes for creating, retrieving, updating, and deleting user data.
   * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
   */
  initRoutes() {
    this.router.post(
      '/',
      this.authenticator.isAdminOrUrbanPlanner,
      body('type_name').isString().isLength({ min: 1 }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next) =>
        this.controller
          .addType(req.body.type_name)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    this.router.get('/', (req: any, res: any, next: any) =>
      this.controller
        .getAllTypes()
        .then((scales: Type[]) => res.status(200).json(scales))
        .catch((err: any) => next(err)),
    );

    this.router.get(
      '/:type',
      this.authenticator.isAdminOrUrbanPlanner,
      (req: any, res: any, next) =>
        this.controller
          .getType(req.params.type_name)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );
  }
}

export { TypeRoutes };
