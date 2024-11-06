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
import { DocumentNotFoundError } from '../../../src/errors/documentError';

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
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
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
    test('It should return the document', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
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
      });
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
          callback(null);
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
          callback(null);
        });
      const result = await documentDAO.updateDocumentDesc(1, 'updatedDesc');
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
          callback(null, { affectedRows: 1 });
        });
      const result = await documentDAO.deleteDocument(1);
      expect(result).toBe(true);
    });

    test('It should throw a document not found error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { affectedRows: 0 });
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
});
