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

  describe('DocumentDAO - addDocument', () => {
    let documentDAO: DocumentDAO;

    beforeEach(() => {
      documentDAO = new DocumentDAO();
      jest.resetAllMocks(); // Reset all mocks before each test
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });

    test('should return the document ID on successful insert', async () => {
      // Mock the db.query function
      const queryMock = jest
        .spyOn(db, 'query')
        // Mock BEGIN, which doesn't return anything
        .mockResolvedValueOnce({}) // For 'BEGIN' query
        // Mock the document insert query to return a document ID
        .mockResolvedValueOnce({ rows: [{ id_file: 1 }] }) // For the insert query
        // Mock COMMIT, which doesn't return anything
        .mockResolvedValueOnce({}) // For 'COMMIT' query
        // Mock ROLLBACK, which doesn't return anything
        .mockResolvedValueOnce({}); // For 'ROLLBACK' query

      // Call the method you're testing
      const result = await documentDAO.addDocument(
        'test title for adding new document',
        'test Description for adding a new document',
        'Text',
        'Design',
        'IT',
        '5',
        '2024',
        '10',
        '15',
        [],
        1,
        null,
      );

      // Check that the result is the expected document ID
      expect(result).toBe(1);

      // Ensure db.query was called with the expected parameters
      expect(queryMock).toHaveBeenCalledWith('BEGIN');

      // For the INSERT query, match the full query string including parameters
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO documents/), // Match "INSERT INTO documents"
        expect.arrayContaining([
          // Ensure the parameters match
          'test title for adding new document',
          'test Description for adding a new document',
          'Text',
          'Design',
          'IT',
          '5',
          '2024',
          '10',
          '15',
          1,
        ]),
      );

      expect(queryMock).toHaveBeenCalledWith('COMMIT');
    });

    test('should handle null optional parameters', async () => {
      // Mocking queries for the transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 2 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

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
        null,
      );

      expect(result).toBe(2);
    });

    test('should rollback transaction on error', async () => {
      // Mocking a transaction flow with an error
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockRejectedValueOnce(new Error('DB Error')) // Mock INSERT with error
        .mockResolvedValueOnce(undefined); // Mock ROLLBACK

      await expect(
        documentDAO.addDocument(
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
          null,
        ),
      ).rejects.toThrow('DB Error');

      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('should call addStakeholderToDocument for each stakeholder', async () => {
      // Mocking a successful transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 3 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Mock addStakeholderToDocument method
      const addStakeholderToDocumentSpy = jest
        .spyOn(documentDAO, 'addStakeholderToDocument')
        .mockResolvedValue(true); // Mock addStakeholderToDocument

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
        null,
      );

      // Assertions
      expect(addStakeholderToDocumentSpy).toHaveBeenCalledTimes(2);
      expect(addStakeholderToDocumentSpy).toHaveBeenCalledWith(
        3,
        'Stakeholder1',
      );
      expect(addStakeholderToDocumentSpy).toHaveBeenCalledWith(
        3,
        'Stakeholder2',
      );
    });

    test('should throw an error when db.query fails', async () => {
      // Mocking a failing query
      jest.spyOn(db, 'query').mockRejectedValueOnce('error');

      await expect(
        documentDAO.addDocument(
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
          null,
        ),
      ).rejects.toBe('error');
    });
  });

  describe('DocumentDAO - updateDocument', () => {
    let documentDAO: DocumentDAO;

    beforeEach(() => {
      documentDAO = new DocumentDAO();
      jest.resetAllMocks(); // Reset all mocks before each test
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });

    test('should return true on successful update', async () => {
      // Mocking the db.query function for transaction flow
      const queryMock = jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rowCount: 1 }) // Mock UPDATE
        .mockResolvedValueOnce(undefined) // Mock DELETE stakeholders
        .mockResolvedValueOnce(undefined) // Mock INSERT stakeholders
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Call the method
      const result = await documentDAO.updateDocument(
        1,
        'Updated Title',
        'Updated Description',
        'Updated Scale',
        'Updated Type',
        'Updated Language',
        'Updated Pages',
        '2024',
        '11',
        '18',
        ['Stakeholder1', 'Stakeholder2'],
        2,
      );

      expect(result).toBe(true);
      expect(queryMock).toHaveBeenCalledWith('BEGIN');
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE documents/),
        expect.arrayContaining([
          'Updated Title',
          'Updated Description',
          'Updated Scale',
          'Updated Type',
          'Updated Language',
          'Updated Pages',
          '2024',
          '11',
          '18',
          2,
          1,
        ]),
      );
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/DELETE FROM stakeholders_docs/),
        [1],
      );
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO stakeholders_docs/),
        [1, 'Stakeholder1'],
      );
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO stakeholders_docs/),
        [1, 'Stakeholder2'],
      );
      expect(queryMock).toHaveBeenCalledWith('COMMIT');
    });

    test('should throw DocumentNotFoundError when no rows are updated', async () => {
      // Mocking the update query to return rowCount 0
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rowCount: 0 }) // Mock UPDATE with no rows affected
        .mockResolvedValueOnce(undefined); // Mock ROLLBACK

      await expect(
        documentDAO.updateDocument(
          1,
          'title',
          'desc',
          'scale',
          'type',
          'language',
          'pages',
          '2024',
          '11',
          '18',
          [],
          1,
        ),
      ).rejects.toThrow(DocumentNotFoundError);

      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE documents/),
        expect.any(Array),
      );
      expect(db.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('should rollback transaction on error', async () => {
      // Mocking an error during the update query
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockRejectedValueOnce(new Error('DB Error')) // Mock UPDATE with error
        .mockResolvedValueOnce(undefined); // Mock ROLLBACK

      await expect(
        documentDAO.updateDocument(
          1,
          'title',
          'desc',
          'scale',
          'type',
          'language',
          'pages',
          '2024',
          '11',
          '18',
          [],
          1,
        ),
      ).rejects.toThrow('DB Error');

      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('should insert all stakeholders for the document', async () => {
      // Mocking the successful transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rowCount: 1 }) // Mock UPDATE
        .mockResolvedValueOnce(undefined) // Mock DELETE stakeholders
        .mockResolvedValueOnce(undefined) // Mock INSERT first stakeholder
        .mockResolvedValueOnce(undefined) // Mock INSERT second stakeholder
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      const result = await documentDAO.updateDocument(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        '2024',
        '11',
        '18',
        ['Stakeholder1', 'Stakeholder2'],
        1,
      );

      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO stakeholders_docs/),
        [1, 'Stakeholder1'],
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO stakeholders_docs/),
        [1, 'Stakeholder2'],
      );
    });

    test('should throw an error when db.query fails', async () => {
      // Mock a failing db.query
      jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        documentDAO.updateDocument(
          1,
          'title',
          'desc',
          'scale',
          'type',
          'language',
          'pages',
          '2024',
          '11',
          '18',
          [],
          1,
        ),
      ).rejects.toThrow('DB Error');
    });

    test('should correctly update only the description field', async () => {
      // Mocking the db.query function to simulate transaction flow
      const queryMock = jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rowCount: 1 }) // Mock UPDATE
        .mockResolvedValueOnce(undefined) // Mock DELETE stakeholders
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Call the method with a specific description change
      const newDescription = 'Updated Description';
      const result = await documentDAO.updateDocument(
        1, // id
        'Existing Title', // title (no change)
        newDescription, // desc (updated)
        'Existing Scale', // scale (no change)
        'Existing Type', // type (no change)
        'Existing Language', // language (no change)
        'Existing Pages', // pages (no change)
        '2024', // issuance_year (no change)
        '11', // issuance_month (no change)
        '18', // issuance_day (no change)
        ['Stakeholder1'], // stakeholders
        2, // id_area (no change)
      );

      expect(result).toBe(true);
      expect(queryMock).toHaveBeenCalledWith('BEGIN');
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE documents/),
        expect.arrayContaining([
          'Existing Title', // Unchanged title
          newDescription, // Updated description
          'Existing Scale', // Unchanged scale
          'Existing Type', // Unchanged type
          'Existing Language', // Unchanged language
          'Existing Pages', // Unchanged pages
          '2024', // Unchanged issuance_year
          '11', // Unchanged issuance_month
          '18', // Unchanged issuance_day
          2, // Unchanged id_area
          1, // id
        ]),
      );
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/DELETE FROM stakeholders_docs/),
        [1],
      );
      expect(queryMock).toHaveBeenCalledWith('COMMIT');
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
