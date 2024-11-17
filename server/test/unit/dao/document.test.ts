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

  //TODO: fix this test, it can't read the value of the rows
  /*
  describe('addDocument', () => {
   
    test('It should return the document id', async () => {
      // Mocking the query method
      jest.spyOn(db, 'query').mockImplementation((sql, params) => {
        if (sql.startsWith('INSERT INTO documents')) {
          return Promise.resolve({ rows: [{ id_file: 1 }] });
        }
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
        [],
        1,
      );
      expect(result).toBe(1);
    });

    test('It should handle null optional parameters', async () => {
      // Mocking the query method
      jest.spyOn(db, 'query').mockImplementation((sql, params) => {
        if (sql.startsWith('BEGIN')) {
          return Promise.resolve();
        } else if (sql.startsWith('INSERT INTO documents')) {
          return Promise.resolve({ rows: [{ id_file: 2 }] });
        } else if (sql.startsWith('COMMIT')) {
          return Promise.resolve();
        } else {
          return Promise.resolve();
        }
      });
  
      const result = await documentDAO.addDocument(
        'title',
        'testDesc',
        'testScale',
        'testType',
        null,
        null,
        'testYear',
        null,
        null,
        [],
        1,
      );
      expect(result).toBe(2);
    });
  
    test('It should rollback transaction on error', async () => {
      // Mocking the query method
      jest.spyOn(db, 'query').mockImplementation((sql, params) => {
        if (sql === 'BEGIN') {
          return Promise.resolve();
        } else if (sql.startsWith('INSERT INTO documents')) {
          return Promise.reject(new Error('DB Error'));
        } else if (sql.startsWith('ROLLBACK')) {
          return Promise.resolve();
        } else {
          return Promise.resolve();
        }
      });
  
      await expect(documentDAO.addDocument(
        'title',
        'testDesc',
        'testScale',
        'testType',
        'testLanguage',
        'testPages',
        'testYear',
        'testMonth',
        'testDay',
        [],
        1,
      )).rejects.toThrow('DB Error');
  
      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith('ROLLBACK');
    });
  
    test('It should call addStakeholderToDocument for each stakeholder', async () => {
      // Mocking the query method
      jest.spyOn(db, 'query').mockImplementation((sql, params) => {
        if (sql.startsWith('BEGIN')) {
          return Promise.resolve();
        } else if (sql.startsWith('INSERT INTO documents')) {
          return Promise.resolve({ rows: [{ id_file: 3 }] });
        } else if (sql.startsWith('COMMIT')) {
          return Promise.resolve();
        } else {
          return Promise.resolve();
        }
      });
  
      const addStakeholderToDocumentSpy = jest.spyOn(documentDAO, 'addStakeholderToDocument').mockImplementation(async () => true);
  
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
        ['Stakeholder1', 'Stakeholder2'],
        1,
      );
  
      expect(addStakeholderToDocumentSpy).toHaveBeenCalledTimes(2);
      expect(addStakeholderToDocumentSpy).toHaveBeenCalledWith(3, 'Stakeholder1');
      expect(addStakeholderToDocumentSpy).toHaveBeenCalledWith(3, 'Stakeholder2');
    });
  
    test('It should throw an error', async () => {
      // Mocking the query method
      jest.spyOn(db, 'query').mockImplementation((sql, params) => {
        return Promise.reject('error');
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
          [],
          1,
        );
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });
  */

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

  // describe('addDocArea', () => {
  //   test('It should add a document area and return true', async () => {
  //     const mockDBQuery = jest
  //       .spyOn(db, 'query')
  //       .mockImplementation((sql, params, callback: any) => {
  //         callback(null);
  //       });

  //     const result = await documentDAO.addDocArea(1, 2);

  //     expect(result).toBe(true);
  //     expect(mockDBQuery).toHaveBeenCalledWith(
  //       `INSERT INTO area_doc (area, doc) VALUES ($1, $2)`,
  //       [2, 1],
  //       expect.any(Function),
  //     );
  //     mockDBQuery.mockRestore();
  //   });

  //   test('It should throw an error if the query fails', async () => {
  //     const mockDBQuery = jest
  //       .spyOn(db, 'query')
  //       .mockImplementation((sql, params, callback: any) => {
  //         callback(new Error('Database error'));
  //       });

  //     await expect(documentDAO.addDocArea(1, 2)).rejects.toThrow(
  //       'Database error',
  //     );
  //     mockDBQuery.mockRestore();
  //   });
  // });

  describe('checkLink', () => {
    it('should return true if the link exists', async () => {
      const mockResult = { rows: [{ doc1: 1, doc2: 2, link_type: 'type' }] };
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(null, mockResult);
        },
      );

      const result = await documentDAO.checkLink(1, 2, 'type');
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT doc1, doc2, link_type FROM links WHERE doc1 = $1 AND doc2 = $2 AND link_type = $3',
        [1, 2, 'type'],
        expect.any(Function),
      );
    });

    it('should throw an error if the link does not exist', async () => {
      const mockResult = { rows: [] };
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(null, mockResult);
        },
      );

      await expect(documentDAO.checkLink(1, 2, 'type')).rejects.toThrow(
        'Link not found',
      );
      expect(db.query).toHaveBeenCalledWith(
        'SELECT doc1, doc2, link_type FROM links WHERE doc1 = $1 AND doc2 = $2 AND link_type = $3',
        [1, 2, 'type'],
        expect.any(Function),
      );
    });

    it('should throw an error if there is a database error', async () => {
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(mockError, null);
        },
      );

      await expect(documentDAO.checkLink(1, 2, 'type')).rejects.toThrow(
        'Database error',
      );
      expect(db.query).toHaveBeenCalledWith(
        'SELECT doc1, doc2, link_type FROM links WHERE doc1 = $1 AND doc2 = $2 AND link_type = $3',
        [1, 2, 'type'],
        expect.any(Function),
      );
    });
  });

  describe('getLinkType', () => {
    it('should return true if the link type exists', async () => {
      const mockResult = { rows: [{ link_type: 'type' }] };
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(null, mockResult);
        },
      );

      const result = await documentDAO.getLinkType('type');
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT link_type FROM link_types WHERE link_type = $1',
        ['type'],
        expect.any(Function),
      );
    });

    it('should throw an error if the link type does not exist', async () => {
      const mockResult = { rows: [] };
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(null, mockResult);
        },
      );

      await expect(documentDAO.getLinkType('nonexistent')).rejects.toThrow(
        'Link type not found',
      );
      expect(db.query).toHaveBeenCalledWith(
        'SELECT link_type FROM link_types WHERE link_type = $1',
        ['nonexistent'],
        expect.any(Function),
      );
    });

    it('should throw an error if there is a database error', async () => {
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(mockError, null);
        },
      );

      await expect(documentDAO.getLinkType('type')).rejects.toThrow(
        'Database error',
      );
      expect(db.query).toHaveBeenCalledWith(
        'SELECT link_type FROM link_types WHERE link_type = $1',
        ['type'],
        expect.any(Function),
      );
    });
  });

  describe('getCoordinates', () => {
    it('should return the document IDs and their coordinates', async () => {
      const mockResult = {
        rows: [
          {
            id_file: 1,
            title: 'Document 1',
            type: 'Type 1',
            coordinates: JSON.stringify({
              type: 'Point',
              coordinates: [12.4924, 41.8902],
            }),
          },
          {
            id_file: 2,
            title: 'Document 2',
            type: 'Type 2',
            coordinates: JSON.stringify({
              type: 'Polygon',
              coordinates: [
                [
                  [12.4924, 41.8902],
                  [12.4934, 41.8912],
                  [12.4944, 41.8922],
                  [12.4924, 41.8902],
                ],
              ],
            }),
          },
        ],
      };
      (db.query as jest.Mock).mockImplementation((sql, callback: any) => {
        callback(null, mockResult);
      });

      const result = await documentDAO.getCoordinates();
      expect(result).toEqual([
        {
          docId: 1,
          title: 'Document 1',
          type: 'Type 1',
          coordinates: [{ lat: 41.8902, lon: 12.4924 }],
        },
        {
          docId: 2,
          title: 'Document 2',
          type: 'Type 2',
          coordinates: [
            { lat: 41.8902, lon: 12.4924 },
            { lat: 41.8912, lon: 12.4934 },
            { lat: 41.8922, lon: 12.4944 },
            { lat: 41.8902, lon: 12.4924 },
          ],
        },
      ]);
    });

    it('should throw an error if the query fails', async () => {
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation((sql, callback: any) => {
        callback(mockError, null);
      });

      await expect(documentDAO.getCoordinates()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getGeoreferenceById', () => {
    it('should return the georeference and the description of a document', async () => {
      const mockResult = {
        rows: [
          {
            id_file: 1,
            title: 'Document 1',
            desc: 'Description 1',
            scale_name: 'Scale 1',
            type_name: 'Type 1',
            language_name: 'Language 1',
            issuance_year: '2023',
            issuance_month: '10',
            issuance_day: '15',
            pages: '100',
            area_geojson: JSON.stringify({
              type: 'Point',
              coordinates: [12.4924, 41.8902],
            }),
            stakeholders: ['Stakeholder 1'],
            links: [{ docId: 2, linkType: 'Link Type 1' }],
          },
        ],
      };
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(null, mockResult);
        },
      );

      const result = await documentDAO.getGeoreferenceById(1);
      expect(result).toEqual({
        docId: 1,
        title: 'Document 1',
        description: 'Description 1',
        scale: 'Scale 1',
        type: 'Type 1',
        language: 'Language 1',
        issuanceDate: {
          year: '2023',
          month: '10',
          day: '15',
        },
        pages: '100',
        area: [{ lat: 41.8902, lon: 12.4924 }],
        stakeholders: ['Stakeholder 1'],
        links: [{ docId: 2, linkType: 'Link Type 1' }],
      });
    });

    it('should throw a DocumentNotFoundError if the document does not exist', async () => {
      const mockResult = { rows: [] };
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(null, mockResult);
        },
      );

      await expect(documentDAO.getGeoreferenceById(1)).rejects.toThrow(
        DocumentNotFoundError,
      );
    });

    it('should throw an error if the query fails', async () => {
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(mockError, null);
        },
      );

      await expect(documentDAO.getGeoreferenceById(1)).rejects.toThrow(
        'Database error',
      );
    });
  });
});

