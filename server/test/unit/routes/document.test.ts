import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import request from 'supertest';

import { app } from '../../../index';
import { Document } from '../../../src/components/document';
import { Link } from '../../../src/components/link';
import DocumentController from '../../../src/controllers/documentController';
import {
  DocumentAreaNotFoundError,
  DocumentNotFoundError,
} from '../../../src/errors/documentError';
import ErrorHandler from '../../../src/helper';
import Authenticator from '../../../src/routers/auth';

const baseURL = '/kiruna/api/documents';

jest.mock('../../../src/controllers/documentController');
jest.mock('../../../src/routers/auth');

describe('Document Routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  //addDocument
  //updateDocument
  describe('GET /georeference', () => {
    test('It should return coordinates with a 200 status code', async () => {
      const mockValue = [
        {
          docId: 1,
          title: 'Document 1',
          type: 'Residential',
          coordinates: [
            { lat: 12.34, lon: 56.78 },
            { lat: 87.65, lon: 43.21 },
          ],
        },
        {
          docId: 2,
          title: 'Document 2',
          type: 'Commercial',
          coordinates: [{ lat: 98.76, lon: 54.32 }],
        },
      ];
      jest
        .spyOn(DocumentController.prototype, 'getCoordinates')
        .mockResolvedValueOnce(mockValue);

      const response = await request(app).get(`${baseURL}/georeference`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockValue);
      expect(DocumentController.prototype.getCoordinates).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('GET /:id/georeference', () => {
    test('It should return georeference data with a 200 status code', async () => {
      const mockData = { id: 1, name: 'Test Georeference' };
      jest
        .spyOn(DocumentController.prototype, 'getGeoreference')
        .mockResolvedValueOnce(mockData);

      const response = await request(app).get(`${baseURL}/1/georeference`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(DocumentController.prototype.getGeoreference).toHaveBeenCalledWith(
        1,
      );
    });

    test('It should return 404 if georeference data is not found', async () => {
      jest
        .spyOn(DocumentController.prototype, 'getGeoreference')
        .mockRejectedValueOnce(new Error('Not Found'));

      const response = await request(app).get(`${baseURL}/999/georeference`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Not Found' });
    });
  });

  describe('GET /:id', () => {
    test('It should return a document with a 200 status code', async () => {
      const mockDocument: Document = {
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
        links: [new Link('testDoc', 'testLink')],
      };
      jest
        .spyOn(DocumentController.prototype, 'getDocumentById')
        .mockResolvedValueOnce(mockDocument);

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocument);
      expect(DocumentController.prototype.getDocumentById).toHaveBeenCalledWith(
        '1',
      );
    });

    test('It should return 404 if the document is not found', async () => {
      jest
        .spyOn(DocumentController.prototype, 'getDocumentById')
        .mockRejectedValueOnce(new DocumentNotFoundError());

      const response = await request(app).get(`${baseURL}/999`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /:id/description', () => {
    test('It should update document description and return 200', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(DocumentController.prototype, 'updateDocumentDescription')
        .mockResolvedValueOnce(true);

      const response = await request(app)
        .put(`${baseURL}/1/description`)
        .send({ desc: 'Updated Description' });

      expect(response.status).toBe(200);
      expect(
        DocumentController.prototype.updateDocumentDescription,
      ).toHaveBeenCalledWith('1', 'Updated Description');
    });
  });

  describe('POST /check-stakeholders', () => {
    test('It should check stakeholders and return 200', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(ErrorHandler.prototype, 'validateRequest')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(DocumentController.prototype, 'checkStakeholder')
        .mockResolvedValueOnce(true);

      const response = await request(app)
        .post(`${baseURL}/check-stakeholders`)
        .send({ stakeholders: ['stakeholder1', 'stakeholder2'] });

      expect(response.status).toBe(200);
      expect(
        DocumentController.prototype.checkStakeholder,
      ).toHaveBeenCalledWith(['stakeholder1', 'stakeholder2']);
    });
  });

  describe('GET /', () => {
    test('It should return all documents with a 200 status code', async () => {
      const mockDocuments: Document[] = [
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
          stakeholder: ['stakeholder'],
          links: [new Link('testDoc', 'testLink')],
        },
        {
          id_file: 2,
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
          links: [new Link('testDoc', 'testLink')],
        },
      ];

      jest
        .spyOn(DocumentController.prototype, 'getAllDocuments')
        .mockResolvedValueOnce(mockDocuments);

      const response = await request(app).get(`${baseURL}/`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocuments);
      expect(
        DocumentController.prototype.getAllDocuments,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /:id', () => {
    test('It should delete a document and return a 200 status code', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(DocumentController.prototype, 'deleteDocument')
        .mockResolvedValueOnce(true);

      const response = await request(app).delete(`${baseURL}/1`);

      expect(response.status).toBe(200);
      expect(DocumentController.prototype.deleteDocument).toHaveBeenCalledWith(
        '1',
      );
    });

    test('It should return 404 if the document is not found', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(DocumentController.prototype, 'deleteDocument')
        .mockRejectedValueOnce(new DocumentNotFoundError());

      const response = await request(app).delete(`${baseURL}/999`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /area/:id', () => {
    test('It should return the area with a 200 status code', async () => {
      const mockArea = { id: 1, area: '15489896563495695' };

      jest
        .spyOn(DocumentController.prototype, 'getMunicipalityArea')
        .mockResolvedValueOnce(mockArea);

      const response = await request(app).get(`${baseURL}/area/1`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockArea);
      expect(
        DocumentController.prototype.getMunicipalityArea,
      ).toHaveBeenCalledTimes(1);
    });

    test('It should return 404 if the area is not found', async () => {
      jest
        .spyOn(DocumentController.prototype, 'getMunicipalityArea')
        .mockRejectedValueOnce(new DocumentAreaNotFoundError());

      const response = await request(app).get(`${baseURL}/area/999`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /links', () => {
    test('It should create links and return a 200 status code', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(DocumentController.prototype, 'deleteDocument')
        .mockRejectedValueOnce(new DocumentNotFoundError());

      jest
        .spyOn(DocumentController.prototype, 'addLinks')
        .mockResolvedValueOnce();

      const payload = {
        doc1: 1,
        doc2: 2,
        links: [{ id: 1, type: 'testLink' }],
      };

      const response = await request(app)
        .post(`${baseURL}/links`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(DocumentController.prototype.addLinks).toHaveBeenCalledWith(
        payload.doc1,
        payload.doc2,
        payload.links,
      );
    });
  });
});
