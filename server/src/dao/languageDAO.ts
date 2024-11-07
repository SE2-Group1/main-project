import { QueryResult } from 'pg';

import { Language } from '../components/language';
import db from '../db/db';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class LanguageDAO {
  /**
   * Returns all scales.
   * @returns A Promise that resolves to an array with all scales.
   */
  getAllLanguages(): Promise<Language[]> {
    return new Promise<Language[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM languages';
        db.query(sql, (err: Error | null, result: QueryResult<any>) => {
          if (err) {
            reject(err);
            return;
          }
          const languages = result.rows.map(
            row => new Language(row.language_id, row.language_name),
          );
          resolve(languages);
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
  getLanguage(language_id: string): Promise<Language> {
    return new Promise<Language>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM language WHERE language_id = ?';
        db.query(sql, [language_id], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rows.length === 0) {
            reject(new Error('Type not found'));
            return;
          }
          resolve(
            new Language(
              result.rows[0].language_id,
              result.rows[0].language_name,
            ),
          );
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
  addLanguage(language_id: string, language_name: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = `
                    INSERT INTO languages (language_id, language_name)
                    VALUES ($1, $2)
                    `;
        db.query(sql, [language_id, language_name], (err: Error | null) => {
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

export default LanguageDAO;
