import express, { Router } from 'express';
import path from 'path';

import { Resource } from '../components/resource';
import ResourceController from '../controllers/resourceController';
import Authenticator from './auth';

// For file path operations
/**
 * Represents a class that defines the routes for handling resources.
 */
class ResourceRoutes {
  private router: Router;
  private controller: ResourceController;
  private authenticator: Authenticator;

  /**
   * Constructs a new instance of the ResourceRoutes class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
    this.router = express.Router();
    this.controller = new ResourceController();
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
   * Initializes the routes for the resource router.
   *
   * @remarks
   * This method sets up the HTTP routes for creating, retrieving, updating, and deleting resource data.
   * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
   */
  initRoutes() {
    /**
     * Get all resources.
     * user has to be an admin or urban planner to access this route.
     * @returns A Promise that resolves to an array with all resources.
     */
    this.router.get(
      '/',
      this.authenticator.isAdminOrUrbanPlanner,
      (req: any, res: any, next: any) =>
        this.controller
          .getAllResources()
          .then((resources: Resource[]) => res.status(200).json(resources))
          .catch((err: any) => next(err)),
    );

    /**
     * Get a specific resource.
     * @param resource - The name of the resource to retrieve. The resource must exist.
     * @returns A Promise that resolves to the resource with the specified name.
     */
    this.router.get('/:resourceId', async (req: any, res: any, next: any) => {
      try {
        const { resourceId } = req.params;

        // Fetch the resource metadata (like name and file buffer)
        const resource = await this.controller.getResourceById(resourceId);

        if (!resource) {
          return res.status(404).send('Invalid resource ID');
        }

        // Check if the file buffer exists in the resource
        if (!resource.file) {
          return res.status(404).send('File buffer not available');
        }

        // Get the file extension from the resource's name
        const ext = path.extname(resource.name).toLowerCase();

        // MIME type map for supported extensions
        const mimeTypeMap: { [key: string]: string } = {
          '.pdf': 'application/pdf',
          '.docx':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.doc': 'application/msword',
          '.xlsx':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          '.xls': 'application/vnd.ms-excel',
        };

        const mimeType = mimeTypeMap[ext] || 'application/octet-stream'; // Default to binary stream if no match

        const encodedFilename = encodeURIComponent(resource.name);

        // Set the response headers
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${encodedFilename}"`,
        );
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition'); // Expose the Content-Disposition header

        // Stream the file buffer directly to the response
        res.end(resource.file); // Send the file buffer as the response
      } catch (err: any) {
        res.status(404).send(err.message);
      }
    });

    /**
     * Get all the resources that are linked to a specific document.
     * @param docId - The ID of the document to retrieve the resources from.
     * @returns A Promise that resolves to an array with all resources linked to the specified document.
     */
    this.router.get('/doc/:docId', (req: any, res: any, next: any) =>
      this.controller
        .getResourcesByDocId(req.params.docId)
        .then((resources: Resource[]) => res.status(200).json(resources))
        .catch((err: any) => next(err)),
    );

    this.router.delete('/:resourceid/:docId', (req: any, res: any, next: any) =>
      this.controller
        .deleteResource(req.params.resourceid, req.params.docId)
        .then(() => res.status(200).end())
        .catch((err: any) => next(err)),
    );
  }
}

export { ResourceRoutes };
