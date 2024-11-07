import { Language } from '../../../src/components/language';
import LanguageDAO from '../../../src/dao/languageDAO';
import db from '../../../src/db/db';

jest.mock('../../../src/db/db');

describe('LanguageDAO', () => {
  let languageDAO: LanguageDAO;

  beforeEach(() => {
    languageDAO = new LanguageDAO();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLanguages', () => {
    it('should return all languages', async () => {
      const mockLanguages = [
        { language_id: '1', language_name: 'English' },
        { language_id: '2', language_name: 'Spanish' },
      ];
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(null, { rows: mockLanguages });
      });

      const result = await languageDAO.getAllLanguages();
      expect(result).toEqual([
        new Language('1', 'English'),
        new Language('2', 'Spanish'),
      ]);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(languageDAO.getAllLanguages()).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('getLanguage', () => {
    it('should return a specific language', async () => {
      const mockLanguage = { language_id: '1', language_name: 'English' };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockLanguage] });
      });

      const result = await languageDAO.getLanguage('1');
      expect(result).toEqual(new Language('1', 'English'));
    });

    it('should throw an error if the language is not found', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [] });
      });

      await expect(languageDAO.getLanguage('1')).rejects.toThrow(
        'Type not found',
      );
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(languageDAO.getLanguage('1')).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('addLanguage', () => {
    it('should add a new language', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await languageDAO.addLanguage('3', 'French');
      expect(result).toBe(true);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'));
      });

      await expect(languageDAO.addLanguage('3', 'French')).rejects.toThrow(
        'Query failed',
      );
    });
  });
});
