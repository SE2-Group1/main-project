import { Document } from '../../../src/components/document';
import DocumentController from '../../../src/controllers/documentController';
import DocumentDAO from '../../../src/dao/documentDAO';

jest.mock('../../../src/dao/documentDAO');

describe('DocumentController', () => {
  let documentController: DocumentController;
  let documentDAO: jest.Mocked<DocumentDAO>;

  beforeEach(() => {
    documentDAO = new DocumentDAO() as jest.Mocked<DocumentDAO>;
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
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
        ['stakeholder1'],
        null,
      );

      expect(result).toBe(1);
      expect(documentDAO.addDocument).toHaveBeenCalledWith(
        'title',
        'desc',
        'scale',
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
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
      documentDAO.addLink.mockResolvedValue(true);

      const result = await documentController.addDocument(
        'title',
        'desc',
        'scale',
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
        ['stakeholder1'],
        [{ doc2: 2, linkType: 'linkType' }],
      );

      expect(result).toBe(1);
      expect(documentDAO.addDocument).toHaveBeenCalledWith(
        'title',
        'desc',
        'scale',
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
      );
      expect(documentDAO.addStakeholderToDocument).toHaveBeenCalledWith(
        1,
        'stakeholder1',
      );
      expect(documentDAO.addLink).toHaveBeenCalledWith(1, 2, 'linkType');
    });

    test('It should throw an error if any stakeholder does not exist', async () => {
      documentDAO.checkStakeholder.mockResolvedValueOnce(false);

      await expect(
        documentController.addDocument(
          'title',
          'desc',
          'scale',
          '2023-10-01',
          'type',
          'language',
          'link',
          'pages',
          ['stakeholder1'],
          null,
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
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
        ['stakeholder1'],
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
          '2023-10-01',
          'type1',
          'language1',
          'link1',
          'pages1',
          ['stakeholder1'],
        ),
        new Document(
          2,
          'title2',
          'desc2',
          'scale2',
          '2023-10-02',
          'type2',
          'language2',
          'link2',
          'pages2',
          ['stakeholder2'],
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
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
        ['stakeholder1'],
      );

      expect(documentDAO.updateDocument).toHaveBeenCalledWith(
        1,
        'title',
        'desc',
        'scale',
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
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
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
        [],
      );

      expect(documentDAO.updateDocument).toHaveBeenCalledWith(
        1,
        'title',
        'desc',
        'scale',
        '2023-10-01',
        'type',
        'language',
        'link',
        'pages',
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
          '2023-10-01',
          'type',
          'language',
          'link',
          'pages',
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

  describe('addLink', () => {
    test('It should create a link between documents', async () => {
      documentDAO.checkLink.mockResolvedValue(true);
      documentDAO.getDocumentById.mockResolvedValue(
        new Document(
          1,
          'title',
          'desc',
          'scale',
          '2023-10-01',
          'type',
          'language',
          'link',
          'pages',
          ['stakeholder1'],
        ),
      );
      documentDAO.getLinkType.mockResolvedValue(true);
      documentDAO.addLink.mockResolvedValue(true);

      const result = await documentController.addLink(1, 2, 'linkType');

      expect(result).toBe(true);
      expect(documentDAO.checkLink).toHaveBeenCalledWith(1, 2, 'linkType');
      expect(documentDAO.getDocumentById).toHaveBeenCalledWith(1);
      expect(documentDAO.getDocumentById).toHaveBeenCalledWith(2);
      expect(documentDAO.getLinkType).toHaveBeenCalledWith('linkType');
      expect(documentDAO.addLink).toHaveBeenCalledWith(1, 2, 'linkType');
    });

    test('It should throw an error if either document does not exist', async () => {
      documentDAO.checkLink.mockResolvedValue(true);
      documentDAO.getDocumentById.mockRejectedValueOnce(
        new Error('Document not found'),
      );

      await expect(
        documentController.addLink(1, 2, 'linkType'),
      ).rejects.toThrow('Document not found');
    });
  });

  describe('getCoordinates', () => {
    test('It should retrieve the coordinates and the IDs of all documents', async () => {
      const testValues = [
        {
          document_id: 1,
          coordinates: [
            { lat: 41.8902, lon: 12.4924 },
          ],
        },
        {
          document_id: 2,
          coordinates: [
            { lat: 41.8922, lon: 12.4944 },
            { lat: 41.8932, lon: 12.4954 },
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
          pages: 'testPages',
          area: [{ lat: 41.8902, lon: 12.4924 }],
        };
      documentDAO.getGeoreferenceById.mockResolvedValue(testGeoreference);

      const result = await documentController.getGeoreference(1);

      expect(result).toEqual(testGeoreference);
      expect(documentDAO.getGeoreferenceById).toHaveBeenCalledWith(1);
    });
  });
});
