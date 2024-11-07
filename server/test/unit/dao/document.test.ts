import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import { Document } from '../../../src/components/document';
import DocumentDAO from '../../../src/dao/documentDAO';
import db from '../../../src/db/db';
import {
  DocumentLanguageNotFoundError,
  DocumentNotFoundError,
  DocumentScaleNotFoundError,
  DocumentTypeNotFoundError,
} from '../../../src/errors/documentError';

jest.mock('../../../src/db/db');
const testDocument: Document = {
  id_file: 1,
  title: 'testDocument',
  desc: 'testDesc',
  scale: 'testScale',
  issuance_date: 'testDate',
  type: 'testType',
  language: 'testLanguage',
  link: 'testLink',
  pages: 'testPages',
  stakeholder: ['stakeholder'],
};

describe('documentDAO', () => {
  let documentDAO: DocumentDAO;
  beforeEach(() => {
    documentDAO = new DocumentDAO();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addDocument', () => {
    test('It should return the document id', async () => {
      // Mocking the query method
      jest.spyOn(db, 'query').mockImplementation((_, __, callback: any) => {
        callback(null, { rows: [{ id_file: 1 }] });
      });
      const result = await documentDAO.addDocument(
        'title',
        'testDesc',
        'testScale',
        'testDate',
        'testType',
        'testLanguage',
        'testLink',
        'testPages',
      );
      expect(result).toBe(1);
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.addDocument(
          'title',
          'testDesc',
          'testScale',
          'testDate',
          'testType',
          'testLanguage',
          'testLink',
          'testPages',
        );
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });
  describe('getDocumentById', () => {
    test('It should return the document with stakeholders', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          if (sql === 'SELECT * FROM documents WHERE id_file = $1') {
            callback(null, {
              rows: [
                {
                  id_file: 1,
                  title: 'testDocument',
                  desc: 'testDesc',
                  scale: 'testScale',
                  issuance_date: 'testDate',
                  type: 'testType',
                  language: 'testLanguage',
                  link: 'testLink',
                  pages: 'testPages',
                },
              ],
            });
          } else if (
            sql === 'SELECT stakeholder FROM stakeholders_docs WHERE doc = $1'
          ) {
            callback(null, { rows: [{ stakeholder: 'stakeholder' }] });
          }
        });

      const result = await documentDAO.getDocumentById(1);
      expect(result).toEqual({
        id_file: 1,
        title: 'testDocument',
        desc: 'testDesc',
        scale: 'testScale',
        issuance_date: 'testDate',
        type: 'testType',
        language: 'testLanguage',
        link: 'testLink',
        pages: 'testPages',
        stakeholder: ['stakeholder'],
      });
      mockDBQuery.mockRestore();
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.getDocumentById(1);
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('getAlldocuments', () => {
    test('It should return the documents', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          if (sql === 'SELECT * FROM documents') {
            callback(null, {
              rows: [
                {
                  id_file: 1,
                  title: 'testDocument',
                  desc: 'testDesc',
                  scale: 'testScale',
                  issuance_date: 'testDate',
                  type: 'testType',
                  language: 'testLanguage',
                  link: 'testLink',
                  pages: 'testPages',
                },
              ],
            });
          } else if (
            sql === 'SELECT stakeholder FROM stakeholders_docs WHERE doc = $1'
          ) {
            callback(null, { rows: [{ stakeholder: 'stakeholder' }] });
          }
        });

      const result = await documentDAO.getAllDocuments();
      expect(result).toEqual([testDocument]);
    });
    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.getAllDocuments();
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('updateDocument', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 1 });
        });
      const result = await documentDAO.updateDocument(
        1,
        'updatedDocument',
        'updatedDesc',
        'updatedScale',
        'updatedDate',
        'updatedType',
        'updatedLanguage',
        'updatedLink',
        'updatedPages',
      );
      expect(result).toBe(true);
    });

    test('It should throw a document not found error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });
      try {
        await documentDAO.updateDocument(
          1,
          'updatedDocument',
          'updatedDesc',
          'updatedScale',
          'updatedDate',
          'updatedType',
          'updatedLanguage',
          'updatedLink',
          'updatedPages',
        );
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentNotFoundError);
      }
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.updateDocument(
          1,
          'updatedDocument',
          'updatedDesc',
          'updatedScale',
          'updatedDate',
          'updatedType',
          'updatedLanguage',
          'updatedLink',
          'updatedPages',
        );
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('updateDocumentDesc', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 1 });
        });
      const result = await documentDAO.updateDocumentDesc(1, 'updatedDesc');
      expect(result).toBe(true);
    });

    test('It should throw a document not found error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });
      try {
        await documentDAO.updateDocumentDesc(1, 'updatedDesc');
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentNotFoundError);
      }
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.updateDocumentDesc(1, 'updatedDesc');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('deleteDocument', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 1 });
        });
      const result = await documentDAO.deleteDocument(1);
      expect(result).toBe(true);
    });

    test('It should throw a document not found error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });
      try {
        await documentDAO.deleteDocument(1);
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentNotFoundError);
      }
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.deleteDocument(1);
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('checkStakeholder', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: { length: 1 } });
        });
      const result = await documentDAO.checkStakeholder('stakeholder');
      expect(result).toBe(true);
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.checkStakeholder('stakeholder');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('addStakeholderToDocument', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });
      const result = await documentDAO.addStakeholderToDocument(
        1,
        'stakeholder',
      );
      expect(result).toBe(true);
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.addStakeholderToDocument(1, 'stakeholder');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('deleteStakeholdersFromDocument', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });
      const result = await documentDAO.deleteStakeholdersFromDocument(1);
      expect(result).toBe(true);
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.deleteStakeholdersFromDocument(1);
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('checkDocumentType', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: { length: 1 } });
        });
      const result = await documentDAO.checkDocumentType('type');
      expect(result).toBe(true);
    });

    test('It should throw a DocumentTypeNotFoundError', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: { length: 0 } });
        });
      try {
        await documentDAO.checkDocumentType('type');
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentTypeNotFoundError);
      }
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.checkDocumentType('type');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('checkScale', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: { length: 1 } });
        });
      const result = await documentDAO.checkScale('scale');
      expect(result).toBe(true);
    });

    test('It should throw a DocumentScaleNotFoundError error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: { length: 0 } });
        });
      try {
        await documentDAO.checkScale('scale');
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentScaleNotFoundError);
      }
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.checkScale('scale');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('checkLanguage', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: { length: 1 } });
        });
      const result = await documentDAO.checkLanguage('language');
      expect(result).toBe(true);
    });

    test('It should throw a DocumentLanguageNotFoundError', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: { length: 0 } });
        });
      try {
        await documentDAO.checkLanguage('language');
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentLanguageNotFoundError);
      }
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.checkLanguage('language');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('addLink', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });
      const result = await documentDAO.addLink(1, 2, 'linkType');
      expect(result).toBe(true);
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.addLink(1, 2, 'linkType');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('checkLink', () => {
    test('It should return true if the link exists', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [{ doc1: 1, doc2: 2, link_type: 'linkType' }],
          });
        });

      const result = await documentDAO.checkLink(1, 2, 'linkType');
      expect(result).toBe(true);
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the link does not exist', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [] });
        });

      await expect(documentDAO.checkLink(1, 2, 'linkType')).rejects.toThrow(
        'Link not found',
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'), null);
        });

      await expect(documentDAO.checkLink(1, 2, 'linkType')).rejects.toThrow(
        'Database error',
      );
      mockDBQuery.mockRestore();
    });
  });

  describe('getLinkType', () => {
    test('It should return true if the link type exists', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [{ link_type: 'linkType' }] });
        });

      const result = await documentDAO.getLinkType('linkType');
      expect(result).toBe(true);
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the link type does not exist', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [] });
        });

      await expect(documentDAO.getLinkType('linkType')).rejects.toThrow(
        'Link type not found',
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'), null);
        });

      await expect(documentDAO.getLinkType('linkType')).rejects.toThrow(
        'Database error',
      );
      mockDBQuery.mockRestore();
    });
  });

  describe('addArea', () => {
    test('It should add an area as a POLYGON and return the area ID', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [{ id_area: 2 }] });
        });

      const coordinates = [
        12.4924, 41.8902, 12.4925, 41.8903, 12.4926, 41.8904, 12.4924, 41.8902,
      ];
      const result = await documentDAO.addArea(coordinates);

      expect(result).toBe(2);
      expect(mockDBQuery).toHaveBeenCalledWith(
        `INSERT INTO areas (area) VALUES (ST_GeomFromText('POLYGON($1)', 4326))`,
        [''],
        expect.any(Function),
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'), null);
        });

      const coordinates = [12.4924, 41.8902];

      await expect(documentDAO.addArea(coordinates)).rejects.toThrow(
        'Database error',
      );
      mockDBQuery.mockRestore();
    });
  });

  describe('addDocArea', () => {
    test('It should add a document area and return true', async () => {
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });

      const result = await documentDAO.addDocArea(1, 2);

      expect(result).toBe(true);
      expect(mockDBQuery).toHaveBeenCalledWith(
        `INSERT INTO area_doc (area, doc) VALUES ($1, $2)`,
        [2, 1],
        expect.any(Function),
      );
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'));
        });

      await expect(documentDAO.addDocArea(1, 2)).rejects.toThrow(
        'Database error',
      );
      mockDBQuery.mockRestore();
    });
  });
});
