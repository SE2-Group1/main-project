import { QueryResult } from 'pg';

import { LinkType } from '../components/linkType';
import db from '../db/db';
import { LinkTypeNotFoundError } from '../errors/linkError';

/**
 * A class that implements the interaction with the database for all link types.
 */
class LinkTypeDAO {
  /**
   * Returns all scales.
   * @returns A Promise that resolves to an array with all link types.
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
          const link_types = result.rows.map(
            row => new LinkType(row.link_name),
          );
          resolve(link_types);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns a specific link type.
   * @param link_type - The name of the link_type to retrieve.
   * @returns A Promise that resolves to the link_type with the specified name.
   * @throws ScaleNotFoundError if the scale with the specified name does not exist.
   */
  getLinkType(link_type: string): Promise<LinkType> {
    return new Promise<LinkType>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM link_types WHERE link_name = $1';
        db.query(sql, [link_type], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rows.length === 0) {
            reject(new LinkTypeNotFoundError());
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
  addLinkType(link_type: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `
                    INSERT INTO link_types (link_name)
                    VALUES ($1)
                    `;
        db.query(sql, [link_type], (err: Error | null) => {
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
