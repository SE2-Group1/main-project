import { Document } from '../components/document';
import db from '../db/db';
import { DocumentNotFoundError } from '../errors/documentError';
import { StakeholderNotFoundError } from '../errors/stakeholderError';

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
    issuanceDate: Date,
    type: string,
    language: string,
    pages: number | null,
    link: string | null,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql = `
            INSERT INTO documents (title, desc, scale, issuance_date, type, language, pages, link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
        db.query(
          sql,
          [title, desc, scale, issuanceDate, type, language, pages, link],
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
   * Returns a specific document.
   * @param id - The id of the document to retrieve. The document must exist.
   * @returns A Promise that resolves to the document with the specified id.
   * @throws DocumentNotFoundError if the document with the specified id does not exist.
   */
  getDocumentById(id: number): Promise<Document> {
    return new Promise<Document>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM documents WHERE id_file = ?';
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
    issuanceDate: Date,
    type: string,
    language: string,
    pages: number | null,
    link: string | null,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql = `
            UPDATE documents
            SET title = ?, desc = ?, scale = ?, issuance_date = ?, type = ?, language = ?, pages = ?, link = ?
            WHERE id_file = ?
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
        const sql = 'UPDATE documents SET desc = ? WHERE id_file = ?';
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
  checkStakeholder(stakeholder: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql =
          'SELECT stakeholder FROM stakeholders WHERE stakeholder = ?';
        db.query(sql, [stakeholder], (err: Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            reject(new StakeholderNotFoundError());
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
