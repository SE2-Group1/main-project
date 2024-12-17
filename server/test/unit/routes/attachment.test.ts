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
import AttachmentController from '../../../src/controllers/attachmentController';
import Authenticator from '../../../src/routers/auth';

const baseURL = '/kiruna/api/attachments';

jest.mock('../../../src/controllers/attachmentController');
jest.mock('../../../src/routers/auth');

describe('Attachment routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /attachments', () => {
    test('It should return a 200 success code with a list of attachments', async () => {
      const mockAttachments = [
        { id: 1, name: 'Attachment1', file: null },
        { id: 2, name: 'Attachment2', file: null },
      ];
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(AttachmentController.prototype, 'getAllAttachments')
        .mockResolvedValueOnce(mockAttachments);

      const response = await request(app).get(baseURL);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAttachments);
      expect(
        AttachmentController.prototype.getAllAttachments,
      ).toHaveBeenCalledTimes(1);
    });

    test('It should return a 503 error if there is a server error', async () => {
      jest
        .spyOn(Authenticator.prototype, 'isAdminOrUrbanPlanner')
        .mockImplementation((req, res, next) => next());

      jest
        .spyOn(AttachmentController.prototype, 'getAllAttachments')
        .mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app).get(baseURL);

      expect(response.status).toBe(503);
      expect(
        AttachmentController.prototype.getAllAttachments,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /attachments/:attachmentId', () => {
    test('It should return a 200 success code for a valid attachment', async () => {
      const mockAttachment = {
        id: 1,
        name: 'Attachment1',
        file: Buffer.from('file content'),
      };
      jest
        .spyOn(AttachmentController.prototype, 'getAttachmentById')
        .mockResolvedValueOnce(mockAttachment);

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/octet-stream');
      expect(response.header['content-disposition']).toBe(
        'inline; filename="Attachment1"',
      );
      expect(response.body).toEqual(Buffer.from('file content'));
      expect(
        AttachmentController.prototype.getAttachmentById,
      ).toHaveBeenCalledTimes(1);
      expect(
        AttachmentController.prototype.getAttachmentById,
      ).toHaveBeenCalledWith('1');
    });

    test('It should return a 404 error if the attachment is not found', async () => {
      jest
        .spyOn(AttachmentController.prototype, 'getAttachmentById')
        .mockRejectedValueOnce(new Error('Attachment not found'));

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('Attachment not found');
      expect(
        AttachmentController.prototype.getAttachmentById,
      ).toHaveBeenCalledTimes(1);
      expect(
        AttachmentController.prototype.getAttachmentById,
      ).toHaveBeenCalledWith('1');
    });

    test('It should return a 404 error for an invalid attachment ID', async () => {
      const response = await request(app).get(`${baseURL}/invalid-id`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('Invalid attachment ID');
    });

    test('It should return a 404 error if the file buffer is not available', async () => {
      const mockAttachment = { id: 1, name: 'Attachment1', file: null };
      jest
        .spyOn(AttachmentController.prototype, 'getAttachmentById')
        .mockResolvedValueOnce(mockAttachment);

      const response = await request(app).get(`${baseURL}/1`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('File buffer not available');
      expect(
        AttachmentController.prototype.getAttachmentById,
      ).toHaveBeenCalledTimes(1);
      expect(
        AttachmentController.prototype.getAttachmentById,
      ).toHaveBeenCalledWith('1');
    });
  });

  describe('GET /attachments/doc/:docId', () => {
    test('It should return a 200 success code with a list of attachments linked to a document', async () => {
      const mockAttachments = [
        { id: 1, name: 'Attachment1', file: null },
        { id: 2, name: 'Attachment2', file: null },
      ];
      jest
        .spyOn(AttachmentController.prototype, 'getAttachmentsByDocId')
        .mockResolvedValueOnce(mockAttachments);

      const response = await request(app).get(`${baseURL}/doc/1`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAttachments);
      expect(
        AttachmentController.prototype.getAttachmentsByDocId,
      ).toHaveBeenCalledTimes(1);
      expect(
        AttachmentController.prototype.getAttachmentsByDocId,
      ).toHaveBeenCalledWith('1');
    });

    test('It should return a 200 if no attachments are found for the document', async () => {
      jest
        .spyOn(AttachmentController.prototype, 'getAttachmentsByDocId')
        .mockResolvedValueOnce([]);

      const response = await request(app).get(`${baseURL}/doc/1`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('[]');
      expect(
        AttachmentController.prototype.getAttachmentsByDocId,
      ).toHaveBeenCalledTimes(1);
      expect(
        AttachmentController.prototype.getAttachmentsByDocId,
      ).toHaveBeenCalledWith('1');
    });

    test('It should return a 503 error if there is a server error', async () => {
      jest
        .spyOn(AttachmentController.prototype, 'getAttachmentsByDocId')
        .mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app).get(`${baseURL}/doc/1`);

      expect(response.status).toBe(503);
      expect(
        AttachmentController.prototype.getAttachmentsByDocId,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /attachments/:attachmentId/:docId', () => {
    test('It should return a 200 success code when an attachment is deleted', async () => {
      jest
        .spyOn(AttachmentController.prototype, 'deleteAttachment')
        .mockResolvedValueOnce(true);

      const response = await request(app).delete(`${baseURL}/1/1`);

      expect(response.status).toBe(200);
      expect(
        AttachmentController.prototype.deleteAttachment,
      ).toHaveBeenCalledTimes(1);
      expect(
        AttachmentController.prototype.deleteAttachment,
      ).toHaveBeenCalledWith('1', '1');
    });

    test('It should return a 503 error if there is a server error', async () => {
      jest
        .spyOn(AttachmentController.prototype, 'deleteAttachment')
        .mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app).delete(`${baseURL}/1/1`);

      expect(response.status).toBe(503);
      expect(
        AttachmentController.prototype.deleteAttachment,
      ).toHaveBeenCalledTimes(1);
      expect(
        AttachmentController.prototype.deleteAttachment,
      ).toHaveBeenCalledWith('1', '1');
    });
  });
});
