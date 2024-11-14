import { Document } from '../../../src/components/document';
import DocumentController from '../../../src/controllers/documentController';
import DocumentDAO from '../../../src/dao/documentDAO';
import LinkDAO from '../../../src/dao/linkDAO';

jest.mock('../../../src/dao/documentDAO');
jest.mock('../../../src/dao/linkDAO');

describe('DocumentController', () => {
  let documentController: DocumentController;
  let documentDAO: jest.Mocked<DocumentDAO>;
  let linkDAO: jest.Mocked<LinkDAO>;

  beforeEach(() => {
    linkDAO = new LinkDAO() as jest.Mocked<LinkDAO>;
    documentDAO = new DocumentDAO(linkDAO) as jest.Mocked<DocumentDAO>;

    documentController = new DocumentController();
    documentController['dao'] = documentDAO;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('addDocument', () => {
    test('It should create a document and return the document ID', async () => {
      documentDAO.checkStakeholder.mockResolvedValue(true);
      documentDAO.checkDocumentType.mockResolvedValue(true);
      documentDAO.checkLanguage.mockResolvedValue(true);
      documentDAO.checkScale.mockResolvedValue(true);
      documentDAO.addDocument.mockResolvedValue(1);
      documentDAO.addStakeholderToDocument.mockResolvedValue(true);

      const result = await documentController.addDocument(
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        'year',
        'month',
        'day',
        1,
        ['stakeholder1'],
      );

      expect(result).toBe(1);
      expect(documentDAO.addDocument).toHaveBeenCalledWith(
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        'year',
        'month',
        'day',
        1,
      );
      expect(documentDAO.addStakeholderToDocument).toHaveBeenCalledWith(
        1,
        'stakeholder1',
      );
    });

    test('It should create a document with connections', async () => {
      documentDAO.checkStakeholder.mockResolvedValue(true);
      documentDAO.checkDocumentType.mockResolvedValue(true);
      documentDAO.checkLanguage.mockResolvedValue(true);
      documentDAO.checkScale.mockResolvedValue(true);
      documentDAO.addDocument.mockResolvedValue(1);
      documentDAO.addStakeholderToDocument.mockResolvedValue(true);
      linkDAO.addLink.mockResolvedValue(true);

      const result = await documentController.addDocument(
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        'year',
        'month',
        'day',
        1,
        ['stakeholder1'],
      );

      expect(result).toBe(1);
      expect(documentDAO.addDocument).toHaveBeenCalledWith(
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        'year',
        'month',
        'day',
        1,
      );
      expect(documentDAO.addStakeholderToDocument).toHaveBeenCalledWith(
        1,
        'stakeholder1',
      );
    });

    test('It should throw an error if any stakeholder does not exist', async () => {
      documentDAO.checkStakeholder.mockResolvedValueOnce(false);

      await expect(
        documentController.addDocument(
          'title',
          'desc',
          'scale',
          'type',
          'language',
          'pages',
          'year',
          'month',
          'day',
          1,
          ['stakeholder1'],
        ),
      ).rejects.toThrow('One or more stakeholders do not exist');
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
        'pages',
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
          'pages1',
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
          'pages2',
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

      await documentController.updateDocument(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        'year',
        'month',
        'day',
        1,
        ['stakeholder1'],
      );

      expect(documentDAO.updateDocument).toHaveBeenCalledWith(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        'year',
        'month',
        'day',
        1,
      );
      expect(documentDAO.deleteStakeholdersFromDocument).toHaveBeenCalledWith(
        1,
      );
      expect(documentDAO.addStakeholderToDocument).toHaveBeenCalledWith(
        1,
        'stakeholder1',
      );
    });

    test('It should update a document with no stakeholders', async () => {
      documentDAO.checkDocumentType.mockResolvedValue(true);
      documentDAO.checkLanguage.mockResolvedValue(true);
      documentDAO.checkScale.mockResolvedValue(true);
      documentDAO.updateDocument.mockResolvedValue(true);
      documentDAO.deleteStakeholdersFromDocument.mockResolvedValue(true);

      await documentController.updateDocument(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        'year',
        'month',
        'day',
        1,
        [],
      );

      expect(documentDAO.updateDocument).toHaveBeenCalledWith(
        1,
        'title',
        'desc',
        'scale',
        'type',
        'language',
        'pages',
        'year',
        'month',
        'day',
        1,
      );
      expect(documentDAO.deleteStakeholdersFromDocument).toHaveBeenCalledWith(
        1,
      );
    });

    test('It should throw an error if any stakeholder does not exist', async () => {
      documentDAO.checkStakeholder.mockResolvedValueOnce(false);

      await expect(
        documentController.updateDocument(
          1,
          'title',
          'desc',
          'scale',
          'type',
          'language',
          'pages',
          'year',
          'month',
          'day',
          1,
          ['stakeholder1'],
        ),
      ).rejects.toThrow('One or more stakeholders do not exist');
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
          'pages',
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
});
