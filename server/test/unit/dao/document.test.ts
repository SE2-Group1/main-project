import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import { Document } from '../../../src/components/document';
import { Link } from '../../../src/components/link';
import DocumentDAO from '../../../src/dao/documentDAO';
import LinkDAO from '../../../src/dao/linkDAO';
import db from '../../../src/db/db';
import {
  DocumentLanguageNotFoundError,
  DocumentNotFoundError,
  DocumentScaleNotFoundError,
  DocumentTypeNotFoundError,
} from '../../../src/errors/documentError';

jest.mock('../../../src/db/db');
jest.mock('../../../src/dao/linkDAO');
const testDocument: Document = {
  id_file: 1,
  title: 'testDocument',
  desc: 'testDesc',
  scale: 'testScale',
  type: 'testType',
  language: 'testLanguage',
  pages: 'testPages',
  issuance_year: 'testYear',
  issuance_month: 'testMonth',
  issuance_day: 'testDay',
  id_area: 1,
  stakeholder: ['stakeholder'],
  links: [new Link(2, 'linkType')],
};

describe('documentDAO', () => {
  let documentDAO: DocumentDAO;
  let linkDAO: jest.Mocked<LinkDAO>;
  beforeEach(() => {
    linkDAO = new LinkDAO() as jest.Mocked<LinkDAO>;
    documentDAO = new DocumentDAO(linkDAO);
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
        'testType',
        'testLanguage',
        'testPages',
        'testYear',
        'testMonth',
        'testDay',
        1,
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
          'testType',
          'testLanguage',
          'testPages',
          'testYear',
          'testMonth',
          'testDay',
          1,
        );
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('getDocumentById', () => {
    test('It should return the document', async () => {
      // Mock getLinks method
      const mockGetLinks = jest
        .spyOn(linkDAO, 'getLinks')
        .mockImplementation(async (docId: number) => {
          return [new Link(2, 'linkType')];
        });
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              {
                id_file: 1,
                title: 'testDocument',
                desc: 'testDesc',
                scale: 'testScale',
                type: 'testType',
                language: 'testLanguage',
                pages: 'testPages',
                issuance_year: 'testYear',
                issuance_month: 'testMonth',
                issuance_day: 'testDay',
                id_area: 1,
                stakeholder: 'stakeholder1',
              },
            ],
          });
        });
      const result = await documentDAO.getDocumentById(1);
      expect(result).toEqual(
        new Document(
          1,
          'testDocument',
          'testDesc',
          'testScale',
          'testType',
          'testLanguage',
          'testPages',
          'testYear',
          'testMonth',
          'testDay',
          1,
          ['stakeholder1'],
          [new Link(2, 'linkType')],
        ),
      );
      mockDBQuery.mockRestore();
      mockGetLinks.mockRestore();
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

  describe('getAllDocuments', () => {
    test('It should return the documents', async () => {
      // Mocking the query method
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, callback: any) => {
          callback(null, {
            rows: [
              {
                id_file: 1,
                title: 'testDocument',
                desc: 'testDesc',
                scale: 'testScale',
                type: 'testType',
                language: 'testLanguage',
                pages: 'testPages',
                issuance_year: 'testYear',
                issuance_month: 'testMonth',
                issuance_day: 'testDay',
                id_area: 1,
                stakeholder: 'stakeholder',
              },
            ],
          });
        });
      const mockLinks = jest
        .spyOn(linkDAO, 'getLinks')
        .mockImplementation(async (docId: number) => {
          return [new Link(2, 'linkType')];
        });

      const result = await documentDAO.getAllDocuments();

      expect(result).toEqual([testDocument]);
      mockDBQuery.mockRestore();
      mockLinks.mockRestore();
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest.spyOn(db, 'query').mockImplementation((sql, callback: any) => {
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
        'updatedType',
        'updatedLanguage',
        'updatedPages',
        'updatedYear',
        'updatedMonth',
        'updatedDay',
        1,
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
          'updatedType',
          'updatedLanguage',
          'updatedPages',
          'updatedYear',
          'updatedMonth',
          'updatedDay',
          1,
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
          'updatedType',
          'updatedLanguage',
          'updatedPages',
          'updatedYear',
          'updatedMonth',
          'updatedDay',
          1,
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

  // describe('addArea', () => {
  //   test('It should add an area as a POLYGON and return the area ID', async () => {
  //     const documentDAO = new DocumentDAO();
  //     const mockDBQuery = jest
  //       .spyOn(db, 'query')
  //       .mockImplementation((sql, params, callback: any) => {
  //         callback(null, { rows: [{ id_area: 2 }] });
  //       });

  //     const coordinates = [
  //       [12.4924, 41.8902], [12.4925, 41.8903],[ 12.4926, 41.8904], [12.4924, 41.8902]
  //     ];
  //     const result = await documentDAO.addArea(coordinates);

  //     expect(result).toBe(2);
  //     expect(mockDBQuery).toHaveBeenCalledWith(
  //       `INSERT INTO areas (area) VALUES (ST_GeomFromText(POLYGON($1), 4326))`,
  //       [''],
  //       expect.any(Function),
  //     );
  //     mockDBQuery.mockRestore();
  //   });

  //   test('It should throw an error if the query fails', async () => {
  //     const documentDAO = new DocumentDAO();
  //     const mockDBQuery = jest
  //       .spyOn(db, 'query')
  //       .mockImplementation((sql, params, callback: any) => {
  //         callback(new Error('Database error'), null);
  //       });

  //     const coordinates = [12.4924, 41.8902];

  //     await expect(documentDAO.addArea(coordinates)).rejects.toThrow(
  //       'Database error',
  //     );
  //     mockDBQuery.mockRestore();
  //   });
  // });

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
