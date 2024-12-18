import express, { Router } from 'express';
import path from 'path';

import { Attachment } from '../components/attachment';
import AttachmentController from '../controllers/attachmentController';
import Authenticator from './auth';

/**
 * Represents a class that defines the routes for handling attachments.
 */
class AttachmentRoutes {
  private router: Router;
  private controller: AttachmentController;
  private authenticator: Authenticator;

  /**
   * Constructs a new instance of the AttachmentRoutes class.
   * @param authenticator The authenticator object used for authentication.
   */
  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
    this.router = express.Router();
    this.controller = new AttachmentController();
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
   * Initializes the routes for the attachment router.
   *
   * @remarks
   * This method sets up the HTTP routes for creating, retrieving, updating, and deleting attachment data.
   * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
   */
  initRoutes() {
    /**
     * Get all attachments.
     * user has to be an admin or urban planner to access this route.
     * @returns A Promise that resolves to an array with all attachments.
     */
    this.router.get(
      '/',
      this.authenticator.isAdminOrUrbanPlanner,
      (req: any, res: any, next: any) =>
        this.controller
          .getAllAttachments()
          .then((attachments: Attachment[]) =>
            res.status(200).json(attachments),
          )
          .catch((err: any) => next(err)),
    );

    /**
     * Get a specific attachment.
     * @param attachmentId - The ID of the attachment to retrieve. The attachment must exist.
     * @returns A Promise that resolves to the attachment with the specified ID.
     */
    this.router.get('/:attachmentId', async (req: any, res: any, next: any) => {
      try {
        const { attachmentId } = req.params;

        // Fetch the attachment metadata (like name and file buffer)
        const attachment =
          await this.controller.getAttachmentById(attachmentId);

        if (!attachment) {
          return res.status(404).send('Invalid attachment ID');
        }

        // Check if the file buffer exists in the attachment
        if (!attachment.file) {
          return res.status(404).send('File buffer not available');
        }

        // Get the file extension from the attachment's name
        const ext = path.extname(attachment.name).toLowerCase();

        // MIME type map for supported extensions
        const mimeTypeMap: { [key: string]: string } = {
          '.png': 'image/png',
          '.jpg': 'image/jpg',
          '.jpeg': 'image/jpeg',
          '.mp4': 'video/mp4',
          '.mov': 'video/quicktime',
        };

        const mimeType = mimeTypeMap[ext] || 'application/octet-stream'; // Default to binary stream if no match

        const encodedFilename = encodeURIComponent(attachment.name);

        // Set the response headers
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${encodedFilename}"`,
        );
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition'); // Expose the Content-Disposition header

        // Stream the file buffer directly to the response
        res.end(attachment.file); // Send the file buffer as the response
      } catch (err: any) {
        res.status(404).send(err.message);
      }
    });

    /**
     * Get all the attachments that are linked to a specific document.
     * @param docId - The ID of the document to retrieve the attachments from.
     * @returns A Promise that resolves to an array with all attachments linked to the specified document.
     */
    this.router.get('/doc/:docId', (req: any, res: any, next: any) =>
      this.controller
        .getAttachmentsByDocId(req.params.docId)
        .then((attachments: Attachment[]) => res.status(200).json(attachments))
        .catch((err: any) => next(err)),
    );

    this.router.delete(
      '/:attachmentId/:docId',
      (req: any, res: any, next: any) =>
        this.controller
          .deleteAttachment(req.params.attachmentId, req.params.docId)
          .then(() => res.status(200).end())
          .catch((err: any) => next(err)),
    );
  }
}

export { AttachmentRoutes };
