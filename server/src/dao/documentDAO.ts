import { Document } from '../components/document';
import { Link } from '../components/link';
import db from '../db/db';
import {
  DocumentNotFoundError,
  DocumentTypeNotFoundError,
} from '../errors/documentError';
import {
  DocumentLanguageNotFoundError,
  DocumentScaleNotFoundError,
} from '../errors/documentError';
import LinkDAO from './linkDAO';

//import { StakeholderNotFoundError } from '../errors/stakeholderError';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class DocumentDAO {
  private linkDAO: LinkDAO;

  constructor(linkDAO?: LinkDAO) {
    if (linkDAO) {
      this.linkDAO = linkDAO;
    } else {
      this.linkDAO = new LinkDAO();
    }
  }

  /**
   * Creates a new document.
   * @param title - The title of the document. It must not be null.
   * @param desc - The description of the document. It must not be null.
   * @param scale - The scale of the document. It must not be null.
   * @param type - The type of the document. It must not be null.
   * @param language - The language of the document. It must not be null.
   * @param pages - The number of pages of the document. It can be null.
   * @param link - The link to the document. It can be null.
   * @param issuance_year - The year of issuance of the document. It must not be null.
   * @param issuance_month - The month of issuance of the document. It could be null.
   * @param issuance_day - The day of issuance of the document. It could be null.
   * @param id_area - The id of the area of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been created.
   */
  addDocument(
    title: string,
    desc: string,
    scale: string,
    type: string,
    language: string | null,
    pages: string | null,
    issuance_year: string,
    issuance_month: string | null,
    issuance_day: string | null,
    id_area: number,
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        const sql = `
            INSERT INTO documents (title, "desc", scale, type, language, pages, issuance_year, issuance_month, issuance_day, id_area)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id_file
            `;
        db.query(
          sql,
          [
            title,
            desc,
            scale,
            type,
            language,
            pages,
            issuance_year,
            issuance_month,
            issuance_day,
            id_area,
          ],
          (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result.rows[0].id_file);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns a specific document.
   * @param id - The id of the document to retrieve. The document must exist.
   * @returns A Promise that resolves to the document with the specified id.
   * @throws DocumentNotFoundError if the document with the specified id does not exist.
   */
  getDocumentById(id: number): Promise<Document> {
    return new Promise<Document>(async (resolve, reject) => {
      try {
        const sql = `
              SELECT 
                d.id_file, d.title, d.desc, d.scale, 
                d.type, d.language, d.pages, d.issuance_year, d.issuance_month, d.issuance_day, d.id_area,
                s.stakeholder
              FROM documents d
              LEFT JOIN stakeholders_docs s ON s.doc = d.id_file
              WHERE d.id_file = $1;
        `;
        db.query(sql, [id], async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result || result.rows.length === 0) {
            reject(new DocumentNotFoundError());
            return;
          }
          const firstRow = result.rows[0];
          const document: Document = new Document(
            firstRow.id_file,
            firstRow.title,
            firstRow.desc,
            firstRow.scale,
            firstRow.type,
            firstRow.language,
            firstRow.pages,
            firstRow.issuance_year,
            firstRow.issuance_month,
            firstRow.issuance_day,
            firstRow.id_area,
            [],
            [],
          );

          // Add stakeholders
          const stakeholders = new Set<string>();
          result.rows.forEach((row: any) => {
            if (row.stakeholder) {
              stakeholders.add(row.stakeholder);
            }
          });
          document.stakeholder = Array.from(stakeholders);
          // Add links
          try {
            const links: Link[] = await this.linkDAO.getLinks(id);
            document.links = links;
          } catch (error) {
            reject(error);
            return;
          }
          resolve(document);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  /**
   * Returns all documents.
   * @returns A Promise that resolves to an array containing all documents.
   */

  async getAllDocuments(): Promise<Document[]> {
    return new Promise<Document[]>(async (resolve, reject) => {
      try {
        const sql = `
          SELECT 
            d.id_file, d.title, d.desc, d.scale, 
            d.type, d.language, d.pages, d.issuance_year, d.issuance_month, d.issuance_day, d.id_area,
            s.stakeholder
          FROM documents d
          LEFT JOIN stakeholders_docs s ON s.doc = d.id_file;
        `;
        db.query(sql, async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          const documentsMap = new Map<number, Document>();
          const linkPromises = result.rows.map(async (row: any) => {
            let document = documentsMap.get(row.id_file);

            if (!document) {
              document = new Document(
                row.id_file,
                row.title,
                row.desc,
                row.scale,
                row.type,
                row.language,
                row.pages,
                row.issuance_year,
                row.issuance_month,
                row.issuance_day,
                row.id_area,
                [],
                [],
              );
              documentsMap.set(row.id_file, document);
            }
            if (row.stakeholder) {
              if (document.stakeholder) {
                document.stakeholder.push(row.stakeholder);
              }
              document.stakeholder = [row.stakeholder];
            }
            const links = await this.linkDAO.getLinks(row.id_file);
            document.links = links;
          });
          await Promise.all(linkPromises);
          resolve(Array.from(documentsMap.values()));
        });
      } catch (error) {
        reject(error);
      }
    });
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
   * @param issuance_year - The new year of issuance of the document. It must not be null.
   * @param issuance_month - The new month of issuance of the document. It could be null.
   * @param issuance_day - The new day of issuance of the document. It could be null.
   * @param id_area - The id of the area of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been updated.
   * @throws DocumentNotFoundError if the document with the specified id does not exist.
   */
  updateDocument(
    id: number,
    title: string,
    desc: string,
    scale: string,
    type: string,
    language: string,
    pages: string | null,
    issuance_year: string,
    issuance_month: string | null,
    issuance_day: string | null,
    id_area: number,
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `
            UPDATE documents
            SET title = $1, "desc" = $2, scale = $3, type = $4, language = $5, pages = $6, issuance_year = $7, issuance_month = $8, issuance_day = $9, id_area = $10
            WHERE id_file = $11
            `;
        db.query(
          sql,
          [
            title,
            desc,
            scale,
            type,
            language,
            pages,
            issuance_year,
            issuance_month,
            issuance_day,
            id_area,
            id,
          ],
          (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            if (result.rowCount === 0) {
              reject(new DocumentNotFoundError());
              return;
            }
            resolve(true);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Updates the description of a document.
   * @param id - The id of the document to update. The document must exist.
   * @param desc - The new description of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been updated.
   * @throws DocumentNotFoundError if the document with the specified id does not exist.
   */
  updateDocumentDesc(id: number, desc: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = 'UPDATE documents SET "desc" = $1 WHERE id_file = $2';
        db.query(sql, [desc, id], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            reject(new DocumentNotFoundError());
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes a document.
   * @param id - The id of the document to delete. The document must exist.
   * @returns A Promise that resolves to true if the document has been deleted.
   * @throws DocumentNotFoundError if the document with the specified id does not exist.
   */
  deleteDocument(id: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = 'DELETE FROM documents WHERE id_file = ?';
        db.query(sql, [id], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            reject(new DocumentNotFoundError());
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Checks if a stakeholder exists.
   * @param stakeholder - The stakeholder to check.
   * @returns A Promise that resolves if the stakeholder exists.
   * @throws StakeholderNotFoundError if the stakeholder does not exist.
   */
  checkStakeholder(stakeholder: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql =
          'SELECT stakeholder FROM stakeholders WHERE stakeholder = $1';
        db.query(sql, [stakeholder], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rows.length === 0) {
            reject(false);
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Adds a stakeholder to a document.
   * @param documentId - The id of the document to add the stakeholder to. The document must exist.
   * @param stakeholder - The stakeholder to add to the document. The stakeholder must exist.
   * @returns A Promise that resolves to true if the stakeholder has been added to the document.
   */
  addStakeholderToDocument(
    documentId: number,
    stakeholder: string,
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `
            INSERT INTO stakeholders_docs (stakeholder, doc)
            VALUES ($1, $2)
            `;
        db.query(sql, [stakeholder, documentId], (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes all stakeholders from a document.
   * @param documentId - The id of the document to delete the stakeholders from. The document must exist.
   * @returns A Promise that resolves to true if the stakeholders have been deleted from the document.
   */
  deleteStakeholdersFromDocument(documentId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = 'DELETE FROM stakeholders_docs WHERE doc = $1';
        db.query(sql, [documentId], (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if the document type exists.
   * @param type - The type of the document to check.
   * @returns A Promise that resolves if the document type exists.
   * @throws DocumentTypeError if the document type does not exist.
   */
  checkDocumentType(type: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = 'SELECT type_name FROM doc_type WHERE type_name = $1';
        db.query(sql, [type], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rows.length === 0) {
            reject(new DocumentTypeNotFoundError());
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if scale exists.
   * @param scale - The scale of the document to check.
   * @returns A Promise that resolves if the scale exists.
   * @throws ScaleNotFoundError if the scale does not exist.
   */
  checkScale(scale: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = 'SELECT scale FROM scales WHERE scale = $1';
        db.query(sql, [scale], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rows.length === 0) {
            reject(new DocumentScaleNotFoundError());
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if language exists.
   * @param language - The language of the document to check.
   * @returns A Promise that resolves if the language exists.
   * @throws LanguageNotFoundError if the language does not exist.
   */
  checkLanguage(language: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = 'SELECT language_id FROM languages WHERE language_id = $1';
        db.query(sql, [language], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rows.length === 0) {
            reject(new DocumentLanguageNotFoundError());
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Route to add an Area in the db
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * coordinates of the area.
   */
  addArea(coordinates: number[]): Promise<number> {
    let geomText = '';
    const sql = `INSERT INTO areas (area) VALUES (ST_GeomFromText($1, 4326))
    RETURNING id_area`;
    if (coordinates.length < 3) {
      const coordzero: any = coordinates[0];
      const pointString = `${coordzero[1]} ${coordzero[0]}`;
      geomText = `POINT(${pointString})`;
      //(ST_GeomFromText('POINT(12.4924 41.8902)', 4326));
    } else {
      const pointString = coordinates
        .map((coord: any) => `${coord[1]} ${coord[0]}`)
        .join(',');
      geomText = `POLYGON((${pointString}))`;
    }
    return new Promise<number>((resolve, reject) => {
      try {
        db.query(sql, [geomText], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result.rows[0].id_area);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Route to add a georeferece to a document
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * id of the document to update and the new georeferece.
   * It returns a 200 status code if the document has been updated.
   */
  addDocArea(docId: number, idArea: number): Promise<boolean> {
    const sql = `INSERT INTO area_doc (area, doc) VALUES ($1, $2)`;
    return new Promise<boolean>((resolve, reject) => {
      db.query(sql, [idArea, docId], (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }
}

export default DocumentDAO;
