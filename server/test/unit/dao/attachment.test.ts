import fs from 'fs';

import { Attachment } from '../../../src/components/attachment';
import AttachmentDAO from '../../../src/dao/attachmentDAO';
import db from '../../../src/db/db';

jest.mock('../../../src/db/db');

describe('AttachmentDAO', () => {
  let attachmentDAO: AttachmentDAO;

  beforeEach(() => {
    attachmentDAO = new AttachmentDAO();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAttachments', () => {
    it('should return all attachments', async () => {
      const mockAttachments = [
        {
          attachmentid: 1,
          attachment_name: 'attachment1',
          attachment_pages: 10,
        },
        {
          attachmentid: 2,
          attachment_name: 'attachment2',
          attachment_pages: 20,
        },
      ];
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(null, { rows: mockAttachments });
      });

      const result = await attachmentDAO.getAllAttachments();
      expect(result).toEqual([
        new Attachment(1, 'attachment1', 10, null),
        new Attachment(2, 'attachment2', 20, null),
      ]);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(attachmentDAO.getAllAttachments()).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('getAttachmentById', () => {
    it('should return a specific attachment', async () => {
      const mockAttachment = {
        attachmentid: 1,
        attachment_name: 'attachment1',
        attachment_pages: 10,
        attachment_hash: 'hash1',
      };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockAttachment], rowCount: 1 });
      });
      jest
        .spyOn(fs.promises, 'readFile')
        .mockResolvedValue(Buffer.from('file content'));

      const result = await attachmentDAO.getAttachmentById(1);
      expect(result).toEqual(
        new Attachment(1, 'attachment1', 10, Buffer.from('file content')),
      );
    });

    it('should throw an error if the attachment is not found', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rowCount: 0 });
      });

      await expect(attachmentDAO.getAttachmentById(1)).rejects.toThrow(
        'Attachment not found',
      );
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(attachmentDAO.getAttachmentById(1)).rejects.toThrow(
        'Query failed',
      );
    });

    it('should throw an error if reading the file fails', async () => {
      const mockAttachment = {
        attachmentid: 1,
        attachment_name: 'attachment1',
        attachment_pages: 10,
        attachment_hash: 'hash1',
      };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockAttachment], rowCount: 1 });
      });
      jest
        .spyOn(fs.promises, 'readFile')
        .mockRejectedValue(new Error('File read failed'));

      await expect(attachmentDAO.getAttachmentById(1)).rejects.toThrow(
        'File read failed',
      );
    });
  });

  describe('getAttachmentsByDocId', () => {
    it('should return all attachments linked to a specific document', async () => {
      const mockAttachments = [
        {
          attachmentid: 1,
          attachment_name: 'attachment1',
          attachment_pages: 10,
        },
        {
          attachmentid: 2,
          attachment_name: 'attachment2',
          attachment_pages: 20,
        },
      ];
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: mockAttachments });
      });

      const result = await attachmentDAO.getAttachmentsByDocId(1);
      expect(result).toEqual([
        new Attachment(1, 'attachment1', 10, null),
        new Attachment(2, 'attachment2', 20, null),
      ]);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(attachmentDAO.getAttachmentsByDocId(1)).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('deleteAttachment', () => {
    it('should delete an attachment', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rowCount: 1 });
      });

      const result = await attachmentDAO.deleteAttachment(1, 1);
      expect(result).toBe(true);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(attachmentDAO.deleteAttachment(1, 1)).rejects.toThrow(
        'Unexpected error:Error: Query failed',
      );
    });
  });
});
