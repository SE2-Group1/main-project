import fs from 'fs';
import path from 'path';

import { Resource } from '../components/resource';
import db from '../db/db';

/**
 * A class that implements the interaction with the database for all resource-related operations.
 */
class ResourceDAO {
  /**
   * Returns all resources.
   * @returns A Promise that resolves to an array with all resources.
   */
  getAllResources(): Promise<Resource[]> {
    return new Promise<Resource[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM resources';
        db.query(sql, async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }

          const resources = result.rows.map((row: any) => {
            return new Resource(
              row.resourceid,
              row.resource_name,
              row.resource_pages,
              null,
            );
          });
          resolve(resources);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns a specific resource.
   * @param resource - The name of the resource to retrieve. The resource must exist.
   * @returns A Promise that resolves to the resource with the specified name.
   * @throws ResourceNotFoundError if the resource with the specified name does not exist.
   */
  getResourceById(id: number): Promise<Resource> {
    return new Promise<Resource>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM resources WHERE resourceid = $1';
        db.query(sql, [id], async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            reject(new Error('Resource not found'));
            return;
          }
          const row = result.rows[0];
          const resourceHash = row.resource_hash;
          const ext = path.extname(row.resource_name);
          const filePath = path.join('resources', `${resourceHash}${ext}`);

          try {
            const fileBuffer = await fs.promises.readFile(filePath);
            resolve(
              new Resource(
                row.resourceid,
                row.resource_name,
                row.resource_pages,
                fileBuffer,
              ),
            );
          } catch (fileError) {
            reject(fileError);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns all the resources that are linked to a specific document.
   * @param docId - The ID of the document to retrieve the resources from.
   * @returns A Promise that resolves to an array with all resources linked to the specified document.
   */
  getResourcesByDocId(docId: number): Promise<Resource[]> {
    return new Promise<Resource[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM resources WHERE docId = $1';
        db.query(sql, [docId], async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          const resources = result.rows.map((row: any) => {
            return new Resource(
              row.resourceid,
              row.resource_name,
              row.resource_pages,
              null,
            );
          });
          resolve(resources);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes a resource.
   * @param docId - The ID of the document.
   * @param name - The name of the resource.
   */
  async deleteResource(resourceId: number, docId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql =
          'DELETE FROM resources WHERE resourceId = $1 and docId = $2';
        db.query(sql, [resourceId, docId], (err: Error | null, result: any) => {
          if (err) {
            throw err;
          }
          resolve(true);
        });
      } catch (error) {
        reject(new Error(`Unexpected error:${error}`));
      }
    });
  }
}

export default ResourceDAO;
