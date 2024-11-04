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
   * @param desc - The description of the stakeholder. It must not be null.
   * @returns A Promise that resolves to true if the stakeholder has been created.
   */
  addStakeholder(stakeholder: string, desc: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql = `
                INSERT INTO stakeholders (stakeholder, desc)
                VALUES (?, ?)
                `;
        db.query(sql, [stakeholder, desc], (err: Error | null) => {
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
   * Returns a specific stakeholder.
   * @param stakeholder - The name of the stakeholder to retrieve. The stakeholder must exist.
   * @returns A Promise that resolves to the stakeholder with the specified name.
   * @throws StakeholderNotFoundError if the stakeholder with the specified name does not exist.
   */
  getStakeholder(stakeholder: string): Promise<Stakeholder> {
    return new Promise<Stakeholder>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM stakeholders WHERE stakeholder = ?';
        db.query(sql, [stakeholder], (err: Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            reject(new StakeholderNotFoundError());
            return;
          }
          const stakeholder = new Stakeholder(row.stakeholder, row.desc);
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
            row => new Stakeholder(row.stakeholder, row.desc),
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