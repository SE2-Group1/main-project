import express, { Router } from 'express';
import { body } from 'express-validator';

import { Stakeholder } from '../components/stakeholder';
import StakeholderController from '../controllers/stakeholderController';
import ErrorHandler from '../helper';
import Authenticator from './auth';

/**
 * Represents a class that defines the routes for handling users.
 */
class StakeholderRoutes {
  private router: Router;
  private errorHandler: ErrorHandler;
  private controller: StakeholderController;
  private authenticator: Authenticator;

  /**
   * Constructs a new instance of the StakeholderRouter class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
    this.router = express.Router();
    this.errorHandler = new ErrorHandler();
    this.controller = new StakeholderController();
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
    /**
     * Route for creating a stakeholder.
     * It requires the user to be admin or urban planner.
     * It expects the following parameters:
     * - stakeholder: string. It cannot be empty.
     * - desc: string. It cannot be empty.
     * It returns a 200 status code if the stakeholder has been created.
     * It returns an error if the user is not authorized or if the stakeholder could not be created.
     */
    this.router.post(
      '/',
      this.authenticator.isAdminOrUrbanPlanner,
      body('stakeholder').isString().isLength({ min: 1 }),
      body('desc').isString().isLength({ min: 1 }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next) =>
        this.controller
          .addStakeholder(req.body.stakeholder)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    /**
     * Route for getting a stakeholder by id.
     * It does not require authentication.
     * It returns a 200 status code if the stakeholder has been found.
     * It returns an error if the stakeholder could not be found.
     * The stakeholder is returned in the response body.
     */
    this.router.get('/:stakeholder', (req: any, res: any, next: any) =>
      this.controller
        .getStakeholder(req.params.stakeholder)
        .then((stakeholder: Stakeholder) => res.status(200).json(stakeholder))
        .catch((err: any) => next(err)),
    );

    /**
     * Route for getting all stakeholders.
     * It does not require authentication.
     */
    this.router.get('/', (req: any, res: any, next: any) =>
      this.controller
        .getAllStakeholders()
        .then((stakeholders: Stakeholder[]) =>
          res.status(200).json(stakeholders),
        )
        .catch((err: any) => next(err)),
    );
  }
}

export { StakeholderRoutes };
