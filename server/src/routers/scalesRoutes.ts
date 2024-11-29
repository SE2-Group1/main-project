import express, { Router } from 'express';
import { body } from 'express-validator';

import { Scale } from '../components/scale';
import ScaleController from '../controllers/scaleController';
import ErrorHandler from '../helper';
import Authenticator from './auth';

/**
 * Represents a class that defines the routes for handling users.
 */
class ScaleRoutes {
  private router: Router;
  private errorHandler: ErrorHandler;
  private controller: ScaleController;
  private authenticator: Authenticator;

  /**
   * Constructs a new instance of the StakeholderRouter class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
    this.router = express.Router();
    this.errorHandler = new ErrorHandler();
    this.controller = new ScaleController();
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
      body('scale').isString().isLength({ min: 1 }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next) =>
        this.controller
          .addScale(req.body.scale)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    this.router.get('/', (req: any, res: any, next: any) =>
      this.controller
        .getAllScales()
        .then((scales: Scale[]) => res.status(200).json(scales))
        .catch((err: any) => next(err)),
    );

    this.router.get(
      '/:scale',
      this.authenticator.isAdminOrUrbanPlanner,
      (req: any, res: any, next) =>
        this.controller
          .getScale(req.params.scale)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );
  }
}

export { ScaleRoutes };
