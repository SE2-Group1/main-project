import express, { Router } from 'express';
import { body } from 'express-validator';

//import { body } from 'express-validator';
import { Area } from '../components/area';
import AreaController from '../controllers/areaController';
import ErrorHandler from '../helper';
//import ErrorHandler from '../helper';
import Authenticator from './auth';

/**
 * Represents a class that defines the routes for handling users.
 */
class AreaRoutes {
  private router: Router;
  private readonly errorHandler: ErrorHandler;
  private controller: AreaController;
  private readonly authenticator: Authenticator;

  /**
   * Constructs a new instance of the StakeholderRouter class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
    this.router = express.Router();
    this.errorHandler = new ErrorHandler();
    this.controller = new AreaController();
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
     * Route to retrieve all areas and points with their georeference
     * It requires the user to be an admin or an urban planner.
     * @returns A Promise that resolves to an array of with all areas.
     */
    this.router.get(
      '/georeference',
      this.authenticator.isAdminOrUrbanPlanner,
      (req: any, res: any, next: any) =>
        this.controller
          .getAllAreas()
          .then((areas: Area[]) => res.status(200).json(areas))
          .catch((err: any) => next(err)),
    );

    /**
     * Route to check if a point is inside the municipality area
     */
    this.router.post(
      '/checkPointInsideArea',
      this.authenticator.isAdminOrUrbanPlanner,
      body('coordinates')
        .isArray()
        .custom(value => {
          console.log(value);
          return value.length === 2;
        }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next: any) =>
        this.controller
          .checkPointInsideArea(req.body.coordinates)
          .then((isInside: boolean) => res.status(200).json(isInside))
          .catch((err: any) => next(err)),
    );
  }
}

export { AreaRoutes };
