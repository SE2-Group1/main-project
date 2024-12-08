import { Georeference } from '../components/area';
import { Document } from '../components/document';
import { Link } from '../components/link';
import db from '../db/db';
import {
  DocumentAreaNotFoundError,
  DocumentNotFoundError,
} from '../errors/documentError';
import AreaDAO from './areaDAO';
import LinkDAO from './linkDAO';
import ScaleDAO from './scaleDAO';
import StakeholderDAO from './stakeholderDAO';
import TypeDAO from './typeDAO';

//import { StakeholderNotFoundError } from '../errors/stakeholderError';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class DocumentDAO {
  private linkDAO: LinkDAO;
  private areaDAO: AreaDAO;
  private scaleDAO: ScaleDAO;
  private typeDAO: TypeDAO;
  stakeholderDAO: StakeholderDAO;
  constructor(
    linkDAO?: LinkDAO,
    areaDAO?: AreaDAO,
    scaleDAO?: ScaleDAO,
    typeDAO?: TypeDAO,
    stakeholderDAO?: StakeholderDAO,
  ) {
    if (linkDAO) {
      this.linkDAO = linkDAO;
    } else {
      this.linkDAO = new LinkDAO();
    }
    if (areaDAO) {
      this.areaDAO = areaDAO;
    } else {
      this.areaDAO = new AreaDAO();
    }
    if (scaleDAO) {
      this.scaleDAO = scaleDAO;
    } else {
      this.scaleDAO = new ScaleDAO();
    }
    if (typeDAO) {
      this.typeDAO = typeDAO;
    } else {
      this.typeDAO = new TypeDAO();
    }
    if (stakeholderDAO) {
      this.stakeholderDAO = stakeholderDAO;
    } else {
      this.stakeholderDAO = new StakeholderDAO();
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
  async addDocument(
    title: string,
    desc: string,
    scale: string,
    type: string,
    language: string | null,
    pages: string | null,
    issuance_year: string,
    issuance_month: string | null,
    issuance_day: string | null,
    stakeholders: string[],
    id_area: number | null,
    georeference: Georeference | null,
  ): Promise<number> {
    try {
      await db.query('BEGIN'); // Start transaction
      if (!id_area && georeference) {
        // Add area
        const areas = georeference.map(coord => [coord.lon, coord.lat]);
        id_area = await this.areaDAO.addArea(areas);
      }
      if (!(await this.checkScale(scale))) {
        // The scale doesn't exist, add it
        await this.scaleDAO.addScale(scale);
      }
      if (!(await this.checkDocumentType(type))) {
        // The type doesn't exist, add it
        await this.typeDAO.addType(type);
      }
      //add stakeholders doens't exists:
      for (const stakeholder of stakeholders) {
        const exists = await this.checkStakeholder(stakeholder);
        if (!exists) {
          await this.stakeholderDAO.addStakeholder(stakeholder);
        }
      }
      // Insert document
      const documentInsertQuery = `
        INSERT INTO documents (title, "desc", scale, type, language, pages, issuance_year, issuance_month, issuance_day, id_area)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id_file
      `;

      const result = await db.query(documentInsertQuery, [
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
      ]);

      const documentID = result.rows[0].id_file;

      for (const stakeholder of stakeholders) {
        await this.addStakeholderToDocument(documentID, stakeholder);
      }

      await db.query('COMMIT'); // Commit transaction
      return documentID;
    } catch (error) {
      await db.query('ROLLBACK'); // Rollback on error
      throw error; // Rethrow the error for handling elsewhere
    }
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
                d.type, l.language_name, d.pages, d.issuance_year, d.issuance_month, d.issuance_day, d.id_area,
                s.stakeholder
              FROM documents d
              LEFT JOIN stakeholders_docs s ON s.doc = d.id_file
              LEFT JOIN languages l ON d.language = l.language_id
              WHERE d.id_file = $1;
        `;
        db.query(sql, [id], async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result || result.rowCount === 0) {
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
            firstRow.language_name,
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
   * @param stakeholders - The new stakeholders of the document. It must not be null.
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
    language: string | null,
    pages: string | null,
    issuance_year: string,
    issuance_month: string | null,
    issuance_day: string | null,
    stakeholders: string[],
    id_area: number | null,
    georeference: Georeference | null,
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      // const client = await db.connect();
      try {
        await db.query('BEGIN');
        if (!id_area && georeference) {
          // Add area
          const areas = georeference.map(coord => [coord.lon, coord.lat]);
          id_area = await this.areaDAO.addArea(areas);
        }

        const updateSql = `
          UPDATE documents
          SET title = $1, "desc" = $2, scale = $3, type = $4, language = $5, pages = $6, issuance_year = $7, issuance_month = $8, issuance_day = $9, id_area = $10
          WHERE id_file = $11
        `;
        const updateResult = await db.query(updateSql, [
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
        ]);

        if (updateResult.rowCount === 0) {
          throw new DocumentNotFoundError();
        }

        const deleteStakeholdersSql = `
          DELETE FROM stakeholders_docs WHERE doc = $1
        `;
        await db.query(deleteStakeholdersSql, [id]);

        const insertStakeholdersSql = `
          INSERT INTO stakeholders_docs (doc, stakeholder) VALUES ($1, $2)
        `;
        for (const stakeholder of stakeholders) {
          await db.query(insertStakeholdersSql, [id, stakeholder]);
        }

        if (!(await this.checkScale(scale))) {
          // The scale doesn't exist, add it
          await this.scaleDAO.addScale(scale);
        }
        if (!(await this.checkDocumentType(type))) {
          // The type doesn't exist, add it
          await this.typeDAO.addType(type);
        }
        //add stakeholders doens't exists:
        for (const stakeholder of stakeholders) {
          const exists = await this.checkStakeholder(stakeholder);
          if (!exists) {
            await this.stakeholderDAO.addStakeholder(stakeholder);
          }
        }

        await db.query('COMMIT');
        resolve(true);
      } catch (error) {
        await db.query('ROLLBACK');
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
        const sql = 'DELETE FROM documents WHERE id_file = $1';
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
          if (result.rowCount === 0) {
            resolve(false);
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
          if (result.rowCount === 0) {
            resolve(false);
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
          if (result.rowCount === 0) {
            resolve(false);
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
        const sql =
          'SELECT language_id FROM languages WHERE language_name = $1';
        db.query(sql, [language], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            resolve(false);
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // ___________ KX4 _____________________________
  /**
   * Fetches all document IDs and their corresponding area coordinates.
   * @returns A Promise resolving to an array of objects containing document_id and coordinates.
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
            if (result.rowCount === 0) {
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
          if (result.rowCount === 0) {
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

  // ___________ KX4 _____________________________
  /**
   * Fetches all document IDs and their corresponding area coordinates.
   * @returns A Promise resolving to an array of objects containing document_id and coordinates.
   */
  getCoordinates(): Promise<
    {
      docId: number;
      title: string;
      type: string;
      coordinates: Georeference;
      id_area: number;
    }[]
  > {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT 
        d.id_file,
        d.title,
        d.type,
        d.id_area,
        ST_AsGeoJSON(a.area) AS coordinates
      FROM 
        documents d
      JOIN 
        areas a ON d.id_area = a.id_area
      LEFT JOIN 
        doc_type t ON d.type = t.type_name
    `;

      db.query(sql, (err: Error | null, result: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Format coordinates as an array of { lat, lon } objects
        const coordinatesData = result.rows.map((row: any) => {
          try {
            const geoJson = JSON.parse(row.coordinates); // Parse GeoJSON
            let formattedCoordinates: Georeference = [];

            // Handle GeoJSON types
            if (geoJson.type === 'Point') {
              // Convert a single point
              formattedCoordinates = [
                { lon: geoJson.coordinates[0], lat: geoJson.coordinates[1] },
              ];
            } else if (geoJson.type === 'Polygon') {
              // Convert polygon coordinates
              formattedCoordinates = geoJson.coordinates[0].map(
                (coord: number[]) => ({
                  lon: coord[0],
                  lat: coord[1],
                }),
              );
            } else if (geoJson.type === 'MultiPolygon') {
              // Flatten and convert multi-polygon coordinates
              formattedCoordinates = geoJson.coordinates.map((polygon: any[]) =>
                polygon[0].map(([lon, lat]: [number, number]) => ({
                  lon,
                  lat,
                })),
              );
            } else {
              throw new Error('Unexpected GeoJSON type');
            }

            return {
              docId: row.id_file,
              title: row.title,
              type: row.type,
              id_area: row.id_area,
              coordinates: formattedCoordinates,
            };
          } catch (error) {
            console.error('Error parsing GeoJSON:', error);
            return {
              docId: row.id_file,
              title: row.title,
              type: row.type,
              id_area: row.id_area,
              coordinates: [], // Handle invalid coordinates gracefully
            };
          }
        });

        resolve(coordinatesData);
      });
    });
  }

  async getGeoreferenceById(documentId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          d.id_file,
          d.title,
          d.desc,
          d.scale,
          d.type,
          d.language,
          d.issuance_year,
          d.issuance_month,
          d.issuance_day,
          d.pages,
          d.id_area,
          ST_AsGeoJSON(a.area) AS area_geojson, -- Get area in GeoJSON format
          s.scale AS scale_name,
          t.type_name AS type_name,
          l.language_name AS language_name,
          -- Aggregate stakeholders into an array
          ARRAY_AGG(DISTINCT sd.stakeholder) AS stakeholders,
          -- Aggregate document links into an array of objects, handling bi-directionality
          ARRAY_AGG(DISTINCT jsonb_build_object(
            'docId', CASE 
                       WHEN lk.doc1 = $1 THEN lk.doc2 
                       ELSE lk.doc1 
                     END,
            'linkType', lk.link_type
          )) AS links
        FROM 
          documents d
        LEFT JOIN 
          scales s ON d.scale = s.scale
        LEFT JOIN 
          doc_type t ON d.type = t.type_name
        LEFT JOIN 
          languages l ON d.language = l.language_id
        LEFT JOIN 
          areas a ON d.id_area = a.id_area
        LEFT JOIN 
          stakeholders_docs sd ON d.id_file = sd.doc
        LEFT JOIN 
          link lk ON d.id_file = lk.doc1 OR d.id_file = lk.doc2
        WHERE 
          d.id_file = $1
        GROUP BY 
          d.id_file, s.scale, t.type_name, l.language_name, a.area
      `;

      // Query the database with the provided document ID
      db.query(sql, [documentId], (err: Error | null, result: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (result.rowCount === 0) {
          reject(new DocumentNotFoundError());
          return;
        }

        // Process the data
        const row = result.rows[0];
        let formattedCoordinates: Georeference = [];

        try {
          // Parse GeoJSON data from the area column
          const geoJson = JSON.parse(row.area_geojson);

          // Handle GeoJSON types: Point, Polygon, and MultiPolygon
          if (geoJson.type === 'Point') {
            formattedCoordinates = [
              { lon: geoJson.coordinates[0], lat: geoJson.coordinates[1] },
            ];
          } else if (geoJson.type === 'Polygon') {
            formattedCoordinates = geoJson.coordinates[0].map(
              (coord: number[]) => ({
                lon: coord[0],
                lat: coord[1],
              }),
            );
          } else if (geoJson.type === 'MultiPolygon') {
            formattedCoordinates = geoJson.coordinates.map((polygon: any[]) =>
              polygon[0].map(([lon, lat]: [number, number]) => ({
                lon,
                lat,
              })),
            );
          } else {
            throw new Error('Unexpected GeoJSON type');
          }
        } catch (error) {
          console.error('Error parsing GeoJSON:', error);
        }

        // Return the document data along with stakeholders, links, and coordinates
        resolve({
          docId: row.id_file,
          title: row.title,
          description: row.desc,
          scale: row.scale_name,
          type: row.type_name,
          language: row.language_name,
          issuanceDate: {
            year: row.issuance_year,
            month: row.issuance_month,
            day: row.issuance_day,
          },
          pages: row.pages,
          area: formattedCoordinates,
          stakeholders: row.stakeholders.filter((s: string) => s), // Filter out any null values
          links: row.links.filter((link: any) => link.docId), // Filter out any invalid links
        });
      });
    });
  }

  /**
   * Check if a area exists.
   * @param area - The area of the document to check.
   * @returns A Promise that resolves if the area exists.
   * @throws AreaNotFoundError if the area does not exist.
   */
  checkArea(area: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = 'SELECT area FROM areas WHERE id_area = $1';
        db.query(sql, [area], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            reject(new DocumentAreaNotFoundError());
            return;
          }
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  getCoordinatesOfArea(id_area: number): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const sql = `SELECT ST_AsGeoJSON(area) AS area_geojson FROM areas WHERE id_area = $1`;
        db.query(sql, [id_area], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            reject(new DocumentAreaNotFoundError());
            return;
          }

          const row = result.rows[0];
          let formattedCoordinates: Georeference = [];

          try {
            const geoJson = JSON.parse(row.area_geojson);
            // Handling different GeoJSON types
            if (geoJson.type === 'Point') {
              // For Point, return the coordinates as a single point
              formattedCoordinates = [
                { lon: geoJson.coordinates[0], lat: geoJson.coordinates[1] },
              ];
            } else if (geoJson.type === 'Polygon') {
              // For Polygon, use the first ring of coordinates
              formattedCoordinates = geoJson.coordinates[0].map(
                (coord: number[]) => ({
                  lon: coord[0],
                  lat: coord[1],
                }),
              );
            } else if (geoJson.type === 'MultiPolygon') {
              // For MultiPolygon, flatten the coordinates
              formattedCoordinates = geoJson.coordinates.map((polygon: any[]) =>
                polygon[0].map(([lon, lat]: [number, number]) => ({
                  lon,
                  lat,
                })),
              );
            } else {
              throw new Error('Unexpected GeoJSON type');
            }
          } catch (error) {
            reject(new Error('Error parsing GeoJSON'));
            return;
          }

          resolve(formattedCoordinates);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  updateDocArea(
    id: number,
    georeference: Georeference | null,
    id_area: number | null,
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        if (id_area) {
          const sql = `UPDATE documents SET id_area = $1 WHERE id_file = $2`;
          db.query(sql, [id_area, id], (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(true);
          });
        }
        if (georeference && !id_area) {
          const areas = georeference.map(coord => [coord.lon, coord.lat]);
          this.areaDAO.addArea(areas).then(id_area => {
            const sql = `UPDATE documents SET id_area = $1 WHERE id_file = $2`;
            db.query(sql, [id_area, id], (err: Error | null, result: any) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(true);
            });
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if an hash is already in the db.
   * @param hash - The hash of the document to check.
   * @param docId - The id of the document to link the resource with.
   * @returns A boolean that resolves if the hash exists.
   */
  async checkResource(hash: string, docId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql =
          'SELECT * FROM resources WHERE resource_hash = $1 AND docId = $2';
        db.query(sql, [hash, docId], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            resolve(false);
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
   * Add a new hash to the db.
   * @param hash - The hash of the document to add.
   * @param name - The name of the document to add.
   * @param path - The path of the document to add.
   * @param docId - The id of the document to link the resource with.
   * @returns  that resolves if the hash has been added.
   */
  async addResource(
    name: string,
    hash: string,
    path: string,
    docId: number,
  ): Promise<boolean> {
    try {
      await db.query('BEGIN');

      //what is OID?
      const sql =
        'INSERT INTO resources (docId, resource_name, resource_path, resource_hash) VALUES ($1, $2, $3, $4)';
      const result = await db.query(sql, [docId, name, path, hash]);
      if (result.rowCount === 0) {
        throw new Error('Error inserting resource');
      }
      await db.query('COMMIT'); // Commit transaction
      return true;
    } catch (error) {
      await db.query('ROLLBACK'); // Rollback on error
      throw error; // Rethrow the error for handling elsewhere
    }
  }
}

export default DocumentDAO;
