import { QueryResult } from 'pg';

import { Stakeholder } from '../components/stakeholder';
import db from '../db/db';
import { StakeholderNotFoundError } from '../errors/stakeholderError';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class StakeholderDAO {
  /**
   * Creates a new stakeholder.
   * @param stakeholder - The name of the stakeholder. It must not be null.
   * @returns A Promise that resolves to true if the stakeholder has been created.
   */
  addStakeholder(stakeholder: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `INSERT INTO stakeholders (stakeholder)
                VALUES (?)`;
        db.query(sql, [stakeholder], (err: Error | null) => {
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
   * Returns a specific stakeholder.
   * @param stakeholder - The name of the stakeholder to retrieve. The stakeholder must exist.
   * @returns A Promise that resolves to the stakeholder with the specified name.
   * @throws StakeholderNotFoundError if the stakeholder with the specified name does not exist.
   */
  getStakeholder(stakeholder: string): Promise<Stakeholder> {
    return new Promise<Stakeholder>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM stakeholders WHERE stakeholder = ?';
        db.query(sql, [stakeholder], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            reject(new StakeholderNotFoundError());
            return;
          }
          const stakeholder = new Stakeholder(result.rows[0].stakeholder);
          resolve(stakeholder);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns all stakeholders.
   * @returns A Promise that resolves to an array with all stakeholders.
   */
  getAllStakeholders(): Promise<Stakeholder[]> {
    return new Promise<Stakeholder[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM stakeholders';
        db.query(sql, [], (err: Error | null, result: QueryResult<any>) => {
          if (err) {
            reject(err);
            return;
          }
          const stakeholders = result.rows.map(
            row => new Stakeholder(row.stakeholder),
          );
          resolve(stakeholders);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default StakeholderDAO;
