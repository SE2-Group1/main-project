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
import AreaDAO from '../../../src/dao/areaDAO';
import DocumentDAO from '../../../src/dao/documentDAO';
import LinkDAO from '../../../src/dao/linkDAO';
import ScaleDAO from '../../../src/dao/scaleDAO';
import StakeholderDAO from '../../../src/dao/stakeholderDAO';
import TypeDAO from '../../../src/dao/typeDAO';
import db from '../../../src/db/db';
import {
  DocumentAreaNotFoundError,
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
  issuance_year: 'testYear',
  issuance_month: 'testMonth',
  issuance_day: 'testDay',
  id_area: 1,
  stakeholder: ['stakeholder'],
  links: [new Link('2', 2, 'linkType')],
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

  describe('DocumentDAO - addResource', () => {
    let documentDAO: DocumentDAO;

    beforeEach(() => {
      documentDAO = new DocumentDAO();
      jest.resetAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should successfully add a resource and return true', async () => {
      // Arrange
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ resource_id: 1 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Act
      const result = await documentDAO.addResource(
        'name',
        'hash',
        'path',
        1, // document ID
        5,
      );

      // Assert
      expect(result).toBe(true);
      expect(db.query).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/INSERT INTO resources/),
        expect.arrayContaining([
          'name',
          'hash',
          'path',
          1, // document ID
          5,
        ]),
      );
      expect(db.query).toHaveBeenNthCalledWith(3, 'COMMIT');
    });

    test('should throw an error for invalid input', async () => {
      // Arrange
      jest
        .spyOn(db, 'query')
        .mockRejectedValueOnce(new Error('Validation Error'));

      // Act & Assert
      await expect(
        documentDAO.addResource(
          '0', // Invalid document ID
          'resourceName',
          'resourceDescription',
          3,
          2024,
        ),
      ).rejects.toThrow('Validation Error');
    });

    test('should rollback the transaction on error', async () => {
      // Arrange
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockRejectedValueOnce(new Error('DB Error')) // Mock INSERT failure
        .mockResolvedValueOnce(undefined); // Mock ROLLBACK

      // Act & Assert
      await expect(
        documentDAO.addResource(
          '1',
          'resourceName',
          'resourceDescription',
          3,
          2024,
        ),
      ).rejects.toThrow('DB Error');

      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('It should throw an error while adding the resource', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rowCount: 0 }); // Mock BEGIN

      await expect(
        documentDAO.addResource(
          '1',
          'resourceName',
          'resourceDescription',
          2024,
          1,
        ),
      ).rejects.toThrowError('Error inserting resource');
    });
  });

  describe('DocumentDAO - checkResource', () => {
    let documentDAO: DocumentDAO;

    beforeEach(() => {
      documentDAO = new DocumentDAO();
      jest.resetAllMocks(); // Reset all mocks before each test
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });

    test('should return true if the resource exists', async () => {
      // Mocking the query method to return a valid result
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 1 });
        });

      const result = await documentDAO.checkResource('testHash', 1);
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM resources WHERE resource_hash = $1 AND docid = $2',
        ['testHash', 1],
        expect.any(Function),
      );
    });

    test('should return false if the resource does not exist', async () => {
      // Mocking the query method to return no rows
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });

      const result = await documentDAO.checkResource('testHash', 1);
      expect(result).toBe(false);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM resources WHERE resource_hash = $1 AND docid = $2',
        ['testHash', 1],
        expect.any(Function),
      );
    });

    test('should throw an error if the query fails', async () => {
      // Mocking the query method to throw an error
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'), null);
        });

      await expect(documentDAO.checkResource('testHash', 1)).rejects.toThrow(
        'Database error',
      );
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM resources WHERE resource_hash = $1 AND docid = $2',
        ['testHash', 1],
        expect.any(Function),
      );
    });

    test('should throw an error if there is an exception', async () => {
      // Mocking the query method to throw an exception
      jest.spyOn(db, 'query').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(documentDAO.checkResource('testHash', 1)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('DocumentDAO - checkAttachment', () => {
    let documentDAO: DocumentDAO;

    beforeEach(() => {
      documentDAO = new DocumentDAO();
      jest.resetAllMocks(); // Reset all mocks before each test
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });

    test('should return true if the attachment exists', async () => {
      // Mocking the query method to return a valid result
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 1 });
        });

      const result = await documentDAO.checkAttachment('testHash', 1);
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM attachments WHERE attachment_hash = $1 AND docid = $2',
        ['testHash', 1],
        expect.any(Function),
      );
    });

    test('should return false if the attachment does not exist', async () => {
      // Mocking the query method to return no rows
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });

      const result = await documentDAO.checkAttachment('testHash', 1);
      expect(result).toBe(false);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM attachments WHERE attachment_hash = $1 AND docid = $2',
        ['testHash', 1],
        expect.any(Function),
      );
    });

    test('should throw an error if the query fails', async () => {
      // Mocking the query method to throw an error
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'), null);
        });

      await expect(documentDAO.checkAttachment('testHash', 1)).rejects.toThrow(
        'Database error',
      );
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM attachments WHERE attachment_hash = $1 AND docid = $2',
        ['testHash', 1],
        expect.any(Function),
      );
    });

    test('should throw an error if there is an exception', async () => {
      // Mocking the query method to throw an exception
      jest.spyOn(db, 'query').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(documentDAO.checkAttachment('testHash', 1)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('DocumentDAO - addAttachment', () => {
    let documentDAO: DocumentDAO;

    beforeEach(() => {
      documentDAO = new DocumentDAO();
      jest.resetAllMocks(); // Reset all mocks before each test
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });

    test('should successfully add an attachment and return true', async () => {
      // Mocking the query method for transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rowCount: 1 }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      const result = await documentDAO.addAttachment(
        'testName',
        'testHash',
        'testPath',
        1,
      );

      expect(result).toBe(true);
      expect(db.query).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        'INSERT INTO attachments (docId, attachment_name, attachment_path, attachment_hash) VALUES ($1, $2, $3, $4)',
        [1, 'testName', 'testPath', 'testHash'],
      );
      expect(db.query).toHaveBeenNthCalledWith(3, 'COMMIT');
    });

    test('should throw an error if the insert fails', async () => {
      // Mocking the query method to throw an error during INSERT
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockRejectedValueOnce(new Error('Insert Error')) // Mock INSERT failure
        .mockResolvedValueOnce(undefined); // Mock ROLLBACK

      await expect(
        documentDAO.addAttachment('testName', 'testHash', 'testPath', 1),
      ).rejects.toThrow('Insert Error');

      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('should rollback the transaction on error', async () => {
      // Mocking the query method to throw an error during INSERT
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockRejectedValueOnce(new Error('DB Error')) // Mock INSERT failure
        .mockResolvedValueOnce(undefined); // Mock ROLLBACK

      await expect(
        documentDAO.addAttachment('testName', 'testHash', 'testPath', 1),
      ).rejects.toThrow('DB Error');

      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith('ROLLBACK');
    });
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
      // Mock transazioni
      const queryMock = jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 1 }] }) // Insert query
        .mockResolvedValueOnce({}); // COMMIT

      // Mock funzioni secondarie
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true);
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true);
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(false); // Stakeholder non esiste
      jest
        .spyOn(documentDAO.stakeholderDAO, 'addStakeholder')
        .mockResolvedValue(true);
      jest
        .spyOn(documentDAO, 'addStakeholderToDocument')
        .mockResolvedValue(true);

      // Chiamata al metodo
      const result = await documentDAO.addDocument(
        'test title for adding new document',
        'test Description for adding a new document',
        'Text',
        'Design',
        'IT',
        '2024',
        '10',
        '15',
        ['stakeholder1', 'stakeholder2'],
        null, // id_area inizialmente nullo
        null, // georeference nullo
        'Area1',
      );

      // Verifiche
      expect(result).toBe(1);

      // Controllo query di inserimento
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO documents/), // Controlla che sia un'INSERT
        expect.arrayContaining([
          'test title for adding new document',
          'test Description for adding a new document',
          'Text',
          'Design',
          'IT',
          '2024',
          '10',
          '15',
          null, // id_area mockato
        ]),
      );

      // Controllo sulle chiamate agli stakeholders
      expect(documentDAO.checkStakeholder).toHaveBeenCalledTimes(2); // Due stakeholders
      expect(documentDAO.stakeholderDAO.addStakeholder).toHaveBeenCalledWith(
        'stakeholder1',
      );
      expect(documentDAO.stakeholderDAO.addStakeholder).toHaveBeenCalledWith(
        'stakeholder2',
      );

      // Verifica transazioni
      expect(queryMock).toHaveBeenCalledWith('BEGIN');
      expect(queryMock).toHaveBeenCalledWith('COMMIT');
    });

    test('should handle null optional parameters', async () => {
      // Mock database query
      const queryMock = jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 2 }] }) // Mock INSERT query
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType

      const result = await documentDAO.addDocument(
        'title',
        'testDesc',
        'testScale',
        'testType',
        null,
        'testYear',
        null,
        null,
        [],
        1,
        null,
        'Area1',
      );

      // Assertions
      expect(result).toBe(2);

      // Verify db.query was called as expected
      expect(queryMock).toHaveBeenCalledWith('BEGIN');
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO documents/),
        expect.arrayContaining([
          'title',
          'testDesc',
          'testScale',
          'testType',
          null, // Language
          'testYear',
          null, // Month
          null, // Day
          1, // id_area
        ]),
      );
      expect(queryMock).toHaveBeenCalledWith('COMMIT');

      // Verify dependent methods were called
      expect(documentDAO.checkScale).toHaveBeenCalledWith('testScale');
      expect(documentDAO.checkDocumentType).toHaveBeenCalledWith('testType');
    });

    test('should rollback transaction on error', async () => {
      // Mocking a transaction flow with an error
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockRejectedValueOnce(new Error('DB Error')) // Mock INSERT with error
        .mockResolvedValueOnce(undefined); // Mock ROLLBACK

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType

      await expect(
        documentDAO.addDocument(
          'title',
          'testDesc',
          'testScale',
          'testType',
          'testLanguage',
          'testYear',
          'testMonth',
          'testDay',
          [],
          1,
          null,
          'Area1',
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

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(false); // Mock checkStakeholder (non esiste, lo aggiunge)
      jest
        .spyOn(documentDAO, 'addStakeholderToDocument')
        .mockResolvedValue(true); // Mock addStakeholderToDocument
      // Mock addStakeholder
      jest
        .spyOn(documentDAO.stakeholderDAO, 'addStakeholder')
        .mockResolvedValue(true);

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
        'testYear',
        'testMonth',
        'testDay',
        ['Stakeholder1', 'Stakeholder2'],
        1,
        null,
        'Area1',
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
          'testYear',
          'testMonth',
          'testDay',
          [],
          1,
          null,
          'Area1',
        ),
      ).rejects.toBe('error');
    });
  });

  describe('DocumentDAO - updateDocument', () => {
    let documentDAO: DocumentDAO;
    let scaleDAO: ScaleDAO;
    let typeDAO: TypeDAO;
    let stakeholderDAO: StakeholderDAO;
    let areaDAO: AreaDAO;
    beforeEach(() => {
      documentDAO = new DocumentDAO();
      scaleDAO = new ScaleDAO();
      typeDAO = new TypeDAO();
      stakeholderDAO = new StakeholderDAO();
      areaDAO = new AreaDAO();
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

      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder

      // Call the method
      const result = await documentDAO.updateDocument(
        1,
        'Updated Title',
        'Updated Description',
        'Updated Scale',
        'Updated Type',
        'Updated Language',
        '2024',
        '11',
        '18',
        ['Stakeholder1', 'Stakeholder2'],
        2,
        null,
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
          '2024',
          '11',
          '18',
          2,
        ]),
      );
      expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/DELETE/), [
        1,
      ]);
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
      // Mocking db.query
      jest.spyOn(db, 'query').mockImplementation((query, values) => {
        if (query.includes('BEGIN')) return Promise.resolve(); // Mock BEGIN
        if (query.includes('UPDATE documents'))
          return Promise.resolve({ rowCount: 0 }); // Mock UPDATE
        if (query.includes('DELETE FROM stakeholders_docs'))
          return Promise.resolve(); // Mock DELETE
        if (query.includes('INSERT INTO stakeholders_docs'))
          return Promise.resolve(); // Mock INSERT
        if (query.includes('COMMIT')) return Promise.resolve(); // Mock COMMIT
        if (query.includes('ROLLBACK')) return Promise.resolve(); // Mock ROLLBACK
        return Promise.resolve();
      });

      // Mocking helper functions
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true);
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true);
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true);
      jest.spyOn(scaleDAO, 'addScale').mockResolvedValue(true);
      jest.spyOn(typeDAO, 'addType').mockResolvedValue(true);
      jest.spyOn(stakeholderDAO, 'addStakeholder').mockResolvedValue(true);
      jest.spyOn(areaDAO, 'addArea').mockResolvedValue(1);

      // Assertion
      await expect(
        documentDAO.updateDocument(
          1,
          'title',
          'desc',
          'scale',
          'type',
          'language',
          '2024',
          '11',
          '18',
          [],
          1,
          null,
        ),
      ).rejects.toThrow(DocumentNotFoundError);

      // Verifying db.query calls
      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE documents/),
        expect.any(Array),
      );
      expect(db.query).toHaveBeenCalledWith(expect.stringMatching(/ROLLBACK/));
    });
    test('should rollback transaction on error', async () => {
      jest.setTimeout(10000);

      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('DB Error'))
        .mockResolvedValueOnce(undefined);

      jest.spyOn(documentDAO, 'checkScale').mockResolvedValueOnce(true);
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValueOnce(true);
      jest
        .spyOn(documentDAO.stakeholderDAO, 'addStakeholder')
        .mockResolvedValueOnce(true);

      await expect(
        documentDAO.updateDocument(
          1,
          'title',
          'desc',
          'scale',
          'type',
          'language',
          '2024',
          '11',
          '18',
          [],
          1,
          null,
        ),
      ).rejects.toThrow('DB Error');

      expect(db.query).toHaveBeenCalledWith('BEGIN');

      expect(db.query).toHaveBeenCalledWith('ROLLBACK');

      expect(db.query).not.toHaveBeenCalledWith('COMMIT');
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

      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder

      const result = await documentDAO.updateDocument(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        '2024',
        '11',
        '18',
        ['Stakeholder1', 'Stakeholder2'],
        1,
        null,
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
          '2024',
          '11',
          '18',
          [],
          1,
          null,
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

      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder

      // Call the method with a specific description change
      const newDescription = 'Updated Description';
      const result = await documentDAO.updateDocument(
        1, // id
        'Existing Title', // title (no change)
        newDescription, // desc (updated)
        'Existing Scale', // scale (no change)
        'Existing Type', // type (no change)
        'Existing Language', // language (no change)
        '2024', // issuance_year (no change)
        '11', // issuance_month (no change)
        '18', // issuance_day (no change)
        ['Stakeholder1'], // stakeholders
        2, // id_area (no change)
        null,
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
          '2024', // Unchanged issuance_year
          '11', // Unchanged issuance_month
          '18', // Unchanged issuance_day
          2, // Unchanged id_area
          1, // id
        ]),
      );
      expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/DELETE/), [
        1,
      ]);
      expect(queryMock).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('getDocumentById', () => {
    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(documentDAO.getDocumentById(1)).rejects.toThrow(
        'Database error',
      );
    });

    test('It should return the document', async () => {
      // Mock getLinks method
      const mockGetLinks = jest
        .spyOn(linkDAO, 'getLinks')
        .mockImplementation(async (docId: number) => {
          return [new Link('2', 2, 'linkType')];
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
                language_name: 'testLanguage',
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
          'testYear',
          'testMonth',
          'testDay',
          1,
          ['stakeholder1'],
          [new Link('2', 2, 'linkType')],
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
          return [new Link('2', 2, 'linkType')];
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
          callback(null, { rows: [{ language_id: 'language' }] });
        });
      const result = await documentDAO.checkLanguage('language');
      expect(result).toBe(true);
    });

    test('It should throw a DocumentLanguageNotFoundError', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
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
      const mockResult = { rowCount: 0 };
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
      const mockResult = { rowCount: 0 };
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

describe('getCoordinates', () => {
  test('It should return the document info and their coordinates for multipolygon type', async () => {
    const documentDAO = new DocumentDAO();
    const mockDBQuery = jest
      .spyOn(db, 'query')
      .mockImplementation((sql, callback: any) => {
        callback(null, {
          rows: [
            {
              id_file: 1,
              title: 'testTitle',
              type: 'testType',
              id_area: 1,
              stakeholders: [],
              coordinates: JSON.stringify({
                type: 'MultiPolygon',
                coordinates: [
                  [
                    [
                      [12.4924, 41.8902],
                      [12.4934, 41.8912],
                      [12.4944, 41.8922],
                      [12.4924, 41.8902],
                    ],
                  ],
                  [
                    [
                      [12.4924, 41.8902],
                      [12.4934, 41.8912],
                      [12.4944, 41.8922],
                      [12.4924, 41.8902],
                    ],
                  ],
                ],
              }),
            },
          ],
        });
      });
    const result = await documentDAO.getCoordinates();
    expect(result).toEqual([
      {
        docId: 1,
        title: 'testTitle',
        type: 'testType',
        id_area: 1,
        stakeholders: [],
        coordinates: [
          { lon: 12.4924, lat: 41.8902 },
          { lon: 12.4934, lat: 41.8912 },
          { lon: 12.4944, lat: 41.8922 },
          { lon: 12.4924, lat: 41.8902 },

          { lon: 12.4924, lat: 41.8902 },
          { lon: 12.4934, lat: 41.8912 },
          { lon: 12.4944, lat: 41.8922 },
          { lon: 12.4924, lat: 41.8902 },
        ],
      },
    ]);
    mockDBQuery.mockRestore();
  });

  test('It should throw an error if the query fails', async () => {
    const documentDAO = new DocumentDAO();
    jest.spyOn(db, 'query').mockImplementation((sql, callback: any) => {
      callback('error');
    });
    try {
      await documentDAO.getCoordinates();
    } catch (error) {
      expect(error).toBe('error');
    }
  });

  describe('getGeoreferenceById', () => {
    test('It should return the georeference and the description of a document for polygon type', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              {
                id_file: 1,
                title: 'testDocument',
                desc: 'testDesc',
                scale_name: 'testScale',
                issuance_year: 'testYear',
                issuance_month: 'testMonth',
                issuance_day: 'testDay',
                type_name: 'testType',
                language_name: 'testLanguage',
                area_geojson: JSON.stringify({
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
                stakeholders: ['stakeholder1', 'stakeholder2'],
                links: [
                  { docId: 2, linkType: 'testLink' },
                  { docId: 3, linkType: 'testLink' },
                ],
              },
            ],
          });
        });
      const result = await documentDAO.getGeoreferenceById(1);
      expect(result).toEqual({
        docId: 1,
        title: 'testDocument',
        description: 'testDesc',
        scale: 'testScale',
        issuanceDate: {
          year: 'testYear',
          month: 'testMonth',
          day: 'testDay',
        },
        type: 'testType',
        language: 'testLanguage',
        area: [
          { lon: 12.4924, lat: 41.8902 },
          { lon: 12.4934, lat: 41.8912 },
          { lon: 12.4944, lat: 41.8922 },
          { lon: 12.4924, lat: 41.8902 },
        ],
        stakeholders: ['stakeholder1', 'stakeholder2'],
        links: [
          { docId: 2, linkType: 'testLink' },
          { docId: 3, linkType: 'testLink' },
        ],
      });
      mockDBQuery.mockRestore();
    });

    test('It should return the georeference and the description of a document for multipolygon type', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              {
                id_file: 1,
                title: 'testDocument',
                desc: 'testDesc',
                scale_name: 'testScale',
                issuance_year: 'testYear',
                issuance_month: 'testMonth',
                issuance_day: 'testDay',
                type_name: 'testType',
                language_name: 'testLanguage',
                area_geojson: JSON.stringify({
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [12.4924, 41.8902],
                        [12.4934, 41.8912],
                        [12.4944, 41.8922],
                        [12.4924, 41.8902],
                      ],
                    ],
                    [
                      [
                        [12.4924, 41.8902],
                        [12.4934, 41.8912],
                        [12.4944, 41.8922],
                        [12.4924, 41.8902],
                      ],
                    ],
                  ],
                }),
                stakeholders: ['stakeholder1', 'stakeholder2'],
                links: [
                  { docId: 2, linkType: 'testLink' },
                  { docId: 3, linkType: 'testLink' },
                ],
              },
            ],
          });
        });
      const result = await documentDAO.getGeoreferenceById(1);
      expect(result).toEqual({
        docId: 1,
        title: 'testDocument',
        description: 'testDesc',
        scale: 'testScale',
        issuanceDate: {
          year: 'testYear',
          month: 'testMonth',
          day: 'testDay',
        },
        type: 'testType',
        language: 'testLanguage',
        area: [
          [
            { lon: 12.4924, lat: 41.8902 },
            { lon: 12.4934, lat: 41.8912 },
            { lon: 12.4944, lat: 41.8922 },
            { lon: 12.4924, lat: 41.8902 },
          ],
          [
            { lon: 12.4924, lat: 41.8902 },
            { lon: 12.4934, lat: 41.8912 },
            { lon: 12.4944, lat: 41.8922 },
            { lon: 12.4924, lat: 41.8902 },
          ],
        ],
        stakeholders: ['stakeholder1', 'stakeholder2'],
        links: [
          { docId: 2, linkType: 'testLink' },
          { docId: 3, linkType: 'testLink' },
        ],
      });
      mockDBQuery.mockRestore();
    });

    test('It should return the georeference and the description of a document', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              {
                id_file: 1,
                title: 'testDocument',
                desc: 'testDesc',
                scale_name: 'testScale',
                issuance_year: 'testYear',
                issuance_month: 'testMonth',
                issuance_day: 'testDay',
                type_name: 'testType',
                language_name: 'testLanguage',
                area_geojson: JSON.stringify({
                  type: 'Point',
                  coordinates: [12.4924, 41.8902],
                }),
                stakeholders: ['stakeholder1', 'stakeholder2'],
                links: [
                  { docId: 2, linkType: 'testLink' },
                  { docId: 3, linkType: 'testLink' },
                ],
              },
            ],
          });
        });
      const result = await documentDAO.getGeoreferenceById(1);
      expect(result).toEqual({
        docId: 1,
        title: 'testDocument',
        description: 'testDesc',
        scale: 'testScale',
        issuanceDate: {
          year: 'testYear',
          month: 'testMonth',
          day: 'testDay',
        },
        type: 'testType',
        language: 'testLanguage',
        area: [{ lon: 12.4924, lat: 41.8902 }],
        stakeholders: ['stakeholder1', 'stakeholder2'],
        links: [
          { docId: 2, linkType: 'testLink' },
          { docId: 3, linkType: 'testLink' },
        ],
      });
      mockDBQuery.mockRestore();
    });
    test('It should throw a DocumentNotFoundError if the document does not exist', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });
      try {
        await documentDAO.getGeoreferenceById(1);
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentNotFoundError);
      }
    });
    test('It should throw an error if the query fails', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.getGeoreferenceById(1);
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('checkArea', () => {
    test('It should return true if the area exists', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [{ id_area: 1 }] });
        });
      const result = await documentDAO.checkArea(1);
      expect(result).toBe(true);
    });
    test('It should throw an error if the query fails', async () => {
      const documentDAO = new DocumentDAO();
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(mockError, null);
        },
      );

      await expect(documentDAO.checkArea(1)).rejects.toThrow('Database error');
    });
    test('It should throw a DocumentAreaNotFoundError if the area does not exist', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [] });
        });
      try {
        await documentDAO.checkArea(1);
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentAreaNotFoundError);
      }
    });
  });

  describe('getCoordinatesOfArea', () => {
    test('It should return the coordinates of the area', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              {
                area_geojson: JSON.stringify({
                  type: 'Point',
                  coordinates: [12.4924, 41.8902],
                }),
              },
            ],
          });
        });
      const result = await documentDAO.getCoordinatesOfArea(1);
      expect(result).toEqual([{ lon: 12.4924, lat: 41.8902 }]);
      mockDBQuery.mockRestore();
    });
    test('It should throw an error if the query fails', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.getCoordinatesOfArea(1);
      } catch (error) {
        expect(error).toBe('error');
      }
    });
    test('It should throw a DocumentAreaNotFoundError if the area does not exist', async () => {
      const documentDAO = new DocumentDAO();
      (db.query as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(documentDAO.getCoordinatesOfArea(1)).rejects.toThrow(
        'Database error',
      );
    });
    test('It should return the coordinates of the area for polygon type', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              {
                area_geojson: JSON.stringify({
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
          });
        });
      const result = await documentDAO.getCoordinatesOfArea(1);
      expect(result).toEqual([
        { lon: 12.4924, lat: 41.8902 },
        { lon: 12.4934, lat: 41.8912 },
        { lon: 12.4944, lat: 41.8922 },
        { lon: 12.4924, lat: 41.8902 },
      ]);
      mockDBQuery.mockRestore();
    });
    test('It should return the coordinates of the area for multipolygon type', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              {
                area_geojson: JSON.stringify({
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [12.4924, 41.8902],
                        [12.4934, 41.8912],
                        [12.4944, 41.8922],
                        [12.4924, 41.8902],
                      ],
                    ],
                    [
                      [
                        [12.4924, 41.8902],
                        [12.4934, 41.8912],
                        [12.4944, 41.8922],
                        [12.4924, 41.8902],
                      ],
                    ],
                  ],
                }),
              },
            ],
          });
        });
      const result = await documentDAO.getCoordinatesOfArea(1);
      expect(result).toEqual([
        [
          { lon: 12.4924, lat: 41.8902 },
          { lon: 12.4934, lat: 41.8912 },
          { lon: 12.4944, lat: 41.8922 },
          { lon: 12.4924, lat: 41.8902 },
        ],
        [
          { lon: 12.4924, lat: 41.8902 },
          { lon: 12.4934, lat: 41.8912 },
          { lon: 12.4944, lat: 41.8922 },
          { lon: 12.4924, lat: 41.8902 },
        ],
      ]);
      mockDBQuery.mockRestore();
    });
    test('It should throw an error for unexpected type', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              {
                area_geojson: JSON.stringify({
                  type: 'LineString',
                  coordinates: [
                    [12.4924, 41.8902],
                    [12.4934, 41.8912],
                    [12.4944, 41.8922],
                    [12.4924, 41.8902],
                  ],
                }),
              },
            ],
          });
        });
      try {
        await documentDAO.getCoordinatesOfArea(1);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
      mockDBQuery.mockRestore();
    });
    test('It should throw a DocumentAreaNotFoundError if the area does not exist', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });
      try {
        await documentDAO.getCoordinatesOfArea(1);
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentAreaNotFoundError);
      }
    });
  });
  describe('updateDocArea', () => {
    test('It should return true', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });
      const result = await documentDAO.updateDocArea(1, null, 1, 'Area1');
      expect(result).toBe(true);
    });
    test('It should throw an error', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.updateDocArea(1, null, 1, 'Area1');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
    test('when georeference is not null and area is null', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [{ id_area: 1 }] });
        });
      const result = await documentDAO.updateDocArea(
        1,
        [{ lon: 12.4924, lat: 41.8902 }],
        null,
        'Area1',
      );
      expect(result).toBe(true);
    });
    test('test should fail with and go in a catch error', async () => {
      const documentDAO = new DocumentDAO();
      (db.query as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(
        documentDAO.updateDocArea(1, null, 1, 'Area1'),
      ).rejects.toThrow('Database error');
    });
  });
  describe('updateDocumentDesc', () => {
    test('it should return a catch error', async () => {
      const documentDAO = new DocumentDAO();
      const mockError = new Error('Database error');
      (db.query as jest.Mock).mockImplementation(
        (sql, params, callback: any) => {
          callback(mockError, null);
        },
      );

      await expect(
        documentDAO.updateDocumentDesc(1, 'Test Desc'),
      ).rejects.toThrow('Database error');
    });

    test('It should return true', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 1 });
        });
      const result = await documentDAO.updateDocumentDesc(1, 'testDesc');
      expect(result).toBe(true);
    });
    test('It should throw a documentnotfounderror', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });
      try {
        await documentDAO.updateDocumentDesc(1, 'testDesc');
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentNotFoundError);
      }
    });
  });

  describe('getYears', () => {
    test('It should return all years from documents', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, callback: any) => {
          callback(null, {
            rows: [{ issuance_year: '2020' }, { issuance_year: '2021' }],
          });
        });
      const result = await documentDAO.getYears();
      expect(result).toEqual([2020, 2021]);
      mockDBQuery.mockRestore();
    });

    test('getYears should reject an error', async () => {
      const documentDAO = new DocumentDAO();
      jest.spyOn(db, 'query').mockImplementation((sql, callback: any) => {
        callback('error');
      });
      try {
        await documentDAO.getYears();
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('getCustomPosition', () => {
    test('It should return position for a document', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rowCount: 1,
            rows: [{ x: 100, y: 200 }],
          });
        });
      const result = await documentDAO.getCustomPosition(1);
      expect(result).toEqual({ x: 100, y: 200 });
      mockDBQuery.mockRestore();
    });

    test('It should reject an error', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error', null);
        });
      try {
        await documentDAO.getCustomPosition(1);
      } catch (error) {
        expect(error).toBe('error');
      }
    });

    test('It should resolve null if the document does not exist', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rowCount: 0,
          });
        });
      const result = await documentDAO.getCustomPosition(1);
      expect(result).toBeNull();
      mockDBQuery.mockRestore();
    });
  });

  describe('getDocumentsForDiagram', () => {
    test('It should return all documents for the diagram', async () => {
      const documentDAO = new DocumentDAO();
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql: string, callback?: Function) => {
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
            callback && callback(null);
          } else {
            callback &&
              callback(null, {
                rows: [
                  {
                    id_file: 1,
                    title: 'testTitle1',
                    scale: '1:100',
                    type: 'testType1',
                    issuance_year: 2023,
                    stakeholder: ['stakeholder'],
                    issuance_month: '04',
                    issuance_day: '15',
                  },
                  {
                    id_file: 2,
                    title: 'testTitle2',
                    scale: '1:200',
                    type: 'testType2',
                    stakeholder: ['stakeholder'],
                    issuance_year: 2022,
                    issuance_month: '01',
                    issuance_day: '25',
                  },
                ],
              });
          }
        });

      jest
        .spyOn(documentDAO, 'getCustomPosition')
        .mockResolvedValue({ x: 100, y: 200 });

      const result = await documentDAO.getDocumentsForDiagram();

      expect(result).toEqual({
        '2023-1:100': [
          {
            id: 1,
            title: 'testTitle1',
            date: new Date(2023, 4, 15),
            type: 'testType1',
            stakeholders: [['stakeholder']],
            custom_position: { x: 100, y: 200 },
          },
        ],
        '2022-1:200': [
          {
            id: 2,
            title: 'testTitle2',
            date: new Date(2022, 1, 25),
            type: 'testType2',
            stakeholders: [['stakeholder']],
            custom_position: { x: 100, y: 200 },
          },
        ],
      });
      mockDBQuery.mockRestore();
    });
    test('It should return a DocumentNotFound error if there are no documents and call ROLLBACK', async () => {
      const documentDAO = new DocumentDAO();

      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql: string, callback?: Function) => {
          if (sql === 'BEGIN' || sql === 'COMMIT') {
            callback && callback(null);
          } else if (sql === 'ROLLBACK') {
            expect(sql).toBe('ROLLBACK');
            callback && callback(null);
          } else {
            callback &&
              callback(null, {
                rowCount: 0,
                rows: [],
              });
          }
        });

      await expect(documentDAO.getDocumentsForDiagram()).rejects.toThrow(
        DocumentNotFoundError,
      );
      mockDBQuery.mockRestore();
    });
    test('It should reject an error and call ROLLBACK', async () => {
      const documentDAO = new DocumentDAO();

      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql: string, callback?: Function) => {
          if (sql === 'BEGIN') {
            callback && callback(null);
          } else if (sql === 'ROLLBACK') {
            expect(sql).toBe('ROLLBACK');
            callback && callback(null);
          } else {
            callback && callback('error', null);
          }
        });

      await expect(documentDAO.getDocumentsForDiagram()).rejects.toBe('error');
      mockDBQuery.mockRestore();
    });
  });

  describe('updateDiagramPositions', () => {
    test('It should return true', async () => {
      const documentDAO = new DocumentDAO();
      jest.spyOn(db, 'query').mockResolvedValue({ rowCount: 1 });
      const result = await documentDAO.updateDiagramPositions([
        { id: 1, x: 100, y: 200 },
      ]);
      expect(result).toBe(true);
    });
    test('It should rejects an error', async () => {
      const documentDAO = new DocumentDAO();
      jest.spyOn(db, 'query').mockRejectedValue('Database query failed');
      try {
        await documentDAO.updateDiagramPositions([{ id: 1, x: 100, y: 200 }]);
      } catch (error) {
        expect(error).toBe('Database query failed');
      }
    });
  });

  describe('getLinksForDiagram', () => {
    test('It should return all links for the diagram', async () => {
      const documentDAO = new DocumentDAO();

      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementationOnce((sql: string, callback: Function) => {
          callback(null, {
            rowCount: 2,
            rows: [
              { doc1: 1, doc2: 2, link_type: 'testLink1' },
              { doc1: 2, doc2: 3, link_type: 'testLink2' },
            ],
          });
        });

      const result = await documentDAO.getLinksForDiagram();

      expect(result).toEqual([
        { source: '1', target: '2', type: 'testLink1' },
        { source: '2', target: '3', type: 'testLink2' },
      ]);

      mockDBQuery.mockRestore();
    });
    test('It should reject an error', async () => {
      const documentDAO = new DocumentDAO();

      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementationOnce((sql: string, callback: Function) => {
          callback('error', null);
        });

      try {
        await documentDAO.getLinksForDiagram();
      } catch (error) {
        expect(error).toBe('error');
      }

      mockDBQuery.mockRestore();
    });
  });
  describe('checkResource', () => {
    test('It should return true', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [{ id_file: 1 }] });
        });
      const result = await documentDAO.checkResource('hash', 1);
      expect(result).toBe(true);
    });
    test('It should throw an error', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.checkResource('hash', 1);
      } catch (error) {
        expect(error).toBe('error');
      }
    });
    test('It should throw a false', async () => {
      const documentDAO = new DocumentDAO();
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 }); // Simulate no rows found
        });

      const result = await documentDAO.checkResource('hash', 1);
      expect(result).toBe(false);
    });
    test('It should throw a catch error', async () => {
      const documentDAO = new DocumentDAO();
      (db.query as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(documentDAO.checkResource('hash', 1)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
