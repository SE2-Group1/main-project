import { QueryResult } from 'pg';

import { Type } from '../components/type';
import db from '../db/db';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class TypeDAO {
  /**
   * Returns all scales.
   * @returns A Promise that resolves to an array with all scales.
   */
  getAllTypes(): Promise<Type[]> {
    return new Promise<Type[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM doc_type';
        db.query(sql, (err: Error | null, result: QueryResult<any>) => {
          if (err) {
            reject(err);
            return;
          }
          const types = result.rows.map(row => new Type(row.type_name));
          resolve(types);
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
  getType(type_name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM doc_type WHERE type_name = ?';
        db.query(sql, [type_name], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result.rows) {
            reject(new Error('Type not found'));
            return;
          }
          resolve(result.rows[0].type_name);
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
  addType(type_name: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `
                    INSERT INTO doc_type (type_name)
                    VALUES (?)
                    `;
        db.query(sql, [type_name], (err: Error | null) => {
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

export default TypeDAO;
