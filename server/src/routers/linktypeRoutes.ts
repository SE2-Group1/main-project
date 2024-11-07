import express, { Router } from 'express';
import { body } from 'express-validator';

import { LinkType } from '../components/linktype';
import LinkTypeController from '../controllers/linktypeController';
import ErrorHandler from '../helper';
import Authenticator from './auth';

/**
 * Represents a class that defines the routes for handling users.
 */
class LinkTypeRoutes {
  private router: Router;
  private errorHandler: ErrorHandler;
  private controller: LinkTypeController;
  private authenticator: Authenticator;

  /**
   * Constructs a new instance of the StakeholderRouter class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
    this.router = express.Router();
    this.errorHandler = new ErrorHandler();
    this.controller = new LinkTypeController();
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
      body('linktype').isString().isLength({ min: 1 }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next) =>
        this.controller
          .addLinkType(req.body.linktype)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    this.router.get('/', (req: any, res: any, next: any) =>
      this.controller
        .getAllLinkTypes()
        .then((linktypes: LinkType[]) => res.status(200).json(linktypes))
        .catch((err: any) => next(err)),
    );

    this.router.get(
      '/:linktype',
      this.authenticator.isAdminOrUrbanPlanner,
      (req: any, res: any, next) =>
        this.controller
          .getLinkTypes(req.params.linktype)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );
  }
}

export { LinkTypeRoutes };
