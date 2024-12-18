import { Attachment } from '../components/attachment';
import AttachmentDAO from '../dao/attachmentDAO';

class AttachmentController {
  private dao: AttachmentDAO;

  constructor() {
    this.dao = new AttachmentDAO();
  }

  async getAllAttachments(): Promise<Attachment[]> {
    return this.dao.getAllAttachments();
  }

  async getAttachmentById(id: number): Promise<Attachment> {
    return this.dao.getAttachmentById(id);
  }

  async getAttachmentsByDocId(docId: number): Promise<Attachment[]> {
    return this.dao.getAttachmentsByDocId(docId);
  }

  async deleteAttachment(
    attachmentId: number,
    docId: number,
  ): Promise<boolean> {
    return this.dao.deleteAttachment(attachmentId, docId);
  }
}

export default AttachmentController;