// describe('getCoordinates', () => {
//   test('It should return the document IDs and their coordinates', async () => {
//     const documentDAO = new DocumentDAO();
//     const mockDBQuery = jest
//       .spyOn(db, 'query')
//       .mockImplementation((sql, callback: any) => {
//         callback(null, {
//           rows: [
//             {
//               id_file: 1,
//               coordinates: JSON.stringify({
//                 type: 'Point',
//                 coordinates: [12.4924, 41.8902],
//               }),
//             },
//             {
//               id_file: 2,
//               coordinates: JSON.stringify({
//                 type: 'Polygon',
//                 coordinates: [
//                   [
//                     [12.4924, 41.8902],
//                     [12.4934, 41.8912],
//                     [12.4944, 41.8922],
//                     [12.4924, 41.8902],
//                   ],
//                 ],
//               }),
//             },
//           ],
//         });
//       });

//     const result = await documentDAO.getCoordinates();
//     expect(result).toEqual([
//       {
//         docId: 1,
//         coordinates: [{ lat: 41.8902, lon: 12.4924 }],
//       },
//       {
//         docId: 2,
//         coordinates: [
//           { lat: 41.8902, lon: 12.4924 },
//           { lat: 41.8912, lon: 12.4934 },
//           { lat: 41.8922, lon: 12.4944 },
//           { lat: 41.8902, lon: 12.4924 },
//         ],
//       },
//     ]);
//     mockDBQuery.mockRestore();
//   });

