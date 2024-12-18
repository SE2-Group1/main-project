import express, { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';

import { Document } from '../components/document';
import DocumentController from '../controllers/documentController';
import ErrorHandler from '../helper';
import { isNullableType } from '../utils';
import Authenticator from './auth';

multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

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
   * Custom validator for issuance_date.
   * @param value The issuance_date object to validate.
   * @returns True if the issuance_date is valid.
   * @throws Error if the issuance_date is invalid.
   */
  private validateIssuanceDate(value: any): boolean {
    if (typeof value.year !== 'string') {
      throw new Error('issuance_date.year must be a string');
    }
    if (value.month !== null && typeof value.month !== 'string') {
      throw new Error('issuance_date.month must be a string or null');
    }
    if (value.day !== null && typeof value.day !== 'string') {
      throw new Error('issuance_date.day must be a string or null');
    }
    return true;
  }

  /**
   * Custom validator for georeference.
   * @param val The georeference value to validate.
   * @param req The request object.
   * @returns True if the georeference is valid.
   * @throws Error if the georeference is invalid.
   */
  private validateGeoreference(val: any, { req }: any): boolean {
    if (req.body.id_area !== null) {
      return true;
    }
    if (!Array.isArray(val)) {
      throw new Error('georeference must be an array');
    }
    return true;
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
    // ______________ KX4 ____________________
    /**
     * @route GET /georeference/coordinates
     * @desc Fetch all document IDs and corresponding area coordinates
     * @access Public or Restricted (define authorization as needed)
     */
    this.router.get('/georeference', async (req, res) => {
      try {
        const coordinates = await this.controller.getCoordinates();
        res.status(200).json(coordinates); // Return 200 status if data is fetched successfully
      } catch (error: any) {
        console.error('Error fetching coordinates:', error);

        // Handle error based on error type
        if (error.message.includes('Unauthorized')) {
          res.status(401).json({ error: 'Unauthorized access' }); // 401 Unauthorized for specific errors
        } else {
          res.status(500).json({ error: 'Internal Server Error' }); // 500 Internal error for other issues
        }
      }
    });

    ////////////// filter //////////
    this.router.get('/filtered', async (req: any, res: any) => {
      try {
        const { searchCriteria, searchTerm = '', filters } = req.query;

        if (
          !searchCriteria ||
          (searchCriteria !== 'Title' && searchCriteria !== 'Description')
        ) {
          return res.status(400).json({
            error:
              'Invalid or missing searchCriteria. Must be either "Title" or "Description".',
          });
        }

        if (typeof searchTerm !== 'string') {
          return res.status(400).json({
            error: 'Invalid searchTerm. Must be a string.',
          });
        }

        let parsedFilters = {};
        if (filters) {
          try {
            parsedFilters = JSON.parse(filters as string);
            if (
              typeof parsedFilters !== 'object' ||
              Array.isArray(parsedFilters)
            ) {
              throw new Error();
            }
          } catch (error) {
            return res
              .status(400)
              .json({ error: 'Invalid filters. Must be a valid JSON object.' });
          }
        }

        // Pass the filters to the controller
        const documents = await this.controller.getFilteredDocuments(
          searchCriteria as 'Title' | 'Description',
          searchTerm,
          parsedFilters,
        );

        res.status(200).json(documents);
      } catch (error: any) {
        console.error('Error fetching filtered documents:', error);

        if (error.message.includes('Unauthorized')) {
          res.status(401).json({ error: 'Unauthorized access' });
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });

    // Route for getting georeference information
    this.router.get('/:id/georeference', async (req, res) => {
      const documentId = parseInt(req.params.id);

      try {
        const data = await this.controller.getGeoreference(documentId);
        // If successful, return 200 with data
        res.status(200).json(data);
      } catch (error: any) {
        // Handle error if document is not found or any other issue
        res.status(404).json({ message: error.message });
      }
    });

    /**
     * Route for creating a document.
     * It requires the user to be admin or urban planner.
     * It expects the following parameters:
     * - title: string. It cannot be empty.
     * - desc: string. It cannot be empty.
     * - scale: string. It cannot be empty.
     * - type: string. It cannot be empty.
     * - language: string. It could be null.
     * - issuance_date: object. It contains:
     *   - year: string. It cannot be empty.
     *   - month: string. It can be null.
     *   - day: string. It can be null.
     * - id_area: number. It cannot be empty.
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
      body('type').isString().isLength({ min: 1 }),
      body('issuance_date').custom(this.validateIssuanceDate),
      body('language').custom(val => isNullableType(val, 'string')),
      body('id_area').custom(val => isNullableType(val, 'number')),
      body('stakeholders').isArray(),
      body('georeference').custom(this.validateGeoreference),
      body('name_area').isString(),
      this.errorHandler.validateRequest,
      async (req: any, res: any, next: any) => {
        try {
          const id_file = await this.controller.addDocument(
            req.body.title,
            req.body.desc,
            req.body.scale,
            req.body.type,
            req.body.language,
            req.body.issuance_date,
            req.body.id_area,
            req.body.stakeholders,
            req.body.georeference,
            req.body.name_area,
          );
          res.status(200).json({ id_file });
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
     * - type: string. It cannot be empty.
     * - language: string. It could be null.
     * - issuance_date: object. It contains:
     *   - year: string. It cannot be empty.
     *   - month: string. It can be null.
     *   - day: string. It can be null.
     * - id_area: number. It cannot be empty.
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
      body('type').isString().isLength({ min: 1 }),
      body('issuance_date').custom(value => {
        if (typeof value.year !== 'string') {
          throw new Error('issuance_date.year must be a string');
        }
        if (value.month !== null && typeof value.month !== 'string') {
          throw new Error('issuance_date.month must be a string or null');
        }
        if (value.day !== null && typeof value.day !== 'string') {
          throw new Error('issuance_date.day must be a string or null');
        }
        return true;
      }),
      body('language').custom(val => isNullableType(val, 'string')),
      body('id_area').custom(val => isNullableType(val, 'number')),
      body('stakeholders').isArray(),
      body('georeference').custom((val, { req }) => {
        if (req.body.id_area !== null) {
          return true;
        }
        if (!Array.isArray(val)) {
          throw new Error('georeference must be an array');
        }
        return true;
      }),
      this.errorHandler.validateRequest,
      async (req: any, res: any, next: any) => {
        try {
          await this.controller.updateDocument(
            req.params.id,
            req.body.title,
            req.body.desc,
            req.body.scale,
            req.body.type,
            req.body.language,
            req.body.issuance_date,
            req.body.id_area,
            req.body.stakeholders,
            req.body.georeference,
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

    /**
     * Route to create a new link between documents.
     * It requires the user to be admin or urban planner.
     * It expects the following parameters:
     * list with the ids of the documents to link.
     * It returns a 200 status code if the link has been created.
     * It returns an error if the user is not authorized or if the link could not be created.
     */
    this.router.post(
      '/links',
      this.authenticator.isAdminOrUrbanPlanner,
      body('doc1').isNumeric(),
      body('doc2').isNumeric(),
      body('links').isArray({ min: 1 }),
      this.errorHandler.validateRequest,
      (req: any, res: any, next: any) =>
        this.controller
          .addLinks(req.body.doc1, req.body.doc2, req.body.links)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    this.router.get('/area/:id', (req: any, res: any, next: any) => {
      const id_area = req.params.id; // Access the id parameter from the route

      this.controller
        .getCoordinatesOfArea(id_area) // Use id_area in the controller function
        .then((area: any) => res.status(200).json(area))
        .catch((err: any) => next(err));
    });

    this.router.put(
      '/georeference/:id',
      this.authenticator.isAdminOrUrbanPlanner,
      body('georeference').custom((val, { req }) => {
        if (req.body.id_area !== null) {
          return true;
        }
        if (!Array.isArray(val)) {
          throw new Error('georeference must be an array');
        }
        return true;
      }),
      body('id_area').custom((val, { req }) => {
        if (req.body.georeference !== null) {
          return true;
        }
        if (typeof val !== 'number') {
          throw new Error('Id area must be an integer');
        }
        return true;
      }),
      body('name_area').isString(),
      this.errorHandler.validateRequest,
      (req: any, res: any, next: any) =>
        this.controller
          .updateDocArea(
            req.params.id,
            req.body.georeference,
            req.body.id_area,
            req.body.name_area,
          )
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );

    /**
     * Route to add resources to a document.
     * It requires the user to be admin or urban planner.
     * It expects:
     * - docId: number. The id of the document to add resources to.
     * - resources: array of objects. The list of resources to add.
     * It returns a 200 status code if the resources have been added.
     * It returns an error if the user is not authorized or if the resources could not be added.
     */
    this.router.post(
      '/resources/:docId',
      this.authenticator.isAdminOrUrbanPlanner,
      param('docId').isNumeric(),
      this.errorHandler.validateRequest,
      upload.array('resources'), // Use multer to handle file uploads
      (req: any, res: any, next: any) =>
        this.controller
          .addResources(req, res, next)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );
  }
}

export { DocumentRoutes };
