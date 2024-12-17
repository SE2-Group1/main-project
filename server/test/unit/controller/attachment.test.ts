import { Attachment } from '../../../src/components/attachment';
import AttachmentController from '../../../src/controllers/attachmentController';
import AttachmentDAO from '../../../src/dao/attachmentDAO';

jest.mock('../../../src/dao/attachmentDAO');

describe('AttachmentController', () => {
  let attachmentController: AttachmentController;
  let mockDAO: jest.Mocked<AttachmentDAO>;

  beforeEach(() => {
    mockDAO = new AttachmentDAO() as jest.Mocked<AttachmentDAO>;
    attachmentController = new AttachmentController();
    (attachmentController as any).dao = mockDAO;
  });

  describe('getAllAttachments', () => {
    it('should return all attachments', async () => {
      const attachments: Attachment[] = [
        new Attachment(1, 'Attachment1', 10, null),
        new Attachment(2, 'Attachment2', 20, null),
      ];
      mockDAO.getAllAttachments.mockResolvedValue(attachments);

      const result = await attachmentController.getAllAttachments();

      expect(result).toEqual(attachments);
      expect(mockDAO.getAllAttachments).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAttachmentById', () => {
    it('should return an attachment by id', async () => {
      const attachment = new Attachment(1, 'Attachment1', 10, null);
      mockDAO.getAttachmentById.mockResolvedValue(attachment);

      const result = await attachmentController.getAttachmentById(1);

      expect(result).toEqual(attachment);
      expect(mockDAO.getAttachmentById).toHaveBeenCalledWith(1);
      expect(mockDAO.getAttachmentById).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAttachmentsByDocId', () => {
    it('should return attachments by document id', async () => {
      const attachments: Attachment[] = [
        new Attachment(1, 'Attachment1', 10, null),
        new Attachment(2, 'Attachment2', 20, null),
      ];
      mockDAO.getAttachmentsByDocId.mockResolvedValue(attachments);

      const result = await attachmentController.getAttachmentsByDocId(1);

      expect(result).toEqual(attachments);
      expect(mockDAO.getAttachmentsByDocId).toHaveBeenCalledWith(1);
      expect(mockDAO.getAttachmentsByDocId).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAttachment', () => {
    it('should delete an attachment by id and document id', async () => {
      mockDAO.deleteAttachment.mockResolvedValue(true);

      const result = await attachmentController.deleteAttachment(1, 1);

      expect(result).toBe(true);
      expect(mockDAO.deleteAttachment).toHaveBeenCalledWith(1, 1);
      expect(mockDAO.deleteAttachment).toHaveBeenCalledTimes(1);
    });
  });
});
