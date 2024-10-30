import express, { Router } from 'express';
import { body } from 'express-validator';

import { Document } from '../components/document';
import DocumentController from '../controllers/documentController';
import ErrorHandler from '../helper';
import Authenticator from './auth';

/**
 * Represents a class that defines the routes for handling users.
 */
class DocumentRoutes {
  private router: Router;
  private errorHandler: ErrorHandler;
  private controller: DocumentController;
  private authenticator: Authenticator;

  /**
   * Constructs a new instance of the DocumentRoutes class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
    this.router = express.Router();
    this.errorHandler = new ErrorHandler();
    this.controller = new DocumentController();
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
   * Initializes the routes for the document router.
   *
   * @remarks
   * This method sets up the HTTP routes for creating, retrieving, updating, and deleting user data.
   * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
   */
  initRoutes() {
    /**
     * Route for creating a document.
     * It requires the user to be admin or urban planner.
     * It expects the following parameters:
     * - title: string. It cannot be empty.
     * - desc: string. It cannot be empty.
     * - scale: string. It cannot be empty.
     * - issuance_date: string. It cannot be empty.
     * - type: string. It cannot be empty.
     * - language: string. It cannot be empty.
     * - pages: number. It can be null.
     * - link: string. It can be null.
     * - stakeholders[]: array of strings. It can't be empty.
     * It checks if all stakeholders exist before creating the document.
     * It returns a 200 status code if the document has been created.
     * It returns an error if the user is not authorized or if the document could not be created.
     */
    this.router.post(
      '/',
      this.authenticator.isAdminOrUrbanPlanner,
      body('title').isString().isLength({ min: 1 }),
      body('desc').isString().isLength({ min: 1 }),
      body('scale').isString().isLength({ min: 1 }),
      body('issuance_date').isString().isLength({ min: 1 }),
      body('type').isString().isLength({ min: 1 }),
      body('language').isString().isLength({ min: 1 }),
      body('pages').optional().isNumeric(),
      body('link').optional().isString(),
      body('stakeholders').isArray({ min: 1 }),
      this.errorHandler.validateRequest,
      async (req: any, res: any, next: any) => {
        try {
          const stakeholders = req.body.stakeholders;
          const stakeholderExistsPromises = stakeholders.map(
            (stakeholder: string) =>
              this.controller.checkStakeholder(stakeholder),
          );

          const stakeholdersExist = await Promise.all(
            stakeholderExistsPromises,
          );

          if (stakeholdersExist.some(exists => !exists)) {
            return res
              .status(400)
              .json({ error: 'One or more stakeholders do not exist' });
          }

          await this.controller.addDocument(
            req.body.title,
            req.body.desc,
            req.body.scale,
            req.body.issuance_date,
            req.body.type,
            req.body.language,
            req.body.pages,
            req.body.link,
          );

          res.status(200).end();
        } catch (err) {
          next(err);
        }
      },
    );

    /**
     * Route for getting a document by id.
     * It does not require authentication.
     * It expects the id of the document to be in the URL.
     * It returns a 200 status code if the document has been found.
     * It returns an error if the document could not be found.
     * The document is returned in the response body.
     */
    this.router.get('/:id', (req: any, res: any, next: any) =>
      this.controller
        .getDocumentById(req.params.id)
        .then((document: Document) => res.status(200).json(document))
        .catch((err: any) => next(err)),
    );

    /**
     * Route for getting all documents.
     * It does not require authentication.
     * It returns a 200 status code if the documents have been found.
     * It returns an error if the documents could not be found.
     * The documents are returned in the response body.
     */
    this.router.get('/', (req: any, res: any, next: any) =>
      this.controller
        .getAllDocuments()
        .then((documents: Document[]) => res.status(200).json(documents))
        .catch((err: any) => next(err)),
    );

    /**
     * Route for updating a document.
     * It requires the user to be admin or urban planner.
     * It expects the following parameters:
     * - title: string. It cannot be empty.
     * - desc: string. It cannot be empty.
     * - scale: string. It cannot be empty.
     * - issuance_date: string. It cannot be empty.
     * - type: string. It cannot be empty.
     * - language: string. It cannot be empty.
     * - pages: number. It can be null.
     * - link: string. It can be null.
     * - stakeholders[]: array of strings. It can be empty, at least one element.
     * It returns a 200 status code if the document has been updated.
     * It returns an error if the user is not authorized or if the document could not be updated.
     */
    this.router.put(
      '/:id',
      this.authenticator.isAdminOrUrbanPlanner,
      body('title').isString().isLength({ min: 1 }),
      body('desc').isString().isLength({ min: 1 }),
      body('scale').isString().isLength({ min: 1 }),
      body('issuance_date').isString().isLength({ min: 1 }),
      body('type').isString().isLength({ min: 1 }),
      body('language').isString().isLength({ min: 1 }),
      body('pages').optional().isNumeric(),
      body('link').optional().isString(),
      body('stakeholders').isArray({ min: 1 }),
      this.errorHandler.validateRequest,
      async (req: any, res: any, next: any) => {
        try {
          const stakeholders = req.body.stakeholders;
          const stakeholderExistsPromises = stakeholders.map(
            (stakeholder: string) =>
              this.controller.checkStakeholder(stakeholder),
          );

          const stakeholdersExist = await Promise.all(
            stakeholderExistsPromises,
          );

          if (stakeholdersExist.some(exists => !exists)) {
            return res
              .status(400)
              .json({ error: 'One or more stakeholders do not exist' });
          }

          await this.controller.updateDocument(
            req.params.id,
            req.body.title,
            req.body.desc,
            req.body.scale,
            req.body.issuance_date,
            req.body.type,
            req.body.language,
            req.body.pages,
            req.body.link,
          );

          res.status(200).end();
        } catch (err) {
          next(err);
        }
      },
    );

    /**
     * Route for updating a document description.
     * It requires the user to be admin or urban planner.
     * It expects the following parameters:
     * - desc: string. It cannot be empty.
     * It returns a 200 status code if the document has been updated.
     * It returns an error if the user is not authorized or if the document could not be updated.
     */
    this.router.put(
      '/:id/description',
      this.authenticator.isAdminOrUrbanPlanner,
      body('desc').isString().isLength({ min: 1 }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next) =>
        this.controller
          .updateDocumentDescription(req.params.id, req.body.desc)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    /**
     * Route for deleting a document.
     * It requires the user to be admin or urban planner.
     * It expects the id of the document to be in the URL.
     * It returns a 200 status code if the document has been deleted.
     * It returns an error if the user is not authorized or if the document could not be deleted.
     */
    this.router.delete(
      '/:id',
      this.authenticator.isAdminOrUrbanPlanner,
      (req: any, res: any, next: any) =>
        this.controller
          .deleteDocument(req.params.id)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    /**
     * Route for check if every stakeholder in the list exists.
     * It requires the user to be admin or urban planner.
     * It expects a list of stakeholders in the body.
     * It returns a 200 status code if all stakeholders exist.
     * It returns an error if the user is not authorized or if any stakeholder does not exist.
     */
    this.router.post(
      '/check-stakeholders',
      this.authenticator.isAdminOrUrbanPlanner,
      body('stakeholders').isArray({ min: 1 }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next: any) =>
        this.controller
          .checkStakeholder(req.body.stakeholders)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );
  }
}

export { DocumentRoutes };
