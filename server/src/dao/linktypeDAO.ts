import { QueryResult } from 'pg';

import { LinkType } from '../components/linktype';
import db from '../db/db';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class LinkTypeDAO {
  /**
   * Returns all scales.
   * @returns A Promise that resolves to an array with all scales.
   */
  getAllLinkTypes(): Promise<LinkType[]> {
    return new Promise<LinkType[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM link_types';
        db.query(sql, (err: Error | null, result: QueryResult<any>) => {
          if (err) {
            reject(err);
            return;
          }
          const linktypes = result.rows.map(row => new LinkType(row.link_name));
          resolve(linktypes);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns a specific scale.
   * @param scale - The name of the scale to retrieve. The scale must exist.
   * @returns A Promise that resolves to the scale with the specified name.
   * @throws ScaleNotFoundError if the scale with the specified name does not exist.
   */
  getLinkTypes(linktype: string): Promise<LinkType> {
    return new Promise<LinkType>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM link_types WHERE link_name = $1';
        db.query(sql, [linktype], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result.rows) {
            reject(new Error('Type not found'));
            return;
          }
          resolve(new LinkType(result.rows[0].link_name));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Creates a new scale.
   * @param scale - The name of the scale. It must not be null.
   * @returns A Promise that resolves to true if the scale has been created.
   * @throws ScaleAlreadyExistsError if the scale already exists.
   */
  addLinkType(linktype: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `
                    INSERT INTO link_types (link_name)
                    VALUES ($1)
                    `;
        db.query(sql, [linktype], (err: Error | null) => {
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
}

export default LinkTypeDAO;
