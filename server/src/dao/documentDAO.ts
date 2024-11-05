import { Document } from '../components/document';
import db from '../db/db';
import {
  DocumentNotFoundError,
  DocumentTypeNotFoundError,
} from '../errors/documentError';
import {
  DocumentLanguageNotFoundError,
  DocumentScaleNotFoundError,
} from '../errors/documentError';

//import { StakeholderNotFoundError } from '../errors/stakeholderError';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class DocumentDAO {
  /**
   * Creates a new document.
   * @param title - The title of the document. It must not be null.
   * @param desc - The description of the document. It must not be null.
   * @param scale - The scale of the document. It must not be null.
   * @param issuanceDate - The issuance date of the document. It must not be null.
   * @param type - The type of the document. It must not be null.
   * @param language - The language of the document. It must not be null.
   * @param pages - The number of pages of the document. It can be null.
   * @param link - The link to the document. It can be null.
   * @returns A Promise that resolves to true if the document has been created.
   */
  addDocument(
    title: string,
    desc: string,
    scale: string,
    issuanceDate: string,
    type: string,
    language: string,
    link: string | null,
    pages: string | null,
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        const sql = `
            INSERT INTO documents (title, "desc", scale, issuance_date, type, language, link, pages)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id_file
            `;
        db.query(
          sql,
          [title, desc, scale, issuanceDate, type, language, link, pages],
          (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            console.log('ID FILE ' + result.rows[0].id_file);
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
    return new Promise<Document>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM documents WHERE id_file = $1';
        db.query(sql, [id], (err: Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            reject(new DocumentNotFoundError());
            return;
          }
          const document: Document = new Document(
            row.id_file,
            row.title,
            row.desc,
            row.scale,
            row.issuance_date,
            row.type,
            row.language,
            row.pages,
            row.link,
          );
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
  getAllDocuments(): Promise<Document[]> {
    return new Promise<Document[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM documents';
        db.query(sql, [], (err: Error, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          const documents: Document[] = result.rows.map(
            (row: any) =>
              new Document(
                row.id_file,
                row.title,
                row.desc,
                row.scale,
                row.issuance_date,
                row.type,
                row.language,
                row.pages,
                row.link,
              ),
          );
          resolve(documents);
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
   * @param issuanceDate - The new issuance date of the document. It must not be null.
   * @param type - The new type of the document. It must not be null.
   * @param language - The new language of the document. It must not be null.
   * @param pages - The new number of pages of the document. It can be null.
   * @param link - The new link to the document. It can be null.
   * @returns A Promise that resolves to true if the document has been updated.
   */
  updateDocument(
    id: number,
    title: string,
    desc: string,
    scale: string,
    issuanceDate: string,
    type: string,
    language: string,
    link: string | null,
    pages: string | null,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql = `
            UPDATE documents
            SET title = $1, "desc" = $2, scale = $3, issuance_date = $4, type = $5, language = $6, link = $8, pages = $7
            WHERE id_file = $9
            `;
        db.query(
          sql,
          [title, desc, scale, issuanceDate, type, language, pages, link, id],
          (err: Error | null) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
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
   */
  updateDocumentDesc(id: number, desc: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql = 'UPDATE documents SET "desc" = $1 WHERE id_file = $2';
        db.query(sql, [desc, id], (err: Error | null) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve();
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
  deleteDocument(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql = 'DELETE FROM documents WHERE id_file = ?';
        db.query(sql, [id], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.affectedRows === 0 || result.changes === 0) {
            reject(new DocumentNotFoundError());
            return;
          }
          resolve();
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
  ): Promise<void> {
    console.log('addStakeholderToDocument');
    console.log('documentId: ' + documentId);
    console.log('stakeholder: ' + stakeholder);
    return new Promise<void>((resolve, reject) => {
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
          resolve();
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
  deleteStakeholdersFromDocument(documentId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql = 'DELETE FROM stakeholders_docs WHERE doc = $1';
        db.query(sql, [documentId], (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
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
  checkDocumentType(type: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
          resolve();
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
  checkScale(scale: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
          resolve();
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
  checkLanguage(language: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default DocumentDAO;
