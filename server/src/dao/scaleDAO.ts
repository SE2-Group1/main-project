import { QueryResult } from 'pg';

import { Scale } from '../components/scale';
import db from '../db/db';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class ScaleDAO {
  /**
   * Returns all scales.
   * @returns A Promise that resolves to an array with all scales.
   */
  getAllScales(): Promise<Scale[]> {
    return new Promise<Scale[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM scales';
        db.query(sql, (err: Error | null, result: QueryResult<any>) => {
          if (err) {
            reject(err);
            return;
          }
          const scales = result.rows.map(row => new Scale(row.scale));
          resolve(scales);
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
  getScale(scale: string): Promise<Scale> {
    return new Promise<Scale>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM scales WHERE scale = ?';
        db.query(sql, [scale], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rows.length === 0) {
            reject(new Error('Scale not found'));
            return;
          }
          resolve(new Scale(result.rows[0].scale));
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
  addScale(scale: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `
                    INSERT INTO scales (scale)
                    VALUES (?)
                    `;
        db.query(sql, [scale], (err: Error | null) => {
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

export default ScaleDAO;
