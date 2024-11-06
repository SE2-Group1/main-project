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
    language: string | null,
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
        db.query(sql, [id], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result || result.rows.length === 0) {
            reject(new DocumentNotFoundError());
            return;
          }

          const document: Document = new Document(
            result.rows[0].id_file,
            result.rows[0].title,
            result.rows[0].desc,
            result.rows[0].scale,
            result.rows[0].issuance_date,
            result.rows[0].type,
            result.rows[0].language,
            result.rows[0].link,
            result.rows[0].pages,
            [],
          );

          const sql2 =
            'SELECT stakeholder FROM stakeholders_docs WHERE doc = $1';
          db.query(sql2, [id], (err2: Error | null, result2: any) => {
            if (err2) {
              reject(err2);
              return;
            }

            const stakeholders = result2.rows.map(
              (row: any) => row.stakeholder,
            );
            document.stakeholder = stakeholders;

            resolve(document);
          });
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
          const documents: Document[] = [];
          const sql2 =
            'SELECT stakeholder FROM stakeholders_docs WHERE doc = $1';
          const docs = result.rows.map(
            (row: any) =>
              new Promise((resolve, reject) => {
                db.query(sql2, [row.id_file], (err: Error, result2: any) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  const staks = result2.rows.map(
                    (row2: any) => row2.stakeholder,
                  );
                  documents.push(
                    new Document(
                      row.id_file,
                      row.title,
                      row.desc,
                      row.scale,
                      row.issuance_date,
                      row.type,
                      row.language,
                      row.link,
                      row.pages,
                      staks,
                    ),
                  );
                  resolve(documents);
                });
              }),
          );
          Promise.all(docs).then(() => resolve(documents));
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
   * @throws DocumentNotFoundError if the document with the specified id does not exist.
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
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `
            UPDATE documents
            SET title = $1, "desc" = $2, scale = $3, issuance_date = $4, type = $5, language = $6, link = $8, pages = $7
            WHERE id_file = $9
            `;
        db.query(
          sql,
          [title, desc, scale, issuanceDate, type, language, pages, link, id],
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
   * Route to create a new link between documents
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * list with the ids of the documents to link.
   * It returns a 200 status code if the link has been created.
   */
  addLink(doc1: number, doc2: number, link_type: string): Promise<boolean> {
    const sql = ` INSERT INTO link (doc1, doc2, link_type) VALUES ($1, $2, $3)`;
    return new Promise<boolean>((resolve, reject) => {
      db.query(sql, [doc1, doc2, link_type], (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * Check if the link exists.
   * @param doc1 - The id of the first document.
   * @param doc2 - The id of the second document.
   * @param link_type - The type of the link.
   * @returns A Promise that resolves if the link exists.
   * @throws Error if the link does not exist.
   */
  checkLink(doc1: number, doc2: number, link_type: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql =
          'SELECT doc1, doc2, link_type FROM links WHERE doc1 = $1 AND doc2 = $2 AND link_type = $3';
        db.query(
          sql,
          [doc1, doc2, link_type],
          (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            if (result.rows.length === 0) {
              reject(new Error('Link not found'));
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
   * Get a link type.
   * @param link_type - The type of the link.
   * @returns A Promise that resolves if the link type exists.
   * @throws Error if the link type does not exist.
   */
  getLinkType(link_type: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = 'SELECT link_type FROM link_types WHERE link_type = $1';
        db.query(sql, [link_type], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rows.length === 0) {
            reject(new Error('Link type not found'));
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
    const coordzero: any = coordinates[0];
    let geomText = ``;
    let sql = `INSERT INTO areas (area) VALUES (ST_GeomFromText('POLYGON($1)', 4326))`;
    if (coordinates.length < 3) {
      const pointString = `${coordzero[1]} ${coordzero[0]}`;
      geomText = `POINT(${pointString})`;
      sql = `INSERT INTO areas (area) VALUES (ST_GeomFromText($1, 4326))
              RETURNING id_area`;
      //(ST_GeomFromText('POINT(12.4924 41.8902)', 4326));
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
