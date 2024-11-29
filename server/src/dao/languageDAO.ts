import { QueryResult } from 'pg';

import { Language } from '../components/language';
import db from '../db/db';
import { LanguageNotFoundError } from '../errors/languageError';

/**
 * A class that implements the interaction with the database for all document-related operations.
 */
class LanguageDAO {
  /**
   * Returns all languages.
   * @returns A Promise that resolves to an array with all languages.
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
   * Returns a specific language.
   * @param language - The name of the language to retrieve. The language must exist.
   * @returns A Promise that resolves to the language with the specified name.
   * @throws LanguageNotFoundError if the language with the specified name does not exist.
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
          if (result.rowCount === 0) {
            reject(new LanguageNotFoundError());
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
   * Creates a new language.
   * @param language - The name of the language. It must not be null.
   * @returns A Promise that resolves to true if the language has been created.
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
