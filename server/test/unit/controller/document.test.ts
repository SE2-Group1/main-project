import { Document } from '../../../src/components/document';
import { Language } from '../../../src/components/language';
import DocumentController from '../../../src/controllers/documentController';
import AreaDAO from '../../../src/dao/areaDAO';
import DocumentDAO from '../../../src/dao/documentDAO';
import LanguageDAO from '../../../src/dao/languageDAO';
import LinkDAO from '../../../src/dao/linkDAO';

jest.mock('../../../src/dao/documentDAO');
jest.mock('../../../src/dao/linkDAO');
jest.mock('../../../src/dao/areaDAO');
jest.mock('../../../src/dao/languageDAO');

describe('DocumentController', () => {
  let documentController: DocumentController;
  let documentDAO: jest.Mocked<DocumentDAO>;
  let linkDAO: jest.Mocked<LinkDAO>;
  let areaDAO: jest.Mocked<AreaDAO>;
  let languageDAO: jest.Mocked<LanguageDAO>;

  beforeEach(() => {
    linkDAO = new LinkDAO() as jest.Mocked<LinkDAO>;
    areaDAO = new AreaDAO() as jest.Mocked<AreaDAO>;
    documentDAO = new DocumentDAO(linkDAO, areaDAO) as jest.Mocked<DocumentDAO>;
    languageDAO = new LanguageDAO() as jest.Mocked<LanguageDAO>;

    documentController = new DocumentController();
    documentController['dao'] = documentDAO;
    documentController['languageDAO'] = languageDAO;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('addDocument', () => {
    test('It should create a document and return the document ID', async () => {
      documentDAO.checkStakeholder.mockResolvedValue(true);
      documentDAO.checkDocumentType.mockResolvedValue(true);
      documentDAO.checkScale.mockResolvedValue(true);
      documentDAO.addDocument.mockResolvedValue(1);
      documentDAO.checkArea.mockResolvedValue(true);
      documentDAO.addStakeholderToDocument.mockResolvedValue(true);
      areaDAO.addArea.mockResolvedValue(1);

      // Mock language retrieval
      languageDAO.getLanguageByName.mockResolvedValue(
        new Language('ENG', 'English'),
      );

      const result = await documentController.addDocument(
        'title',
        'desc',
        'scale',
        'type',
        'English',
        { year: '2000', month: '03', day: '12' },
        1,
        ['stakeholder1'],
        null,
      );

      expect(result).toBe(1);
      expect(documentDAO.addDocument).toHaveBeenCalledWith(
        'title',
        'desc',
        'scale',
        'type',
        'ENG',
        '2000',
        '03',
        '12',
        ['stakeholder1'],
        1,
        null,
      );
    });

    test('It should throw an error if the language name is not found', async () => {
      documentDAO.checkDocumentType.mockResolvedValue(true);
      documentDAO.checkScale.mockResolvedValue(true);
      documentDAO.addDocument.mockResolvedValue(1);
      documentDAO.checkArea.mockResolvedValue(true);
      documentDAO.addStakeholderToDocument.mockResolvedValue(true);
      areaDAO.addArea.mockResolvedValue(1);

      // Simulate language not found
      languageDAO.getLanguageByName.mockRejectedValue(
        new Error("Language 'unknown_language' not found"),
      );

      await expect(
        documentController.addDocument(
          'title',
          'desc',
          'scale',
          'type',
          'unknown_language', // Invalid language
          { year: '2000', month: '03', day: '12' },
          1,
          ['stakeholder1'],
          null,
        ),
      ).rejects.toThrow("Language 'unknown_language' not found");

      expect(documentDAO.checkLanguage).toHaveBeenCalledWith(
        'unknown_language',
      );
    });
  });

  describe('getDocumentById', () => {
    test('It should retrieve a document by ID', async () => {
      const testDocument = new Document(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'year',
        'month',
        'day',
        1,
        ['stakeholder1'],
        [],
      );
      documentDAO.getDocumentById.mockResolvedValue(testDocument);

      const result = await documentController.getDocumentById(1);

      expect(result).toEqual(testDocument);
      expect(documentDAO.getDocumentById).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllDocuments', () => {
    test('It should retrieve all documents', async () => {
      const testDocuments = [
        new Document(
          1,
          'title1',
          'desc1',
          'scale1',
          'type1',
          'language1',
          'year1',
          'month1',
          'day1',
          1,
          ['stakeholder1'],
          [],
        ),
        new Document(
          2,
          'title2',
          'desc2',
          'scale2',
          'type2',
          'language2',
          'year2',
          'month2',
          'day2',
          2,
          ['stakeholder2'],
          [],
        ),
      ];
      documentDAO.getAllDocuments.mockResolvedValue(testDocuments);

      const result = await documentController.getAllDocuments();

      expect(result).toEqual(testDocuments);
      expect(documentDAO.getAllDocuments).toHaveBeenCalled();
    });
  });

  describe('updateDocument', () => {
    test('It should update a document', async () => {
      documentDAO.checkStakeholder.mockResolvedValue(true);
      documentDAO.checkDocumentType.mockResolvedValue(true);
      documentDAO.checkLanguage.mockResolvedValue(true);
      documentDAO.checkScale.mockResolvedValue(true);
      documentDAO.updateDocument.mockResolvedValue(true);
      documentDAO.deleteStakeholdersFromDocument.mockResolvedValue(true);
      documentDAO.addStakeholderToDocument.mockResolvedValue(true);
      languageDAO.getLanguageByName.mockResolvedValueOnce(
        new Language('language', 'language'),
      ); // Solo per una chiamata
      await documentController.updateDocument(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        { year: '2000', month: '05', day: '15' },
        1,
        ['stakeholder1'],
        null,
      );

      expect(documentDAO.updateDocument).toHaveBeenCalledWith(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        '2000',
        '05',
        '15',
        ['stakeholder1'],
        1,
        null,
      );
    });
  });

  describe('deleteDocument', () => {
    test('It should delete a document', async () => {
      documentDAO.deleteDocument.mockResolvedValue(true);

      const result = await documentController.deleteDocument(1);

      expect(result).toBe(true);
      expect(documentDAO.deleteDocument).toHaveBeenCalledWith(1);
    });

    test('It should throw an error if the document does not exist', async () => {
      documentDAO.deleteDocument.mockResolvedValue(false);

      const result = await documentController.deleteDocument(1);

      expect(result).toBe(false);
      expect(documentDAO.deleteDocument).toHaveBeenCalledWith(1);
    });
  });

  describe('updateDocumentDescription', () => {
    test('It should update the description of a document', async () => {
      documentDAO.updateDocumentDesc.mockResolvedValue(true);

      const result = await documentController.updateDocumentDescription(
        1,
        'newDesc',
      );

      expect(result).toBe(true);
      expect(documentDAO.updateDocumentDesc).toHaveBeenCalledWith(1, 'newDesc');
    });

    test('It should return false if the document does not exist', async () => {
      documentDAO.updateDocumentDesc.mockResolvedValue(false);

      const result = await documentController.updateDocumentDescription(
        1,
        'newDesc',
      );

      expect(result).toBe(false);
      expect(documentDAO.updateDocumentDesc).toHaveBeenCalledWith(1, 'newDesc');
    });
  });

  describe('checkStakeholder', () => {
    test('It should check if a stakeholder exists', async () => {
      documentDAO.checkStakeholder.mockResolvedValue(true);

      const result = await documentController.checkStakeholder('stakeholder1');

      expect(result).toBe(true);
      expect(documentDAO.checkStakeholder).toHaveBeenCalledWith('stakeholder1');
    });
  });

  describe('insert/update links', () => {
    test('It should create a link between documents', async () => {
      linkDAO.checkLink.mockResolvedValue(true);
      documentDAO.getDocumentById.mockResolvedValue(
        new Document(
          1,
          'title',
          'desc',
          'scale',
          'type',
          'language',
          'year',
          'month',
          'day',
          1,
          ['stakeholder1'],
          [],
        ),
      );
      const links = [{ type: 'linkType', isValid: true }];
      linkDAO.insertLinks.mockResolvedValue();
      await documentController.addLinks(1, 2, links);

      expect(documentDAO.getDocumentById).toHaveBeenCalledWith(1);
      expect(documentDAO.getDocumentById).toHaveBeenCalledWith(2);
    });

    test('It should throw an error if either document does not exist', async () => {
      linkDAO.checkLink.mockResolvedValue(true);
      documentDAO.getDocumentById.mockRejectedValueOnce(
        new Error('Document not found'),
      );
      const links = [{ type: 'linkType1', isValid: true }];

      await expect(documentController.addLinks(1, 2, links)).rejects.toThrow(
        'Document not found',
      );
    });
  });

  describe('getCoordinates', () => {
    test('It should retrieve the coordinates and the IDs of all documents', async () => {
      const testValues = [
        {
          docId: 1,
          title: 'testName',
          type: 'testType',
          id_area: 1,
          coordinates: [{ lon: 12.4924, lat: 41.8902 }],
        },
        {
          docId: 2,
          title: 'testName',
          type: 'testType',
          id_area: 1,
          coordinates: [
            { lon: 12.4944, lat: 41.8922 },
            { lon: 12.4954, lat: 41.8932 },
          ],
        },
      ];
      documentDAO.getCoordinates.mockResolvedValue(testValues);

      const result = await documentController.getCoordinates();

      expect(result).toEqual(testValues);
      expect(documentDAO.getCoordinates).toHaveBeenCalled();
    });
  });

  describe('getGeoreference', () => {
    test('It should retrieve the georeference and the description of a document', async () => {
      const testGeoreference = {
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
      };
      documentDAO.getGeoreferenceById.mockResolvedValue(testGeoreference);

      const result = await documentController.getGeoreference(1);

      expect(result).toEqual(testGeoreference);
      expect(documentDAO.getGeoreferenceById).toHaveBeenCalledWith(1);
    });
    test('It should throw an error for the catch', async () => {
      documentDAO.getGeoreferenceById.mockRejectedValue(new Error());
      await expect(documentController.getGeoreference(1)).rejects.toThrow();
    });
  });

  describe('getCoordinatesOfArea', () => {
    test('It should retrieve the coordinates of an area', async () => {
      const testCoordinates = [
        { lon: 12.4924, lat: 41.8902 },
        { lon: 12.4934, lat: 41.8912 },
        { lon: 12.4944, lat: 41.8922 },
      ];
      documentDAO.getCoordinatesOfArea.mockResolvedValue(testCoordinates);

      const result = await documentController.getCoordinatesOfArea(1);

      expect(result).toEqual(testCoordinates);
      expect(documentDAO.getCoordinatesOfArea).toHaveBeenCalledWith(1);
    });
  });
});
