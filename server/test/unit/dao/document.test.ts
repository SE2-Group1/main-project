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

    test('should add a scale', async () => {
      // Mocking a successful transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 3 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(false); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder (non esiste, lo aggiunge)

      let addScale = jest
        .spyOn(documentDAO.scaleDAO, 'addScale')
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
      expect(addScale).toHaveBeenCalledWith('testScale');
      expect(addScale).toHaveBeenCalledTimes(1);

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

    test('should add a type', async () => {
      // Mocking a successful transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 3 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(false); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder (non esiste, lo aggiunge)

      let addType = jest
        .spyOn(documentDAO.typeDAO, 'addType')
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
      expect(addType).toHaveBeenCalledWith('testType');
      expect(addType).toHaveBeenCalledTimes(1);

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

    test('area is not defined and georeference is defined', async () => {
      // Mocking a successful transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 3 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder (non esiste, lo aggiunge)

      const addArea = jest
        .spyOn(documentDAO.areaDAO, 'addArea')
        .mockResolvedValue(1);

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
        null,
        [
          { lon: 7.686856, lat: 45.070339 },
          { lon: 7.687, lat: 45.071 },
        ],
        'Area1',
      );

      // Assertions

      expect(addArea).toHaveBeenCalledWith(
        [
          [7.686856, 45.070339],
          [7.687, 45.071],
        ],
        'Area1',
      );

      expect(addArea).toHaveBeenCalledTimes(1);
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
          '2024',
          '11',
          '18',
          [],
          1,
          null,
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
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringMatching(/DELETE FROM stakeholders_docs/),
        [1],
      );
      expect(queryMock).toHaveBeenCalledWith('COMMIT');
    });

    test('area is not defined and georeference is defined', async () => {
      // Mocking a successful transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 3 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder (non esiste, lo aggiunge)

      const addArea = jest
        .spyOn(documentDAO.areaDAO, 'addArea')
        .mockResolvedValue(1);

      await documentDAO.updateDocument(
        1,
        'title',
        'testDesc',
        'testScale',
        'testType',
        'testLanguage',
        'testYear',
        'testMonth',
        'testDay',
        ['Stakeholder1', 'Stakeholder2'],
        null,
        [
          { lon: 7.686856, lat: 45.070339 },
          { lon: 7.687, lat: 45.071 },
        ],
      );

      // Assertions

      expect(addArea).toHaveBeenCalledWith(
        [
          [7.686856, 45.070339],
          [7.687, 45.071],
        ],
        null,
      );

      expect(addArea).toHaveBeenCalledTimes(1);
    });

    test('should add a scale', async () => {
      // Mocking a successful transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 3 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(false); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(true); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder (non esiste, lo aggiunge)

      let addScale = jest
        .spyOn(documentDAO.scaleDAO, 'addScale')
        .mockResolvedValue(true);

      await documentDAO.updateDocument(
        1,
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
      );

      // Assertions
      expect(addScale).toHaveBeenCalledWith('testScale');
      expect(addScale).toHaveBeenCalledTimes(1);
    });

    test('should add a type', async () => {
      // Mocking a successful transaction flow
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce(undefined) // Mock BEGIN
        .mockResolvedValueOnce({ rows: [{ id_file: 3 }] }) // Mock INSERT
        .mockResolvedValueOnce(undefined); // Mock COMMIT

      // Mock dependent methods
      jest.spyOn(documentDAO, 'checkScale').mockResolvedValue(true); // Mock checkScale
      jest.spyOn(documentDAO, 'checkDocumentType').mockResolvedValue(false); // Mock checkDocumentType
      jest.spyOn(documentDAO, 'checkStakeholder').mockResolvedValue(true); // Mock checkStakeholder (non esiste, lo aggiunge)

      let addType = jest
        .spyOn(documentDAO.typeDAO, 'addType')
        .mockResolvedValue(true);

      await documentDAO.updateDocument(
        1,
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
      );

      // Assertions
      expect(addType).toHaveBeenCalledWith('testType');
      expect(addType).toHaveBeenCalledTimes(1);
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
    test('It should return 404', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          // Simulating an empty result (no document found)
          callback(null, undefined);
        });

      // Test the getDocumentById method
      await expect(documentDAO.getDocumentById(1)).rejects.toBeInstanceOf(
        DocumentNotFoundError,
      );
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

    test('should return documents without stakeholders', async () => {
      jest.spyOn(db, 'query').mockImplementation((sql, callback: any) => {
        callback(null, {
          rows: [
            {
              id_file: 1,
              title: 'Document 1',
              desc: 'Description 1',
              scale: 'Scale 1',
              type: 'Type 1',
              language: 'English',
              issuance_year: '2024',
              issuance_month: '12',
              issuance_day: '18',
              id_area: 1,
              stakeholder: null,
            },
            {
              id_file: 2,
              title: 'Document 2',
              desc: 'Description 2',
              scale: 'Scale 2',
              type: 'Type 2',
              language: 'Spanish',
              issuance_year: '2023',
              issuance_month: '11',
              issuance_day: '15',
              id_area: 2,
              stakeholder: null,
            },
          ],
        });
      });

      jest
        .spyOn(linkDAO, 'getLinks')
        .mockImplementation(async (docId: number) => {
          return [new Link('2', 2, 'linkType')];
        });

      const documents = await documentDAO.getAllDocuments();

      expect(documents).toHaveLength(2);

      const document1 = documents.find(doc => doc.id_file === 1);
      expect(document1?.stakeholder).toEqual([]); // Nessuno stakeholder
      expect(document1?.links).toHaveLength(1);

      const document2 = documents.find(doc => doc.id_file === 2);
      expect(document2?.stakeholder).toEqual([]); // Nessuno stakeholder
      expect(document2?.links).toHaveLength(1);
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

    test('It should throw 404', async () => {
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rows: [] }); // Result with no rows
        });

      try {
        await documentDAO.deleteDocument(1);
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentNotFoundError); // Verifica che l'errore sia un DocumentNotFoundError
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

    test('It should throw false due to stakeholder not found', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, { rowCount: 0 });
        });
      const result = await documentDAO.checkStakeholder('stakeholder');

      expect(result).toBe(false);
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
        coordinates: [
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
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await documentDAO.checkArea(1);
      } catch (error) {
        expect(error).toBe('error');
      }
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
});

