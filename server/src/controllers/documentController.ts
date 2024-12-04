import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import { Georeference } from '../components/area';
import { Document } from '../components/document';
import { LinkClient } from '../components/link';
import DocumentDAO from '../dao/documentDAO';
import LinkDAO from '../dao/linkDAO';

/**
 * Represents a controller for managing documents.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class DocumentController {
  private dao: DocumentDAO;

  constructor() {
    this.dao = new DocumentDAO();
  }

  /**
   * Creates a new document.
   * @param title - The title of the document. It must not be null.
   * @param desc - The description of the document. It must not be null.
   * @param scale - The scale of the document. It must not be null.
   * @param type - The type of the document. It must not be null.
   * @param language - The language of the document. It must not be null.
   * @param pages - The number of pages of the document. It can be null.
   * @param issuance_date - The issuance date of the document. It contains:
   *   - year: string. It must not be null.
   *   - month: string. It can be null.
   *   - day: string. It can be null.
   * @param id_area - The id of the area of the document. It must not be null.
   * @param stakeholders - The stakeholders of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been created.
   */
  async addDocument(
    title: string,
    desc: string,
    scale: string,
    type: string,
    language: string | null,
    pages: string | null,
    issuance_date: { year: string; month: string | null; day: string | null },
    id_area: number | null,
    stakeholders: string[],
    georeference: Georeference | null,
  ): Promise<number> {
    //validate parameters

    await this.validateDocumentParameters(
      stakeholders,
      type,
      language,
      scale,
      id_area,
    );
    // Format year, month, and day
    const year = issuance_date.year;
    const month = issuance_date.month
      ? issuance_date.month.padStart(2, '0') // Pads month to 2 digits
      : null;
    const day = issuance_date.day
      ? issuance_date.day.padStart(2, '0') // Pads day to 2 digits
      : null;

    // Validate year
    if (!year || parseInt(year, 10) < 0) {
      throw new Error('Invalid year');
    }

    // Validate month if provided
    if (month) {
      const monthInt = parseInt(month, 10);
      if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
        throw new Error('Invalid month');
      }
    }

    // Validate day if provided
    if (day !== null) {
      const dayInt = parseInt(day, 10);
      if (isNaN(dayInt) || dayInt < 1 || dayInt > 31) {
        throw new Error('Invalid day');
      }
    }

    // Check if the full date is provided and validate it
    if (year && month && day) {
      const date = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
      );

      // Check if the constructed date matches the original values
      if (
        date.getFullYear() !== parseInt(year, 10) ||
        date.getMonth() !== parseInt(month, 10) - 1 ||
        date.getDate() !== parseInt(day, 10)
      ) {
        throw new Error('Invalid date');
      }
    }
    const documentID = await this.dao.addDocument(
      title,
      desc,
      scale,
      type,
      language,
      pages,
      year,
      month,
      day,
      stakeholders,
      id_area,
      georeference,
    );

    return documentID;
  }

  /**
   * Validates the parameters of a document.
   * @param stakeholders - The stakeholders of the document.
   * @param type - The type of the document.
   * @param language - The language of the document.
   * @param scale - The scale of the document.
   * @param id_area - The id of the area of the document.
   * @returns A Promise that resolves to true if all parameters are valid.
   * @throws Error if any parameter is invalid.
   */
  async validateDocumentParameters(
    stakeholders: string[],
    type: string,
    language: string | null,
    scale: string,
    id_area: number | null,
  ): Promise<boolean> {
    const stakeholderExistsPromises = stakeholders.map(
      async (stakeholder: string) =>
        await this.dao.checkStakeholder(stakeholder),
    );
    const stakeholdersExist = await Promise.all(stakeholderExistsPromises);
    if (stakeholdersExist.some(exists => !exists)) {
      throw new Error('One or more stakeholders do not exist');
    }
    await this.dao.checkDocumentType(type);
    if (language) {
      await this.dao.checkLanguage(language);
    }
    await this.dao.checkScale(scale);
    if (id_area) {
      await this.dao.checkArea(id_area);
    }
    return true;
  }

  /**
   * Returns a specific document.
   * @param id - The id of the document to retrieve. The document must exist.
   * @returns A Promise that resolves to the document with the specified id.
   */
  async getDocumentById(id: number): Promise<Document> {
    return this.dao.getDocumentById(id);
  }

  /**
   * Returns all documents.
   * @returns A Promise that resolves to an array containing all documents.
   */
  async getAllDocuments(): Promise<Document[]> {
    return this.dao.getAllDocuments();
  }

  /**
   * Updates a document.
   * @param id - The id of the document to update. The document must exist.
   * @param title - The new title of the document. It must not be null.
   * @param desc - The new description of the document. It must not be null.
   * @param scale - The new scale of the document. It must not be null.
   * @param type - The new type of the document. It must not be null.
   * @param language - The new language of the document. It must not be null.
   * @param pages - The new number of pages of the document. It can be null.
   * @param issuance_date - The issuance date of the document. It contains:
   *   - year: string. It must not be null.
   *   - month: string. It can be null.
   *   - day: string. It can be null.
   * @param id_area - The new id of the area of the document. It must not be null.
   * @param stakeholders - The new stakeholders of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been updated.
   */
  async updateDocument(
    id: number,
    title: string,
    desc: string,
    scale: string,
    type: string,
    language: string | null,
    pages: string | null,
    issuance_date: { year: string; month: string | null; day: string | null },
    id_area: number | null,
    stakeholders: string[],
    georeferece: Georeference | null,
  ): Promise<void> {
    {
      //validate parameters
      await this.validateDocumentParameters(
        stakeholders,
        type,
        language,
        scale,
        id_area,
      );
      // Format year, month, and day
      const year = issuance_date.year;
      const month = issuance_date.month
        ? issuance_date.month.padStart(2, '0') // Pads month to 2 digits
        : null;
      const day = issuance_date.day
        ? issuance_date.day.padStart(2, '0') // Pads day to 2 digits
        : null;

      // Validate year
      if (!year || parseInt(year, 10) < 0) {
        throw new Error('Invalid year');
      }

      // Validate month if provided
      if (month !== null) {
        const monthInt = parseInt(month, 10);
        if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
          throw new Error('Invalid month');
        }
      }

      // Validate day if provided
      if (day !== null) {
        const dayInt = parseInt(day, 10);
        if (isNaN(dayInt) || dayInt < 1 || dayInt > 31) {
          throw new Error('Invalid day');
        }
      }

      // Check if the full date is provided and validate it
      if (year && month && day) {
        const date = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
        );

        // Check if the constructed date matches the original values
        if (
          date.getFullYear() !== parseInt(year, 10) ||
          date.getMonth() !== parseInt(month, 10) - 1 ||
          date.getDate() !== parseInt(day, 10)
        ) {
          throw new Error('Invalid date');
        }
      }

      await this.dao.updateDocument(
        id,
        title,
        desc,
        scale,
        type,
        language,
        pages,
        year,
        month,
        day,
        stakeholders,
        id_area,
        georeferece,
      );
    }
  }

  /**
   * Deletes a document.
   * @param id - The id of the document to delete. The document must exist.
   * @returns A Promise that resolves to true if the document has been deleted.
   */
  async deleteDocument(id: number): Promise<boolean> {
    return this.dao.deleteDocument(id);
  }

  /**
   * Updates the description of a document.
   * @param id - The id of the document to update. The document must exist.
   * @param desc - The new description of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been updated.
   */
  async updateDocumentDescription(id: number, desc: string): Promise<boolean> {
    return this.dao.updateDocumentDesc(id, desc);
  }

  /**
   * Checks if every stakeholder in the list exists.
   * @param stakeholders - The list of stakeholders to check.
   * @returns A Promise that resolves to true if all stakeholders exist.
   * @throws StakeholderNotFoundError if any stakeholder does not exist.
   */
  async checkStakeholder(stakeholder: string): Promise<boolean> {
    return this.dao.checkStakeholder(stakeholder);
  }

  /**
   * Route to create a new link between documents
   * @param links - List of objects that have the id of doc2 plus the link name.
   * @returns A Promise that resolves to true if the link has been created.
   * @throws Error if the link could not be created.
   */
  async addLinks(
    doc1: number,
    doc2: number,
    links: LinkClient[],
  ): Promise<void> {
    const linkDAO = new LinkDAO();
    try {
      await this.dao.getDocumentById(doc1);
      await this.dao.getDocumentById(doc2);
      await linkDAO.insertLinks(doc1, doc2, links);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add resources to a document
   * @param docId - The id of the document to add resources to
   * @param resources - The resources to add to the document
   * **/
  addResources = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const { docId }: any = req.params;
      const files = req.files as Express.Multer.File[]; // Access the files uploaded by the client
      if (!docId || !files || files.length === 0) {
        return next(new Error('Invalid input data'));
      }
      try {
        files.forEach(async file => {
          const hash = crypto.createHash('sha256');
          hash.update(file.buffer);
          const resource_name = file.originalname;
          const resource_hash = hash.digest('hex');
          const ext = path.extname(resource_name);
          const path_with_ext = `resources/${resource_hash}${ext}`;
          // check if the hash is already in the database
          // true -> link the document using the existing resource
          // false -> add the resource to the database and link it
          if (!(await this.dao.checkResource(resource_hash, docId))) {
            await this.dao.addResource(
              resource_name,
              resource_hash,
              path_with_ext,
              docId,
            );
          } else {
            reject(
              new Error(`Resource ${resource_name} already linked to document`),
            );
          }
          // Ensure the resources directory exists
          if (!fs.existsSync('./resources')) {
            fs.mkdirSync('./resources');
          }
          // Save the file to the server
          fs.writeFileSync(
            path_with_ext /*`resources/${resource_name}` if we want to save it as readable pdf*/,
            file.buffer,
          );
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // ________________ KX4 _______________________

  // Method to handle fetching document IDs and their coordinates
  async getCoordinates(): Promise<
    {
      docId: number;
      title: string;
      type: string;
      id_area: number;
      coordinates: { lat: number; lon: number }[];
    }[]
  > {
    return this.dao.getCoordinates();
  }

  async getGeoreference(documentId: number): Promise<any> {
    try {
      // Fetch georeference data using DAO
      const data = await this.dao.getGeoreferenceById(documentId);
      return data;
    } catch (error) {
      throw new Error('Document not found');
    }
  }

  async getCoordinatesOfArea(id_area: number): Promise<any> {
    return this.dao.getCoordinatesOfArea(id_area);
  }

  async updateDocArea(
    id: number,
    georeferece: Georeference | null,
    id_area: number | null,
  ): Promise<boolean> {
    return this.dao.updateDocArea(id, georeferece, id_area);
  }
}

export default DocumentController;