//   test('It should throw an error if the query fails', async () => {
//     const documentDAO = new DocumentDAO();
//     jest
//       .spyOn(db, 'query')
//       .mockImplementation((sql, callback: any) => {
//         callback('error');
//       });

//     try{
//       await documentDAO.getCoordinates();
//     }
//     catch (error) {
//       expect(error).toBe('error');
//     }
//   });

//   describe('getGeoreferenceById', () => {
//     test('It should return the georeference and the description of a document', async () => {
//       const documentDAO = new DocumentDAO();
//       const mockDBQuery = jest
//         .spyOn(db, 'query')
//         .mockImplementation((sql, params, callback: any) => {
//           callback(null, {
//             rows: [
//               {
//                 id_file: 1,
//                 title: 'testDocument',
//                 desc: 'testDesc',
//                 scale_name: 'testScale',
//                 issuance_year: 'testYear',
//                 issuance_month: 'testMonth',
//                 issuance_day: 'testDay',
//                 type_name: 'testType',
//                 language_name: 'testLanguage',
//                 pages: 'testPages',
//                 area_geojson: JSON.stringify({
//                   type: 'Point',
//                   coordinates: [12.4924, 41.8902],
//                 }),
//               },
//             ],
//           });
//         });

//       const result = await documentDAO.getGeoreferenceById(1);
//       expect(result).toEqual({
//         docId: 1,
//         title: 'testDocument',
//         description: 'testDesc',
//         scale: 'testScale',
//         issuanceDate: {
//           year: 'testYear',
//           month: 'testMonth',
//           day: 'testDay',
//         },
//         type: 'testType',
//         language: 'testLanguage',
//         pages: 'testPages',
//         area: [{ lat: 41.8902, lon: 12.4924 }],
//       });
//       mockDBQuery.mockRestore();
//     });

//     test('It should throw a DocumentNotFoundError if the document does not exist', async () => {
//       const documentDAO = new DocumentDAO();
//       jest
//         .spyOn(db, 'query')
//         .mockImplementation((sql, params, callback: any) => {
//           callback(null, { rows: [] });
//         });

//       try {
//         await documentDAO.getGeoreferenceById(1);
//       } catch (error) {
//         expect(error).toBeInstanceOf(DocumentNotFoundError);
//       }
//     });

//     test('It should throw an error if the query fails', async () => {
//       const documentDAO = new DocumentDAO();
//       jest
//         .spyOn(db, 'query')
//         .mockImplementation((sql, params, callback: any) => {
//           callback('error');
//         });

//       try {
//         await documentDAO.getGeoreferenceById(1);
//       } catch (error) {
//         expect(error).toBe('error');
//       }
//     });
//   });

// });