describe('getFilteredDocuments', () => {
  let documentDAO: DocumentDAO;

  beforeEach(() => {
    documentDAO = new DocumentDAO();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return documents based on search criteria (Title)', async () => {
    const searchCriteria = 'Title';
    const searchTerm = 'Document 1';
    const filters = {};

    // Mock db.query
    jest.spyOn(db, 'query').mockImplementation((sql, params, callback: any) => {
      callback(null, {
        rows: [
          {
            docid: 1,
            title: 'Document 1',
            type: 'type1',
            coordinates:
              '{"type": "Point", "coordinates": [7.686856, 45.070339]}',
            id_area: 1,
            issuance_year: '2021',
            issuance_month: '05',
            issuance_day: '15',
          },
        ],
      });
    });

    // Call the function
    const result = await documentDAO.getFilteredDocuments(
      searchCriteria,
      searchTerm,
      filters,
    );

    // Assertions
    expect(result).toEqual([
      {
        docId: 1,
        title: 'Document 1',
        type: 'type1',
        coordinates: [{ lon: 7.686856, lat: 45.070339 }],
        id_area: 1,
        issuanceYear: '2021',
        issuanceMonth: '05',
        issuanceDay: '15',
      },
    ]);

    // Verify db.query was called correctly
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'), // Verifica che contenga "SELECT"
      expect.any(Array),
      expect.any(Function),
    );
  });
  test('should apply filters for stakeholders', async () => {
    const searchCriteria = 'Title';
    const searchTerm = 'Document 1';
    const filters = { stakeholders: ['Stakeholder1'] };

    // Mock db.query
    const dbQueryMock = jest
      .spyOn(db, 'query')
      .mockImplementation((sql, params, callback: any) => {
        callback(null, {
          rows: [
            {
              docid: 1,
              title: 'Document 1',
              type: 'type1',
              coordinates:
                '{"type": "Point", "coordinates": [7.686856, 45.070339]}',
              id_area: 1,
              issuance_year: '2021',
              issuance_month: '05',
              issuance_day: '15',
            },
          ],
        });
      });

    // Call the function
    const result = await documentDAO.getFilteredDocuments(
      searchCriteria,
      searchTerm,
      filters,
    );

    // Assertions
    expect(result).toEqual([
      {
        docId: 1,
        title: 'Document 1',
        type: 'type1',
        coordinates: [{ lon: 7.686856, lat: 45.070339 }],
        id_area: 1,
        issuanceYear: '2021',
        issuanceMonth: '05',
        issuanceDay: '15',
      },
    ]);

    // Verify the query contains the stakeholders filter
    expect(dbQueryMock).toHaveBeenCalledWith(
      expect.stringContaining('sd.stakeholder = ANY($'),
      expect.arrayContaining([['Stakeholder1']]),
    );

    // Restore mock
    dbQueryMock.mockRestore();
  });

  test('should apply filters for date range', async () => {
    const searchCriteria = 'Title';
    const searchTerm = 'Document 1';
    const filters = { startDate: ['01/01/2021'], endDate: ['12/31/2021'] };

    jest.spyOn(db, 'query').mockImplementation((sql, params, callback: any) => {
      callback(null, {
        rows: [
          {
            docid: 1,
            title: 'Document 1',
            type: 'type1',
            coordinates:
              '{"type": "Point", "coordinates": [7.686856, 45.070339]}',
            id_area: 1,
            issuance_year: '2021',
            issuance_month: '05',
            issuance_day: '15',
          },
        ],
      });
    });

    const result = await documentDAO.getFilteredDocuments(
      searchCriteria,
      searchTerm,
      filters,
    );

    expect(result).toEqual([
      {
        docId: 1,
        title: 'Document 1',
        type: 'type1',
        coordinates: [{ lon: 7.686856, lat: 45.070339 }],
        id_area: 1,
        issuanceYear: '2021',
        issuanceMonth: '05',
        issuanceDay: '15',
      },
    ]);
  });

  test('should correctly parse coordinates from GeoJSON', async () => {
    const searchCriteria = 'Title';
    const searchTerm = 'Document 1';
    const filters = {};

    jest.spyOn(db, 'query').mockImplementation((sql, params, callback: any) => {
      callback(null, {
        rows: [
          {
            docid: 1,
            title: 'Document 1',
            type: 'type1',
            coordinates:
              '{"type": "Point", "coordinates": [7.686856, 45.070339]}',
            id_area: 1,
            issuance_year: '2021',
            issuance_month: '05',
            issuance_day: '15',
          },
        ],
      });
    });

    const result = await documentDAO.getFilteredDocuments(
      searchCriteria,
      searchTerm,
      filters,
    );

    expect(result[0].coordinates).toEqual([{ lon: 7.686856, lat: 45.070339 }]);
  });

  test('should handle error during query', async () => {
    jest
      .spyOn(db, 'query')
      .mockImplementationOnce((sql, params, callback: any) => {
        callback(new Error('Database error'), null);
      });

    const searchCriteria = 'Title';
    const searchTerm = 'Document 1';
    const filters = {};

    await expect(
      documentDAO.getFilteredDocuments(searchCriteria, searchTerm, filters),
    ).rejects.toThrow('Database error');
  });
});
